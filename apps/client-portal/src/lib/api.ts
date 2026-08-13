import { api, tokenStore } from "@/lib/httpClient";
import type {
  BudgetCategory,
  ChecklistPhase,
  ChecklistTask,
  CoupleProfile,
  DocumentFile,
  RsvpGuest,
  UpcomingItem,
  UpdateEvent,
  WebsiteStatus,
} from "@/types";

const STATUS_LABEL: Record<string, string> = {
  "on-track": "On track",
  attention: "Attention",
  "early-planning": "Early planning",
};

// ---------- Auth ----------

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: { id: string; coupleNames: string; partnerA: string; partnerB: string; portalEmail: string };
}

export async function login(email: string, password: string) {
  const result = await api.post<LoginResult>("/api/auth/login", { email, password }, { skipAuth: true });
  tokenStore.setTokens(result.accessToken, result.refreshToken);
  return result.user;
}

export async function logout() {
  const refreshToken = tokenStore.getRefreshToken();
  tokenStore.clear();
  if (refreshToken) {
    try {
      await api.post("/api/auth/logout", { refreshToken });
    } catch {
      // Token is already cleared locally — a failed server-side revoke isn't worth surfacing.
    }
  }
}

// ---------- Profile ----------

interface ProfileResponse {
  partnerA: string;
  partnerB: string;
  coupleNames: string;
  portalEmail: string;
  weddingDate: string;
  venue: string;
  status: string;
  planner: { name: string; role: string };
}

export async function getProfile(): Promise<CoupleProfile> {
  const p = await api.get<ProfileResponse>("/api/me");
  return {
    partnerA: p.partnerA,
    partnerB: p.partnerB,
    email: p.portalEmail,
    weddingDate: p.weddingDate,
    venue: p.venue,
    workspace: p.coupleNames,
    planner: p.planner,
    planningStatus: STATUS_LABEL[p.status] ?? p.status,
  };
}

// ---------- Dashboard ----------

interface DashboardResponse {
  metrics: {
    checklistDone: number;
    checklistTotal: number;
    budgetRemaining: number;
    rsvpAttending: number;
    rsvpTotal: number;
    websiteLive: boolean;
  };
  upcoming: { title: string; detail: string; dueDate: string }[];
  updates: { message: string; timestampUtc: string }[];
}

export interface DashboardData {
  metrics: DashboardResponse["metrics"];
  upcoming: UpcomingItem[];
  updates: UpdateEvent[];
}

export async function getDashboard(): Promise<DashboardData> {
  const d = await api.get<DashboardResponse>("/api/me/dashboard");
  return {
    metrics: d.metrics,
    upcoming: d.upcoming.map((u, i) => ({ id: `uc-${i}`, date: u.dueDate, title: u.title, detail: u.detail })),
    updates: d.updates.map((u, i) => ({ id: `up-${i}`, message: u.message, timestamp: u.timestampUtc })),
  };
}

// ---------- Checklist ----------

export interface ChecklistData {
  phases: ChecklistPhase[];
  tasks: ChecklistTask[];
}

export function getChecklist(): Promise<ChecklistData> {
  return api.get<ChecklistData>("/api/me/checklist");
}

// ---------- Budget ----------

export interface BudgetData {
  totalBudget: number;
  committed: number;
  remaining: number;
  categories: BudgetCategory[];
}

export function getBudget(): Promise<BudgetData> {
  return api.get<BudgetData>("/api/me/budget");
}

// ---------- RSVPs ----------

export function getRsvps(): Promise<RsvpGuest[]> {
  return api.get<RsvpGuest[]>("/api/me/rsvps");
}

// ---------- Documents ----------

interface DocumentFileResponse {
  id: string;
  name: string;
  category: string;
  uploader: string;
  sizeLabel: string;
  uploadedAt: string;
  url: string | null;
  contentType: string | null;
}

export async function getDocuments(): Promise<DocumentFile[]> {
  const list = await api.get<DocumentFileResponse[]>("/api/me/documents");
  return list.map((d) => ({ ...d, url: d.url ?? undefined, fileType: d.contentType ?? undefined }));
}

// ---------- Website ----------

export function getWebsiteStatus(): Promise<WebsiteStatus> {
  return api.get<WebsiteStatus>("/api/me/website");
}
