export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export type ClientStatus = "on-track" | "attention" | "early-planning";

export interface Client {
  id: string;
  /** URL-safe identifier used for the client/wedding-website portal URLs. */
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
  /** ISO 4217 code (e.g. "USD", "GBP") — set once when the client is added since couples usually
   * think about their budget in their own local currency, not the planner's. */
  currency: string;
  nextAttention: string;
  avatarInitials: string;
  /** Client Portal login the couple uses — set up and reset by the admin, never chosen by the couple. */
  portalEmail: string;
}

/** Only returned right after creating a client or resetting their portal password — the plaintext
 * is never stored server-side, so this is the one moment the admin can see/copy it. */
export interface ClientCredentials {
  portalUrl: string;
  portalEmail: string;
  portalPassword: string;
}

export type ChecklistTaskStatus = "done" | "open" | "blocked";
export type ChecklistPriority = "at-risk" | "due-soon" | "waiting";

export interface ChecklistPhase {
  id: string;
  clientId: string;
  title: string;
  description?: string;
}

export interface ChecklistTask {
  id: string;
  clientId: string;
  phaseId: string;
  title: string;
  status: ChecklistTaskStatus;
  dueDate?: string;
  priority?: ChecklistPriority;
  note?: string;
}

export interface BudgetExpense {
  id: string;
  categoryId: string;
  vendor: string;
  description?: string;
  planned: number;
  agreed: number;
  paid: number;
  nextDue?: string;
}

export interface BudgetCategory {
  id: string;
  clientId: string;
  name: string;
  description?: string;
  expenses: BudgetExpense[];
}

export type RsvpStatus = "attending" | "declined" | "awaiting";

export interface RsvpGuest {
  id: string;
  clientId: string;
  household: string;
  status: RsvpStatus;
  attendanceCount?: number;
  dietary?: string;
  plannerNote?: string;
  respondedAt?: string;
}

export type DocumentVisibility = "client" | "planner-only";

export interface DocumentFile {
  id: string;
  clientId: string;
  name: string;
  uploader: string;
  visibility: DocumentVisibility;
  category: string;
  sizeLabel: string;
  uploadedAt: string;
  /** Object URL captured at upload time so the file can be previewed/downloaded this session.
   * A real backend would return a durable storage URL here instead. */
  previewUrl?: string;
  /** MIME type, used to decide how to render the preview (image vs PDF vs generic). */
  fileType?: string;
}

export interface ActivityEvent {
  id: string;
  clientId?: string;
  message: string;
  timestamp: string;
}

/** "published" = live for guests, "hidden" = built but manually taken down, "draft" = not ready yet. */
export type WebsiteSectionStatus = "published" | "hidden" | "draft";
export type WebsiteSectionKey = "hero" | "our-story" | "details" | "schedule" | "travel" | "gallery" | "rsvp";

export interface WebsiteSection {
  id: string;
  key: WebsiteSectionKey;
  order: number;
  title: string;
  status: WebsiteSectionStatus;
  description: string;
}

export interface WebsiteImage {
  /** Real photo URL once the couple/planner uploads one; label renders as a placeholder until then. */
  url?: string;
  label: string;
}

export interface WebsiteHero {
  eyebrow: string;
  coupleNames: string;
  dateLabel: string;
  venueLabel: string;
  image: WebsiteImage;
}

export interface WebsiteStoryMoment {
  label: string;
  year: string;
}

export interface WebsiteOurStory {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  moments: WebsiteStoryMoment[];
  images: WebsiteImage[];
}

export interface WebsiteDetailCard {
  eyebrow: string;
  heading: string;
  body: string;
  note?: string;
}

export interface WebsiteScheduleEvent {
  time: string;
  title: string;
  detail: string;
}

export interface WebsiteTravelItem {
  heading: string;
  body: string;
}

export interface WebsiteGalleryPhoto extends WebsiteImage {
  caption: string;
}

export interface WebsiteRsvpConfig {
  deadline: string;
  confirmationMessage: string;
  collectDietary: boolean;
  collectPlusOne: boolean;
}

export interface WebsiteContent {
  clientId: string;
  hero: WebsiteHero;
  ourStory: WebsiteOurStory;
  /** The public site's single "Details" section, rendered as 4 cards: ceremony, reception, attire, parking & arrival. */
  details: WebsiteDetailCard[];
  schedule: WebsiteScheduleEvent[];
  travel: WebsiteTravelItem[];
  gallery: WebsiteGalleryPhoto[];
  rsvp: WebsiteRsvpConfig;
}

export interface MilestoneItem {
  id: string;
  clientId: string;
  title: string;
  dueDate: string;
  tag: string;
}
