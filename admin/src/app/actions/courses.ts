"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function call(path: string, method: string, body?: unknown) {
  const cookieStr = (await cookies()).toString();
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    method,
    headers: { "Content-Type": "application/json", Cookie: cookieStr },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(b.message ?? `API ${res.status}`);
  }
  return res.json();
}

export async function createCourse(input: {
  title: string;
  subtitle?: string;
  description?: string;
  format: string;
  level?: string;
  durationWeeks?: number;
  priceTry: number;
  earlyBirdPriceTry?: number;
  capacity?: number;
}) {
  try {
    const data = await call("/admin/courses", "POST", input);
    revalidatePath("/akademi");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function createCohort(
  courseId: string,
  input: {
    cohortNumber: number;
    startDate: string;
    endDate: string;
    capacity?: number;
    zoomLink?: string;
  },
) {
  try {
    const data = await call(
      `/admin/courses/${courseId}/cohorts`,
      "POST",
      input,
    );
    revalidatePath("/akademi");
    return { ok: true, data };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}

export async function setCohortStatus(cohortId: string, status: string) {
  try {
    await call(`/admin/courses/cohorts/${cohortId}/status`, "PATCH", {
      status,
    });
    revalidatePath("/akademi");
    return { ok: true };
  } catch (e) {
    return { ok: false, message: (e as Error).message };
  }
}
