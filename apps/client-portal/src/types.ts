export interface CoupleProfile {
  partnerA: string;
  partnerB: string;
  email: string;
  weddingDate: string;
  venue: string;
  workspace: string;
  planner: { name: string; role: string };
  planningStatus: string;
}

export type ChecklistTaskStatus = "done" | "open" | "blocked";

export interface ChecklistPhase {
  id: string;
  title: string;
  description?: string;
  order: number;
}

export interface ChecklistTask {
  id: string;
  phaseId: string;
  title: string;
  status: ChecklistTaskStatus;
  dueDate?: string;
  note?: string;
}

export interface BudgetExpense {
  id: string;
  vendor: string;
  note?: string;
  budgeted: number;
  paid: number;
  nextDue?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  committed: number;
  trend: "up" | "down";
  expenses: BudgetExpense[];
}

export type RsvpStatus = "attending" | "declined" | "awaiting";

export interface RsvpGuest {
  id: string;
  household: string;
  status: RsvpStatus;
  attendanceCount?: number;
  dietary?: string;
  note?: string;
  respondedAt?: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  category: string;
  uploader: string;
  sizeLabel: string;
  uploadedAt: string;
  url?: string;
  fileType?: string;
}

export interface UpdateEvent {
  id: string;
  message: string;
  timestamp: string;
}

export interface UpcomingItem {
  id: string;
  date: string;
  title: string;
  detail: string;
}

export interface WebsiteStatus {
  isLive: boolean;
  siteUrl: string;
}
