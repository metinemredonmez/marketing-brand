// Route handler login — Next.js 15 server action cookie commit bug'ına garantili çözüm.
// API'ye fetch atar, gelen Set-Cookie'lerden SADECE name+value'yu alır,
// kalan tüm attribute'leri (Domain/Secure/SameSite) kendimiz kontrollü set ederiz.
// Bu sayede API ne gönderirse göndersin browser kabul eder.

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

// Self-signed cert + IP setup'ında Secure cookie browser tarafından reddedilir.
// STRIP_SECURE_COOKIES=true ile Secure flag'i sökeriz, gerçek domain'e geçince false yap.
const STRIP_SECURE =
  process.env.STRIP_SECURE_COOKIES === "true" ||
  process.env.COOKIE_SECURE === "false";

export async function POST(req: NextRequest) {
  let body: { email?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Geçersiz istek" }, { status: 400 });
  }

  const { email, password } = body;
  if (!email || !password) {
    return NextResponse.json(
      { message: "E-posta + şifre zorunlu" },
      { status: 400 },
    );
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

  // Set-Cookie header'larını al — Node 19+ getSetCookie() / node-fetch raw() fallback
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

  const res = NextResponse.json({
    ok: true,
    user: data.user,
    redirectTo: "/",
    _debug: {
      cookiesFromUpstream: setCookies.length,
      cookieNames: setCookies.map((c) => c.split(";")[0].split("=")[0]),
      stripSecure: STRIP_SECURE,
    },
  });

  // Cookie'leri TEK TEK parse et, attribute'leri SIFIRDAN biz set et.
  // Bu sayede API'nin gönderdiği Domain= veya başka bozuk attribute browser'a ulaşmaz.
  for (const raw of setCookies) {
    if (!raw) continue;
    const [main] = raw.split(";");
    const eq = main.indexOf("=");
    if (eq < 0) continue;
    const name = main.slice(0, eq).trim();
    const value = main.slice(eq + 1).trim();
    if (!name || !value) continue;

    // Cookie ömrü
    const maxAge =
      name === "mr_access"
        ? 15 * 60
        : name === "mr_refresh"
          ? 30 * 24 * 60 * 60
          : 60 * 60;

    res.cookies.set({
      name,
      value,
      httpOnly: true,
      // Self-signed IP setup'ta Secure false. Real domain'e geçince true olur.
      secure: !STRIP_SECURE,
      sameSite: "lax",
      path: "/",
      maxAge,
      // Domain attribute kasıtlı yok — host-only cookie olarak set ediyoruz.
      // Bu sayede IP, sslip.io veya gerçek domain — fark etmez, kabul edilir.
    });
  }

  return res;
}
