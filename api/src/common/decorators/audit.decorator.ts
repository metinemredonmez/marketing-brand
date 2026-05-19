import { SetMetadata } from "@nestjs/common";

export interface AuditMeta {
  action: string;     // örn: "article.publish"
  resource: string;   // örn: "article"
  /**
   * Path/body/result'tan resourceId nasıl çıkarılacak.
   * Built-in: params.id, body.id, result.id
   * Veya: "params.<paramName>" / "body.<bodyField>"
   */
  resourceIdFrom?: string;
}

export const AUDIT_KEY = "audit_meta";
export const Audit = (meta: AuditMeta) => SetMetadata(AUDIT_KEY, meta);
