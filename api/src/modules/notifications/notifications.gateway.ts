import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Server, Socket } from "socket.io";

const ADMIN_ROOM = "admin-notifications";

@WebSocketGateway({
  cors: { origin: true, credentials: true },
  namespace: "/notifications",
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    const token =
      (client.handshake.auth?.token as string | undefined) ??
      client.handshake.headers.authorization?.replace(/^Bearer\s+/, "") ??
      this.extractCookieToken(client.handshake.headers.cookie);

    if (!token) {
      client.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwt.verifyAsync(token, {
        secret: this.config.get<string>("JWT_SECRET"),
      });
      const user = { id: payload.sub, email: payload.email, role: payload.role };
      // Sadece admin/editör rollerini kabul et
      const allowedRoles = [
        "super_admin",
        "editor",
        "writer",
        "social_manager",
        "sales",
      ];
      if (!allowedRoles.includes(user.role)) {
        client.disconnect(true);
        return;
      }
      (client as Socket & { user?: typeof user }).user = user;
      await client.join(ADMIN_ROOM);
      await client.join(`user-${user.id}`); // kullanıcıya özel kanal
      client.emit("connected", { userId: user.id });
      this.logger.debug(`Notifications connected: ${user.email}`);
    } catch {
      client.disconnect(true);
    }
  }

  handleDisconnect() {
    // no-op
  }

  /** Tüm bağlı admin'lere yayın */
  emitNotification(notification: {
    id: string;
    type: string;
    title: string;
    userId?: string | null;
    [k: string]: unknown;
  }) {
    if (notification.userId) {
      // Belirli bir kullanıcıya
      this.server
        ?.to(`user-${notification.userId}`)
        .emit("notification", notification);
    } else {
      // Broadcast: tüm admin
      this.server?.to(ADMIN_ROOM).emit("notification", notification);
    }
  }

  private extractCookieToken(cookieHeader?: string): string | undefined {
    if (!cookieHeader) return undefined;
    const match = cookieHeader.match(/mr_access=([^;]+)/);
    return match?.[1];
  }
}
