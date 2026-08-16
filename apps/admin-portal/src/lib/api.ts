import { api, tokenStore, ApiError } from "@/lib/httpClient";

export { ApiError };

/** Best-effort user-facing message for a caught error — the backend's own validation/error
 * message when available (e.g. "Partner one is required"), a generic fallback otherwise. */
export function errorMessage(e: unknown, fallback = "Something went wrong. Please try again."): string {
  return e instanceof ApiError ? e.message : fallback;
}
import type {
  ActivityEvent,
  AdminUser,
  BudgetCategory,
  BudgetExpense,
  Client,
  ClientCredentials,
  ClientStatus,
  ChecklistPhase,
  ChecklistTask,
  DocumentFile,
  MilestoneItem,
  RsvpGuest,
  Vendor,
  WebsiteContent,
  WebsiteSection,
} from "@/types";

// ---------- Auth ----------

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
}

export async function login(email: string, password: string): Promise<AdminUser> {
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

export function forgotPassword(email: string) {
  return api.post<{ message: string; resetLink: string | null }>("/api/auth/forgot-password", { email }, { skipAuth: true });
}

export function resetPassword(token: string, newPassword: string) {
  return api.post("/api/auth/reset-password", { token, newPassword }, { skipAuth: true });
}

export function getMe() {
  return api.get<AdminUser>("/api/me");
}

export function updateProfile(name: string, email: string) {
  return api.put<AdminUser>("/api/me", { name, email });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return api.put("/api/me/password", { currentPassword, newPassword });
}

// ---------- Clients ----------

interface ClientResponse {
  id: string;
  slug: string;
  coupleNames: string;
  partnerA: string;
  partnerB: string;
  weddingDate: string;
  venue: string;
  guestCount: number;
  status: ClientStatus;
  planningPercent: number;
  budgetTotal: number;
  budgetPaid: number;
  fullPaymentDueDate?: string;
  currency: string;
  nextAttention: string;
  avatarInitials: string;
  portalEmail: string;
  isArchived: boolean;
}

function toClient(r: ClientResponse): Client {
  return { ...r };
}

export async function getClients(): Promise<Client[]> {
  const list = await api.get<ClientResponse[]>("/api/clients");
  return list.map(toClient);
}

export async function getClient(id: string): Promise<Client> {
  return toClient(await api.get<ClientResponse>(`/api/clients/${id}`));
}

export interface CreateClientPayload {
  partnerA: string;
  partnerB: string;
  contactEmail: string;
  weddingDate: string;
  venue: string;
  guestCount: number;
  currency: string;
  budgetTarget: number;
}

export async function createClient(payload: CreateClientPayload): Promise<{ client: Client; credentials: ClientCredentials }> {
  const result = await api.post<{ client: ClientResponse; credentials: ClientCredentials }>("/api/clients", payload);
  return { client: toClient(result.client), credentials: result.credentials };
}

export interface UpdateClientPayload {
  partnerA: string;
  partnerB: string;
  weddingDate: string;
  venue: string;
  guestCount: number;
  status: ClientStatus;
  currency: string;
  budgetTarget: number;
}

export async function updateClient(id: string, payload: UpdateClientPayload): Promise<Client> {
  return toClient(await api.put<ClientResponse>(`/api/clients/${id}`, payload));
}

export async function updatePortalEmail(id: string, portalEmail: string): Promise<Client> {
  return toClient(await api.put<ClientResponse>(`/api/clients/${id}/portal-email`, { portalEmail }));
}

export function resetPortalPassword(id: string) {
  return api.post<ClientCredentials>(`/api/clients/${id}/portal-password/reset`);
}

export async function archiveClient(id: string): Promise<Client> {
  return toClient(await api.post<ClientResponse>(`/api/clients/${id}/archive`));
}

export async function unarchiveClient(id: string): Promise<Client> {
  return toClient(await api.post<ClientResponse>(`/api/clients/${id}/unarchive`));
}

export async function updateFullPaymentDueDate(id: string, fullPaymentDueDate: string | null): Promise<Client> {
  return toClient(await api.put<ClientResponse>(`/api/clients/${id}/full-payment-due-date`, { fullPaymentDueDate }));
}

// ---------- Dashboard ----------

export interface DashboardMetrics {
  activeWeddings: number;
  dueThisWeek: number;
  overdue: number;
  rsvpDeadlines: number;
  weddingsDone: number;
}

export interface AttentionItem {
  tag: string;
  title: string;
  detail: string;
  clientId: string;
  area: string;
}

export interface MilestoneSummary {
  clientCoupleNames: string;
  clientId: string;
  title: string;
  dueDate: string;
  tag: string;
}

export interface ActivitySummary {
  message: string;
  timestampUtc: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  attentionItems: AttentionItem[];
  upcomingMilestones: MilestoneSummary[];
  recentActivity: ActivitySummary[];
}

export function getDashboard(): Promise<DashboardData> {
  return api.get<DashboardData>("/api/dashboard");
}

export interface ClientActivityData {
  milestones: MilestoneSummary[];
  activity: ActivitySummary[];
}

export function getClientActivity(clientId: string): Promise<ClientActivityData> {
  return api.get<ClientActivityData>(`/api/clients/${clientId}/activity`);
}

// ---------- Checklist ----------

export interface ChecklistData {
  phases: ChecklistPhase[];
  tasks: ChecklistTask[];
}

export function getChecklist(clientId: string): Promise<ChecklistData> {
  return api.get<ChecklistData>(`/api/clients/${clientId}/checklist`);
}

export function addPhase(clientId: string, title: string) {
  return api.post<ChecklistPhase>(`/api/clients/${clientId}/checklist/phases`, { title });
}

export function updatePhase(phaseId: string, title: string, description?: string) {
  return api.put<ChecklistPhase>(`/api/checklist/phases/${phaseId}`, { title, description });
}

export function deletePhase(phaseId: string) {
  return api.delete(`/api/checklist/phases/${phaseId}`);
}

export function addTask(phaseId: string) {
  return api.post<ChecklistTask>(`/api/checklist/phases/${phaseId}/tasks`);
}

export function updateTask(taskId: string, patch: { title: string; note?: string | null; dueDate?: string | null }) {
  return api.put<ChecklistTask>(`/api/checklist/tasks/${taskId}`, patch);
}

export function toggleTask(taskId: string) {
  return api.patch<ChecklistTask>(`/api/checklist/tasks/${taskId}/toggle`);
}

export function deleteTask(taskId: string) {
  return api.delete(`/api/checklist/tasks/${taskId}`);
}

// ---------- Budget ----------

interface BudgetCategoryResponse {
  id: string;
  clientId: string;
  name: string;
  description?: string;
}

interface BudgetResponse {
  categories: BudgetCategoryResponse[];
  expenses: BudgetExpense[];
}

export async function getBudget(clientId: string): Promise<BudgetCategory[]> {
  const { categories, expenses } = await api.get<BudgetResponse>(`/api/clients/${clientId}/budget`);
  return categories.map((c) => ({ ...c, expenses: expenses.filter((e) => e.categoryId === c.id) }));
}

export function addBudgetCategory(clientId: string, name: string) {
  return api.post<BudgetCategoryResponse>(`/api/clients/${clientId}/budget/categories`, { name });
}

export function updateBudgetCategory(categoryId: string, name: string, description?: string) {
  return api.put<BudgetCategoryResponse>(`/api/budget/categories/${categoryId}`, { name, description });
}

export function deleteBudgetCategory(categoryId: string) {
  return api.delete(`/api/budget/categories/${categoryId}`);
}

export function addBudgetExpense(categoryId: string) {
  return api.post<BudgetExpense>(`/api/budget/categories/${categoryId}/expenses`);
}

export function updateBudgetExpense(
  expenseId: string,
  patch: Pick<BudgetExpense, "vendor" | "vendorId" | "description" | "estimated" | "actual" | "paid" | "nextDue">,
) {
  return api.put<BudgetExpense>(`/api/budget/expenses/${expenseId}`, patch);
}

export function deleteBudgetExpense(expenseId: string) {
  return api.delete(`/api/budget/expenses/${expenseId}`);
}

// ---------- Vendors ----------

export function getVendors(): Promise<Vendor[]> {
  return api.get<Vendor[]>("/api/vendors");
}

export function addVendor(name: string, contact: string | undefined, location: string): Promise<Vendor> {
  return api.post<Vendor>("/api/vendors", { name, contact, location });
}

export function updateVendor(vendorId: string, name: string, contact: string | undefined, location: string): Promise<Vendor> {
  return api.put<Vendor>(`/api/vendors/${vendorId}`, { name, contact, location });
}

export function deleteVendor(vendorId: string) {
  return api.delete(`/api/vendors/${vendorId}`);
}

// ---------- RSVPs ----------

export function getRsvps(clientId: string): Promise<RsvpGuest[]> {
  return api.get<RsvpGuest[]>(`/api/clients/${clientId}/rsvps`);
}

export function updateRsvp(
  rsvpId: string,
  patch: Pick<RsvpGuest, "status" | "attendanceCount" | "dietary" | "plannerNote" | "email" | "mobile" | "needsAccommodation" | "needsTransportation">,
) {
  return api.put<RsvpGuest>(`/api/rsvps/${rsvpId}`, patch);
}

export interface GuestEntry {
  household: string;
  email?: string;
  mobile?: string;
}

export function addGuests(clientId: string, guests: GuestEntry[]) {
  return api.post<RsvpGuest[]>(`/api/clients/${clientId}/rsvps`, { guests });
}

// ---------- Documents ----------

interface DocumentFileResponse {
  id: string;
  clientId: string;
  name: string;
  uploader: string;
  visibility: DocumentFile["visibility"];
  category: string;
  sizeLabel: string;
  uploadedAt: string;
  url: string | null;
  contentType: string | null;
}

function toDocument(r: DocumentFileResponse): DocumentFile {
  return { ...r, previewUrl: r.url ?? undefined, fileType: r.contentType ?? undefined };
}

export async function getDocuments(clientId: string): Promise<DocumentFile[]> {
  const list = await api.get<DocumentFileResponse[]>(`/api/clients/${clientId}/documents`);
  return list.map(toDocument);
}

export async function uploadDocument(clientId: string, file: File, category: string, visibility: string): Promise<DocumentFile> {
  const form = new FormData();
  form.append("file", file);
  form.append("category", category);
  form.append("visibility", visibility);
  return toDocument(await api.post<DocumentFileResponse>(`/api/clients/${clientId}/documents`, form, { isFormData: true }));
}

export async function updateDocument(documentId: string, name: string, category: string, visibility: string): Promise<DocumentFile> {
  return toDocument(await api.put<DocumentFileResponse>(`/api/documents/${documentId}`, { name, category, visibility }));
}

export function deleteDocument(documentId: string) {
  return api.delete(`/api/documents/${documentId}`);
}

export function getDocumentCategories(): Promise<string[]> {
  return api.get<string[]>("/api/document-categories");
}

export function addDocumentCategory(name: string): Promise<string[]> {
  return api.post<string[]>("/api/document-categories", { name });
}

// ---------- Website ----------

export function getWebsiteSections(clientId: string): Promise<WebsiteSection[]> {
  return api.get<WebsiteSection[]>(`/api/clients/${clientId}/website/sections`);
}

export function updateSectionStatus(sectionId: string, status: string) {
  return api.patch<WebsiteSection>(`/api/website/sections/${sectionId}/status`, { status });
}

export function getWebsiteContent(clientId: string): Promise<WebsiteContent> {
  return api.get<WebsiteContent>(`/api/clients/${clientId}/website/content`);
}

export function updateWebsiteContent(clientId: string, content: Omit<WebsiteContent, "clientId">): Promise<WebsiteContent> {
  return api.put<WebsiteContent>(`/api/clients/${clientId}/website/content`, content);
}

export async function uploadWebsiteImage(clientId: string, file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const result = await api.post<{ url: string }>(`/api/clients/${clientId}/website/images`, form, { isFormData: true });
  return result.url;
}

// ---------- Team ----------

export function getTeam(): Promise<AdminUser[]> {
  return api.get<AdminUser[]>("/api/admin-users");
}

export interface NewTeamMember {
  user: AdminUser;
  temporaryPassword: string;
}

export function addTeamMember(name: string, email: string, role: string): Promise<NewTeamMember> {
  return api.post<NewTeamMember>("/api/admin-users", { name, email, role });
}

export function removeTeamMember(id: string) {
  return api.delete(`/api/admin-users/${id}`);
}

// ---------- Activity / milestones (portfolio-wide, from the dashboard payload) ----------

export function toActivityEvents(list: ActivitySummary[]): ActivityEvent[] {
  return list.map((a, i) => ({ id: `act-${i}`, message: a.message, timestamp: a.timestampUtc }));
}

export function toMilestones(list: MilestoneSummary[]): MilestoneItem[] {
  return list.map((m, i) => ({ id: `mi-${i}`, clientId: m.clientId, title: m.title, dueDate: m.dueDate, tag: m.tag }));
}
