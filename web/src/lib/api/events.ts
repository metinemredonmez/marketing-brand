import { apiFetch } from "./client";

export type EventType =
  | "summit"
  | "workshop"
  | "webinar"
  | "meetup"
  | "awards";

export type EventStatus =
  | "draft"
  | "announced"
  | "registration_open"
  | "sold_out"
  | "in_progress"
  | "completed"
  | "canceled";

export interface EventItem {
  id: string;
  slug: string;
  type: EventType;
  title: string;
  description: string | null;
  coverUrl: string | null;
  startsAt: string;
  endsAt: string | null;
  venue: string | null;
  city: string | null;
  capacity: number | null;
  registeredCount: number;
  status: EventStatus;
}

export const listEvents = () =>
  apiFetch<EventItem[]>("/events", { revalidate: 300 });

export const getEvent = (slug: string) =>
  apiFetch<EventItem>(`/events/${slug}`, { revalidate: 300 });
