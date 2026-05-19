// Route handler login — server action'ın cookie set sorununa garantili çözüm.
// API'ye fetch atar, gelen Set-Cookie header'larını response'a olduğu gibi forward eder.
// Next.js cookie store kullanmaz → cookie commit garantisi 100%.

import { NextResponse, type NextRequest } from "next/server";

const API_URL =
  process.env.INTERNAL_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

const ADMIN_ROLES = [
  "super_admin",
  "editor",
  "writer",
  "social_manager",
  "sales",
];

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json({ message: "E-posta + şifre zorunlu" }, { status: 400 });
  }

  // API'ye login at
  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    return NextResponse.json({ message: "Bağlantı hatası" }, { status: 502 });
  }

  // Hata varsa olduğu gibi forward
  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(
      { message: data.message ?? "Giriş başarısız" },
      { status: upstream.status },
    );
  }

  const data = await upstream.json();

  // Role kontrolü
  if (!ADMIN_ROLES.includes(data.user?.role)) {
    return NextResponse.json(
      { message: "Bu hesap admin paneline erişemez." },
      { status: 403 },
    );
  }

  // Set-Cookie header'larını al — getSetCookie() Node 19+, raw() node-fetch
  let setCookies: string[] = [];
  const headersExt = upstream.headers as Headers & {
    getSetCookie?: () => string[];
    raw?: () => Record<string, string[]>;
  };
  if (typeof headersExt.getSetCookie === "function") {
    setCookies = headersExt.getSetCookie();
  } else if (typeof headersExt.raw === "function") {
    setCookies = headersExt.raw()["set-cookie"] ?? [];
  } else {
    const single = upstream.headers.get("set-cookie");
    if (single) setCookies = [single];
  }

  // Response oluştur — Set-Cookie'leri manuel append
  const res = NextResponse.json({
    ok: true,
    user: data.user,
    redirectTo: "/",
    // Debug — kaç cookie forward edildi (browser network tab'da görünür)
    _cookiesForwarded: setCookies.length,
  });
  for (const cookie of setCookies) {
    res.headers.append("set-cookie", cookie);
  }
  return res;
}
