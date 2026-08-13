import type { SiteConfig } from "@/types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

interface ApiEnvelope<T> {
  message: string;
  code: number;
  data: T | null;
}

export class ApiError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

export async function getSite(slug: string): Promise<SiteConfig> {
  const res = await fetch(`${BASE_URL}/api/public/sites/${slug}`);
  const body: ApiEnvelope<SiteConfig> = await res.json();
  if (!res.ok || body.code >= 400 || !body.data) throw new ApiError(body.message, body.code);
  return body.data;
}

export interface SubmitRsvpPayload {
  fullName: string;
  attending: boolean;
  attendanceCount?: number;
  dietary?: string;
}

export async function submitRsvp(slug: string, payload: SubmitRsvpPayload): Promise<void> {
  const res = await fetch(`${BASE_URL}/api/public/sites/${slug}/rsvp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body: ApiEnvelope<object> = await res.json();
  if (!res.ok || body.code >= 400) throw new ApiError(body.message, body.code);
}
