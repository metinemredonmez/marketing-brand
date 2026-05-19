"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface AiGenerateResult {
  ok: boolean;
  message?: string;
  data?: Record<string, unknown>;
}

export async function generateAll(
  sourceText: string,
  provider: "openai" | "anthropic" = "openai",
): Promise<AiGenerateResult> {
  const cookieStr = (await cookies()).toString();
  try {
    const res = await fetch(
      `${API_URL}/api/v1/admin/ai/generate-all`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieStr,
        },
        body: JSON.stringify({ sourceText, provider }),
        cache: "no-store",
      },
    );
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        ok: false,
        message: body.message ?? "AI üretim başarısız",
      };
    }
    return { ok: true, data: await res.json() };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function getUsage() {
  const cookieStr = (await cookies()).toString();
  try {
    const res = await fetch(`${API_URL}/api/v1/admin/ai/usage`, {
      headers: { Cookie: cookieStr },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
