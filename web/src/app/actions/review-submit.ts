"use server";

import { headers } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface ReviewSubmitState {
  ok: boolean;
  message: string;
}

export async function submitAgencyReview(
  agencyId: string,
  _prev: ReviewSubmitState | null,
  formData: FormData,
): Promise<ReviewSubmitState> {
  const dto = {
    reviewerName: formData.get("reviewerName") as string,
    reviewerRole: formData.get("reviewerRole") as string,
    reviewerEmail: formData.get("reviewerEmail") as string,
    reviewerCompany: formData.get("reviewerCompany") as string,
    reviewerLinkedin: formData.get("reviewerLinkedin") as string,
    projectType: (formData.get("projectType") as string) || undefined,
    projectBudgetRange:
      (formData.get("projectBudgetRange") as string) || undefined,
    ratingOverall: Number(formData.get("ratingOverall")),
    ratingQuality: Number(formData.get("ratingQuality")),
    ratingCommunication: Number(formData.get("ratingCommunication")),
    ratingTimeline: Number(formData.get("ratingTimeline")),
    ratingValue: Number(formData.get("ratingValue")),
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    pros: (formData.get("pros") as string) || undefined,
    cons: (formData.get("cons") as string) || undefined,
    wouldWorkAgain: (formData.get("wouldWorkAgain") as string) || undefined,
    consent: formData.get("consent") === "on",
  };

  if (!dto.consent) {
    return { ok: false, message: "KVKK onayı zorunlu" };
  }

  const hdrs = await headers();
  const ip = (
    hdrs.get("x-forwarded-for") ?? hdrs.get("x-real-ip") ?? ""
  ).split(",")[0]?.trim();

  try {
    const res = await fetch(
      `${API_URL}/api/v1/agencies/${agencyId}/reviews`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(ip ? { "X-Forwarded-For": ip } : {}),
        },
        body: JSON.stringify(dto),
      },
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      return {
        ok: false,
        message: body.message ?? "Review gönderilemedi",
      };
    }

    const result = await res.json();
    return { ok: true, message: result.message ?? "Review alındı." };
  } catch (e) {
    return { ok: false, message: "Bağlantı hatası" };
  }
}
