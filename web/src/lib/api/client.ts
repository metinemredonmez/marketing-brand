// API client — RSC + Server Action + Route Handler için kullanılabilir.
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

export interface ApiErrorBody {
  statusCode: number;
  errorCode: string;
  message: string;
  details?: unknown;
  traceId: string;
}

interface FetchOpts extends Omit<RequestInit, "body"> {
  body?: unknown;
  revalidate?: number | false;
  withCookies?: boolean;
}

export async function apiFetch<T = unknown>(
  path: string,
  opts: FetchOpts = {},
): Promise<T> {
  const { revalidate = 60, withCookies = true, headers, body, ...rest } = opts;

  let cookieHeader: string | undefined;
  if (withCookies) {
    try {
      cookieHeader = (await cookies()).toString();
    } catch {
      // Cookies() Server Component dışında çağrılırsa fail edebilir
    }
  }

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
    let errorBody: unknown;
    try {
      errorBody = await res.json();
    } catch {
      errorBody = await res.text();
    }
    throw new ApiError(res.status, errorBody);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export async function getCurrentUser(): Promise<null | {
  id: string;
  email: string;
  fullName: string;
  role: string;
}> {
  try {
    return await apiFetch("/users/me", { revalidate: false });
  } catch {
    return null;
  }
}
