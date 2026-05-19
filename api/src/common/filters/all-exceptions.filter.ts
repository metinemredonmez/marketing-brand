import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import * as Sentry from "@sentry/node";

export interface ApiErrorBody {
  statusCode: number;
  errorCode: string;
  message: string;
  details?: unknown;
  traceId: string;
  path: string;
  timestamp: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const traceId =
      (request.headers["x-request-id"] as string) || randomUUID();

    const { statusCode, errorCode, message, details } =
      this.normalize(exception);

    if (statusCode >= 500) {
      this.logger.error(
        `[${traceId}] ${request.method} ${request.url} → ${statusCode} ${errorCode}: ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
      if (process.env.SENTRY_DSN) {
        Sentry.captureException(exception, {
          tags: { traceId, errorCode, path: request.url },
          extra: { method: request.method },
        });
      }
    } else if (statusCode >= 400) {
      this.logger.warn(
        `[${traceId}] ${request.method} ${request.url} → ${statusCode} ${errorCode}`,
      );
    }

    const body: ApiErrorBody = {
      statusCode,
      errorCode,
      message,
      details,
      traceId,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    response.setHeader("X-Request-Id", traceId);
    response.status(statusCode).json(body);
  }

  private normalize(exception: unknown): {
    statusCode: number;
    errorCode: string;
    message: string;
    details?: unknown;
  } {
    // 1. HttpException (NestJS built-in, BadRequest/Unauthorized/NotFound vb)
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const res = exception.getResponse();
      const errorCode = this.statusToErrorCode(statusCode);
      if (typeof res === "string") {
        return { statusCode, errorCode, message: res };
      }
      const obj = res as {
        message?: string | string[];
        error?: string;
        statusCode?: number;
      };
      const message = Array.isArray(obj.message)
        ? obj.message.join("; ")
        : (obj.message ?? exception.message);
      return {
        statusCode,
        errorCode: obj.error?.toLowerCase().replace(/\s+/g, "_") || errorCode,
        message,
        details: Array.isArray(obj.message) ? obj.message : undefined,
      };
    }

    // 2. Prisma known errors
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.mapPrismaError(exception);
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        errorCode: "validation_error",
        message: "Geçersiz veri formatı",
        details:
          process.env.NODE_ENV === "production" ? undefined : exception.message,
      };
    }

    // 3. Bilinmeyen — 500
    const err = exception as Error;
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      errorCode: "internal_error",
      message:
        process.env.NODE_ENV === "production"
          ? "Bir hata oluştu"
          : (err.message ?? "Bilinmeyen hata"),
    };
  }

  private mapPrismaError(err: Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002": {
        // Unique constraint
        const target = (err.meta?.target as string[] | string) ?? "field";
        const field = Array.isArray(target) ? target.join(", ") : target;
        return {
          statusCode: HttpStatus.CONFLICT,
          errorCode: "unique_violation",
          message: `Bu ${field} zaten kullanılıyor`,
          details: { fields: target },
        };
      }
      case "P2025":
        return {
          statusCode: HttpStatus.NOT_FOUND,
          errorCode: "not_found",
          message: "Kayıt bulunamadı",
        };
      case "P2003":
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: "foreign_key_violation",
          message: "İlişkili kayıt bulunamadı",
          details: err.meta,
        };
      case "P2014":
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: "relation_violation",
          message: "İlişki kuralı ihlal edildi",
        };
      case "P2000":
        return {
          statusCode: HttpStatus.BAD_REQUEST,
          errorCode: "value_too_long",
          message: "Değer çok uzun",
          details: err.meta,
        };
      default:
        return {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          errorCode: "database_error",
          message: "Veritabanı hatası",
          details:
            process.env.NODE_ENV === "production"
              ? undefined
              : { code: err.code, meta: err.meta },
        };
    }
  }

  private statusToErrorCode(status: number): string {
    const map: Record<number, string> = {
      400: "bad_request",
      401: "unauthorized",
      403: "forbidden",
      404: "not_found",
      409: "conflict",
      422: "unprocessable_entity",
      429: "too_many_requests",
      500: "internal_error",
      503: "service_unavailable",
    };
    return map[status] ?? "error";
  }
}
