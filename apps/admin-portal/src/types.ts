export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  /** Only a Super Admin can add/remove team members and see every client in the portfolio. */
  isSuperAdmin: boolean;
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
  /** "Home Wedding" | "Unconventional Venue" | "Vacation Wedding" | "Vow Renewal" */
  weddingType?: string;
  status: ClientStatus;
  planningPercent: number;
  budgetTotal: number;
  budgetPaid: number;
  /** When the couple's full budget is expected to be paid off. */
  fullPaymentDueDate?: string;
  /** ISO 4217 code (e.g. "USD", "GBP") — set once when the client is added since couples usually
   * think about their budget in their own local currency, not the planner's. */
  currency: string;
  nextAttention: string;
  avatarInitials: string;
  /** Client Portal login the couple uses — set up and reset by the admin, never chosen by the couple. */
  portalEmail: string;
  /** Archived clients are hidden from the active portfolio but never deleted — everything stays
   * intact and can be unarchived at any time. */
  isArchived: boolean;
  assignedPlannerId?: string;
  assignedPlannerName?: string;
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
  vendorId?: string;
  description?: string;
  estimated: number;
  actual: number;
  paid: number;
  nextDue?: string;
}

export interface Vendor {
  id: string;
  name: string;
  contact?: string;
  location: string;
  category?: string;
  summary?: string;
  photoUrl?: string;
  contractUrl?: string;
  contractFileName?: string;
  /** False for a vendor added by another (non-Super-Admin) planner — visible in the shared
   * directory, but not editable/removable by anyone except its creator or a Super Admin. */
  canManage: boolean;
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
  email?: string;
  mobile?: string;
  needsAccommodation?: boolean;
  needsTransportation?: boolean;
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

export type FocalPoint = "top" | "center" | "bottom";

export interface WebsiteImage {
  /** Real photo URL once the couple/planner uploads one; label renders as a placeholder until then. */
  url?: string;
  label: string;
  /** Where the image should anchor when cropped to fill its section — keeps the subject in frame. */
  focalPoint?: FocalPoint;
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
  collectAccommodation: boolean;
  collectTransportation: boolean;
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

/** The Ovutor studio's own marketing site (apps/wedding-website) — distinct from WebsiteContent
 * above, which is a couple's wedding site. Every field is optional: null/blank means the admin
 * hasn't set it, and the public site falls back to its own static copy for that field. */
export interface MarketingImage {
  url?: string;
  label?: string;
  focalPoint?: FocalPoint;
}

export interface MarketingHero {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaTo?: string;
  media?: MarketingImage[];
}

export type MarketingSectionLayout = "text-only" | "image-left" | "image-right" | "image-full";

export interface MarketingContentBlock {
  heading?: string;
  body?: string;
  image?: MarketingImage;
  layout: MarketingSectionLayout;
}

export interface MarketingSection {
  id: string;
  pageSlug: string;
  type: string;
  order: number;
  isEnabled: boolean;
  title: string;
  content: MarketingContentBlock;
}

/** The other named fixed-content blocks a page can define beyond its hero — What We Do's
 * statement/flow, Our Planning Packages' intro/divider/heading/categories, Our Approach's
 * intro/steps, Our Journal's posts, Connect with Us's intro paragraphs. Each shape below mirrors
 * apps/wedding-website's matching Marketing*Dto in src/lib/marketingApi.ts — the backend stores
 * and returns all of these as opaque JSON, so keeping the two frontends' shapes in sync is on us,
 * not enforced by any shared type. */
export interface MarketingStatement {
  heading?: string;
  body?: string;
  script?: string;
}

export interface MarketingFlowItem {
  title?: string;
  body?: string;
  meta?: string;
  image?: MarketingImage;
}

export interface MarketingFlow {
  items?: MarketingFlowItem[];
}

export interface MarketingText {
  text?: string;
}

export interface MarketingImageBlock {
  image?: MarketingImage;
}

export interface MarketingHeadingBody {
  heading?: string;
  body?: string;
}

export interface MarketingCategoryGroup {
  title?: string;
  bullets?: string[];
}

export interface MarketingCategoryItem {
  name?: string;
  groups?: MarketingCategoryGroup[];
}

export interface MarketingCategories {
  items?: MarketingCategoryItem[];
}

export interface MarketingStepItem {
  title?: string;
  body?: string;
}

export interface MarketingSteps {
  items?: MarketingStepItem[];
}

export interface MarketingPostItem {
  slug?: string;
  title?: string;
  location?: string;
  excerpt?: string;
  date?: string;
  category?: string;
  media?: MarketingImage;
  body?: string[];
  photos?: MarketingImage[];
}

export interface MarketingPosts {
  items?: MarketingPostItem[];
}

export interface MarketingParagraphs {
  paragraphs?: string[];
  formNote?: string;
}

export interface MilestoneItem {
  id: string;
  clientId: string;
  title: string;
  dueDate: string;
  tag: string;
}
