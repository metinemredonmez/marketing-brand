// Debug endpoint — browser'ın hangi cookie'leri gönderdiğini görmek için.
// Login sonrası https://213.159.6.225:8443/api/whoami'ye git, JSON'da cookie'leri gör.
// Eğer mr_access ve mr_refresh boş gelirse → browser cookie'yi reddetmiş demektir.
// Doluysa → cookie var, middleware sorunu.

import { NextResponse, type NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const all = req.cookies.getAll();
  return NextResponse.json({
    receivedCookieCount: all.length,
    cookieNames: all.map((c) => c.name),
    mr_access_present: !!req.cookies.get("mr_access")?.value,
    mr_refresh_present: !!req.cookies.get("mr_refresh")?.value,
    rawCookieHeader: req.headers.get("cookie") ?? null,
    userAgent: req.headers.get("user-agent") ?? null,
    host: req.headers.get("host") ?? null,
    xForwardedHost: req.headers.get("x-forwarded-host") ?? null,
    xForwardedProto: req.headers.get("x-forwarded-proto") ?? null,
  });
}
