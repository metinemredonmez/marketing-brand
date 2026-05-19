import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable, tap, catchError, throwError } from "rxjs";
import { PrismaService } from "../../shared/prisma/prisma.service";
import { AUDIT_KEY, AuditMeta } from "../decorators/audit.decorator";

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const meta = this.reflector.getAllAndOverride<AuditMeta | undefined>(
      AUDIT_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!meta) return next.handle();

    const req = context.switchToHttp().getRequest();
    const user = req.user as { id?: string; email?: string } | undefined;
    const ipAddress =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      undefined;
    const userAgent = (req.headers["user-agent"] as string) || undefined;

    return next.handle().pipe(
      tap(async (result) => {
        await this.write(
          meta,
          req,
          user,
          true,
          ipAddress,
          userAgent,
          result,
        );
      }),
      catchError((err) => {
        this.write(
          meta,
          req,
          user,
          false,
          ipAddress,
          userAgent,
          undefined,
          err?.message ?? String(err),
        ).catch(() => undefined);
        return throwError(() => err);
      }),
    );
  }

  private async write(
    meta: AuditMeta,
    req: { params?: Record<string, string>; body?: Record<string, unknown> },
    user: { id?: string; email?: string } | undefined,
    success: boolean,
    ipAddress: string | undefined,
    userAgent: string | undefined,
    result?: unknown,
    errorMessage?: string,
  ): Promise<void> {
    try {
      let resourceId: string | undefined;
      const spec = meta.resourceIdFrom ?? "params.id";
      if (spec === "result.id") {
        resourceId = (result as { id?: string } | undefined)?.id;
      } else if (spec.startsWith("params.")) {
        const field = spec.slice("params.".length);
        resourceId = req.params?.[field];
      } else if (spec.startsWith("body.")) {
        const field = spec.slice("body.".length);
        resourceId = (req.body as Record<string, unknown> | undefined)?.[
          field
        ] as string | undefined;
      } else {
        resourceId = req.params?.id;
      }

      await this.prisma.auditLog.create({
        data: {
          actorId: user?.id ?? null,
          actorEmail: user?.email ?? null,
          action: meta.action,
          resource: meta.resource,
          resourceId: resourceId ?? null,
          success,
          ipAddress: ipAddress?.slice(0, 45) ?? null,
          userAgent: userAgent?.slice(0, 500) ?? null,
          errorMessage: errorMessage ?? null,
        },
      });
    } catch (e) {
      this.logger.warn(`Audit yazılamadı: ${(e as Error).message}`);
    }
  }
}
