// Admin API client — server-side fetch with cookie forwarding
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API ${status}`);
  }
}

interface FetchOpts extends Omit<RequestInit, "body"> {
  body?: unknown;
  revalidate?: number | false;
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: FetchOpts = {},
): Promise<T> {
  const { revalidate = false, headers, body, ...rest } = opts;

  let cookieHeader: string | undefined;
  try {
    cookieHeader = (await cookies()).toString();
  } catch {}

  const init: RequestInit = {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      ...(headers as Record<string, string> | undefined),
    },
  };

  if (body !== undefined) {
    init.body = typeof body === "string" ? body : JSON.stringify(body);
  }

  if (revalidate === false) {
    init.cache = "no-store";
  } else {
    init.next = { revalidate };
  }

  const res = await fetch(`${API_URL}/api/v1${path}`, init);

  if (!res.ok) {
    let errBody: unknown;
    try {
      errBody = await res.json();
    } catch {
      errBody = await res.text();
    }
    throw new ApiError(res.status, errBody);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function getMe(): Promise<null | {
  id: string;
  email: string;
  fullName: string;
  role: string;
}> {
  try {
    return await apiFetch("/users/me");
  } catch {
    return null;
  }
}

export const API_BASE = API_URL;
