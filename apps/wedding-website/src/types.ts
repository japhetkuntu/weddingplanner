export type FocalPoint = "top" | "center" | "bottom";

export interface SiteImage {
  /** Real photo URL once the couple/planner uploads one; label renders as a placeholder until then. */
  src?: string;
  label: string;
  /** Where the image should anchor when cropped to fill its section — keeps the subject in frame. */
  focalPoint?: FocalPoint;
}

export interface HeroContent {
  eyebrow: string;
  coupleNames: string;
  date: string;
  venue: string;
  image: SiteImage;
}

export interface StoryMoment {
  label: string;
  year: string;
}

export interface OurStoryContent {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  moments: StoryMoment[];
  images: SiteImage[];
}

export interface DetailCard {
  eyebrow: string;
  heading: string;
  body: string;
  note?: string;
  linkLabel?: string;
}

export interface ScheduleEvent {
  time: string;
  title: string;
  detail: string;
}

export interface TravelItem {
  heading: string;
  body: string;
}

export interface GalleryPhoto extends SiteImage {
  caption: string;
}

export interface RsvpBlockContent {
  eyebrow: string;
  title: string;
  body: string;
  deadline: string;
  confirmationMessage: string;
  collectDietary: boolean;
  collectPlusOne: boolean;
  collectEmail: boolean;
  collectMobile: boolean;
  collectAccommodation: boolean;
  collectTransportation: boolean;
}

export interface SiteConfig {
  coupleNames: string;
  date: string;
  publishedSections: string[];
  hero: HeroContent;
  ourStory: OurStoryContent;
  details: DetailCard[];
  schedule: ScheduleEvent[];
  travel: TravelItem[];
  gallery: GalleryPhoto[];
  rsvp: RsvpBlockContent;
}
