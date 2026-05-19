import "server-only";
import { apiFetch } from "./client";

export interface CourseListItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  coverUrl: string | null;
  format: string;
  level: string;
  durationWeeks: number | null;
  priceTry: number;
  priceUsd: number;
  earlyBirdPriceTry: number | null;
  capacity: number | null;
  outcomes: string[];
  prerequisites: string[];
  cohorts: Array<{
    id: string;
    cohortNumber: number;
    startDate: string;
    endDate: string;
    enrolledCount: number;
    capacity: number | null;
    status: string;
  }>;
}

export async function listCourses(): Promise<CourseListItem[]> {
  return apiFetch<CourseListItem[]>("/courses", { revalidate: 600 });
}

export async function getCourse(slug: string): Promise<CourseListItem> {
  return apiFetch<CourseListItem>(`/courses/${slug}`, { revalidate: 600 });
}
