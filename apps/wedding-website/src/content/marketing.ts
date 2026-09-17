import type { SiteImage } from "@/types";
import brideArmchairBouquet from "@/assets/photos/bride-armchair-bouquet.jpg";
import brideGettingReadyBed from "@/assets/photos/bride-getting-ready-bed.jpg";
import brideGettingReadyDoor from "@/assets/photos/bride-getting-ready-door.jpg";
import brideWindowCloseup from "@/assets/photos/bride-window-closeup.jpg";
import brideWindowFulllength from "@/assets/photos/bride-window-fulllength.jpg";
import coupleHallwayWhiteAttire from "@/assets/photos/couple-hallway-white-attire.jpg";
import coupleTradPortraitGold from "@/assets/photos/couple-trad-portrait-gold.jpg";
import coupleTradWickerCoral from "@/assets/photos/couple-trad-wicker-coral.jpg";
import groomGettingReadyBowtie from "@/assets/photos/groom-getting-ready-bowtie.jpg";
import groomGettingReadyGiftbox from "@/assets/photos/groom-getting-ready-giftbox.jpg";
import receptionDanceGoldDress from "@/assets/photos/reception-dance-gold-dress.jpg";
import receptionFirstDanceClouds from "@/assets/photos/reception-first-dance-clouds.jpg";
import receptionFirstDanceSparklersWide from "@/assets/photos/reception-first-dance-sparklers-wide.jpg";

/** Marketing media extends the couple-site `SiteImage` placeholder pattern with an optional
 * video source — when `video` is set it takes priority over `src`, and `src` (if also set)
 * is used as the `<video>`'s poster frame. Leaving both unset falls back to the same labeled
 * gradient placeholder the rest of the app already uses for "no real asset yet". */
export interface MarketingMedia extends SiteImage {
  video?: string;
}

/** Real Unsplash/Pexels demo assets for the spots the studio's own photos (imported above)
 * don't cover — every one of these is a stable, directly-hotlinkable CDN URL (not a redirect/
 * search service), so swap them for your own by just replacing the `src`/`video` value here.
 * `unsplash(id)` keeps the sizing params consistent across the file. */
function unsplash(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2400&q=90`;
}

export interface NavLink {
  label: string;
  to: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", to: "/" },
  { label: "What We Do", to: "/what-we-do" },
  { label: "Our Planning Packages", to: "/our-planning-packages" },
  { label: "Our Approach", to: "/our-approach" },
  { label: "Our Journal", to: "/our-journal" },
  { label: "Connect with Us", to: "/connect-with-us" },
];

export const STUDIO = {
  name: "Ovutor",
  tagline: "Thoughtfully planned. Beautifully celebrated.",
  email: "hello@ovutor.com",
  instagram: "@ovutorweddings",
  location: "Based in Accra — planning destination weddings across West Africa & beyond",
};

// ---------------------------------------------------------------------------
// Home — a single, simple hero. Nothing else on this page by design.
// ---------------------------------------------------------------------------
export const HOME = {
  hero: {
    // A slow auto-advancing carousel, freely mixing photos and video — HeroMedia crossfades
    // between whatever's in this array, one slide at a time.
    media: [
      { label: "First dance under a shower of sparklers", src: receptionFirstDanceSparklersWide, focalPoint: "center" },
      { label: "Celebrating in the hallway, dressed in white", src: coupleHallwayWhiteAttire, focalPoint: "center" },
      { label: "A couple in traditional dress, seated together", src: coupleTradWickerCoral, focalPoint: "center" },
    ] as MarketingMedia[],
    eyebrow: "Ovutor Weddings",
    title: "Thoughtfully planned.\nBeautifully celebrated.",
    subtitle: "A boutique studio designing intimate, unforgettable weddings — from the first toast to the last dance.",
    ctaLabel: "Start planning your day",
    ctaTo: "/connect-with-us",
  },
};

// ---------------------------------------------------------------------------
// What We Do (formerly "About")
// ---------------------------------------------------------------------------
export const WHAT_WE_DO = {
  hero: {
    media: [
      {
        label: "A quiet moment before the day begins",
        src: brideGettingReadyBed,
        focalPoint: "center",
      },
      { label: "A couple, dressed in gold and red for their traditional ceremony", src: coupleTradPortraitGold, focalPoint: "center" },
    ] as MarketingMedia[],
    eyebrow: "About Ovutor",
    title: "The studio behind\nyour wedding day",
  },
  statement: {
    heading: "We've spent over a decade turning love stories into unforgettable celebrations.",
    body: "We're inspired by the couples who trust us with their biggest day — and our passion for perfection means every event is spectacular and entirely their own, from the very first consultation down to the smallest detail.",
    script: "You're in the right place.",
  },
  flow: [
    {
      index: "01",
      title: "Every love story\nis one of a kind.",
      body: "We don't believe in templates. Every couple we work with has a different story, a different rhythm, a different idea of what celebration means — our job is to listen first, then design around that.",
      meta: "How we begin",
      media: {
        label: "Reviewing the details together",
        src: groomGettingReadyGiftbox,
        focalPoint: "center",
      } as MarketingMedia,
    },
    {
      index: "02",
      title: "We handle the\ndetails, quietly.",
      body: "From vendor negotiations to the seating chart nobody sees, our role is to make the hard parts invisible — so you and your families get to actually be present on the day, instead of managing it.",
      meta: "How we work",
      media: {
        label: "The small details, taken care of",
        src: unsplash("photo-1535428245347-3ab06a1b100a"),
        focalPoint: "top",
      } as MarketingMedia,
    },
    {
      index: "03",
      title: "Your day, your\nvoice, always.",
      body: "We bring craft and experience — but the taste, the story, the little rituals that make it feel like you, come from you. We're here to build the frame that lets that shine.",
      meta: "How we design",
      media: {
        label: "A bride, laughing while getting ready",
        src: brideGettingReadyDoor,
        focalPoint: "center",
      } as MarketingMedia,
    },
  ],
};

// ---------------------------------------------------------------------------
// Our Planning Packages (formerly "Services")
// ---------------------------------------------------------------------------
export const PLANNING_PACKAGES = {
  hero: {
    media: [
      {
        label: "A couple walking the grounds together",
        src: unsplash("photo-1692457799626-4477193123c6"),
        focalPoint: "center",
      },
      { label: "A couple in traditional dress, seated together", src: coupleTradWickerCoral, focalPoint: "center" },
    ] as MarketingMedia[],
    eyebrow: "Our planning packages",
    title: "Destination weddings,\ndesigned with intention",
  },
  intro: "Since our first wedding, our approach has been rooted in one belief: your day should feel effortless, authentic, and designed with intention. We embrace quiet luxury — refined elegance without excess — to create a celebration that feels entirely yours.",
  // The full-bleed photo + large script-text divider between the intro and the category list,
  // exactly like the château photo + "Our Services" overlay on annelaureweddings.com/services.
  dividerPhoto: { label: "A ceremony ready for guests", src: unsplash("photo-1769812344081-92b3e2ac39c0"), focalPoint: "center" } as MarketingMedia,
  // One overarching heading + body for the whole page (matches annelaureweddings.com/services,
  // which states this once at the top) — NOT repeated per category. Categories below are lean
  // stacked bands (name + bullet groups only), which is what actually makes them read as a
  // "stack" instead of four disconnected mini hero sections each with their own heading/CTA.
  heading: "Full wedding planning and thoughtful design",
  body: "As your planner and designer, we oversee every step of your wedding. Together, we imagine and bring to life an elegant, timeless event tailored to your story — from selecting inspired vendors to designing a cohesive atmosphere for every moment.",
  categories: [
    {
      name: "Planning",
      groups: [
        {
          title: "Venue Selection & Management",
          bullets: [
            "Guidance on locations, from intimate gardens to grand estates.",
            "Venue research and tailored recommendations.",
            "Organization of venue visits and vendor meetings.",
          ],
        },
        {
          title: "Budget & Vendor Management",
          bullets: [
            "Transparent production and management of your wedding budget.",
            "Vendor selection aligned with your style and budget.",
            "Negotiation and liaising with vendors before and during the wedding.",
          ],
        },
      ],
    },
    {
      name: "Design",
      groups: [
        {
          title: "Styling & Creative Direction",
          bullets: [
            "Moodboards based on your desired palette and atmosphere.",
            "Selection of furniture, lighting, and décor elements.",
            "Guidance on fashion and beauty styling.",
          ],
        },
        {
          title: "Production",
          bullets: [
            "Collaboration with trusted vendors to bring the design to life.",
            "Floorplans to visualize the event.",
            "Sourcing unique props, favors, and design elements.",
          ],
        },
      ],
    },
    {
      name: "Guests",
      groups: [
        {
          title: "Guestlist & RSVP",
          bullets: [
            "A bespoke wedding website your guests will love visiting.",
            "Collection and organization of RSVPs with dietary and travel details.",
          ],
        },
        {
          title: "Guest Support",
          bullets: [
            "Coordination of shuttles, transfers, and accommodations.",
            "Concierge support for restaurants, taxis, and activities.",
          ],
        },
      ],
    },
    {
      name: "On the day",
      groups: [
        {
          title: "Timeline & Run of Show",
          bullets: [
            "A detailed timeline for each service and vendor.",
            "Technical visits and meetings prior to the event.",
          ],
        },
        {
          title: "Day-Of Coordination",
          bullets: [
            "Supervision of all vendors on-site.",
            "Coordination of music, speeches, and transitions throughout the day.",
          ],
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Our Approach — the studio's process/methodology, split out into its own page
// from what used to be the "How We Work" section at the bottom of Services.
// ---------------------------------------------------------------------------
export const OUR_APPROACH = {
  hero: {
    media: [
      { label: "A groom, in a quiet moment before the day", src: groomGettingReadyBowtie, focalPoint: "center" },
      { label: "A couple, close together", src: unsplash("photo-1719499683843-721331f2495f"), focalPoint: "center" },
    ] as MarketingMedia[],
    eyebrow: "How we work",
    title: "A process built\naround you",
  },
  intro: "No two weddings — and no two couples — are planned the same way. Our approach is a steady, four-part rhythm that flexes around your story, your timeline, and how involved you want to be at each stage. It's less a checklist than a conversation that deepens over time, one that leaves room for your wedding to surprise you in all the right ways.",
  steps: [
    {
      index: "01",
      title: "Discovery call",
      body: "We begin with a consultation to understand your story, your style, and your wishes for the day — no assumptions, just listening. This is where we learn who you are as a couple: how you met, what draws you to a destination, the moments you most want your guests to remember. We ask about budget and boundaries early and honestly, so nothing that follows comes as a surprise. By the end of the call, we should feel less like planners you've hired and more like friends who happen to know how to throw a wedding.",
    },
    {
      index: "02",
      title: "A tailored proposal",
      body: "From there, we craft a proposal built around your needs, your guests, and your venue — a clear picture of what working together looks like. It lays out scope, timeline, and investment in plain language, with room to adjust before anything is finalized. We'd rather spend an extra week refining a proposal than hand you one that doesn't feel like yours. Once you sign on, you'll know exactly what to expect from us at every stage that follows, and when to expect it.",
    },
    {
      index: "03",
      title: "Design & planning",
      body: "Together, we build every layer of the day — vendors, design, logistics — with you involved as much or as little as you like. We source venues and vendors who match your vision and vet every contract on your behalf, so you're never the one chasing a confirmation. Design moves from mood boards to floor plans to final details, with regular check-ins to keep you close to the process without carrying its weight. Travel, permits, and the countless small logistics of a destination wedding are ours to manage.",
    },
    {
      index: "04",
      title: "Your wedding day",
      body: "We're on-site from first light to last dance, so every moment is exactly as it should be, and you're free to just be present in it. Our team runs the timeline, manages every vendor, and quietly solves whatever comes up, so any hiccup is handled long before it reaches you. You and your guests get to simply experience the day — the toasts, the dancing, the small unrepeatable moments — while we handle everything happening just out of view.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Our Journal (formerly "Journal")
// ---------------------------------------------------------------------------
export interface JournalPost {
  slug: string;
  index: string;
  title: string;
  location: string;
  excerpt: string;
  date: string;
  category: string;
  media: MarketingMedia;
  body: string[];
  /** The full photo set for a real-wedding post's gallery grid — omitted for posts (like planning
   * tips) that aren't a photoshoot writeup and don't need one. */
  photos?: MarketingMedia[];
}

export const JOURNAL_CATEGORIES = ["All Posts", "Real Weddings", "Destinations", "Planning Tips"];

export const JOURNAL_POSTS: JournalPost[] = [
  {
    slug: "amanda-and-brian",
    index: "01",
    title: "Amanda & Brian",
    location: "An elegant clifftop wedding overlooking the coast",
    excerpt: "Private villa over the sea, black-tie tuxedos and elegant gowns, all drawn into the romantic atmosphere of the evening.",
    date: "2026-06-12",
    category: "Real Weddings",
    media: { label: "Amanda & Brian's first dance", src: receptionFirstDanceClouds, focalPoint: "center" },
    body: [
      "Amanda and Brian wanted their wedding to feel like a long, unhurried evening with the people they loved most — so we built the whole day around golden light and long tables.",
      "We worked with local florists to bring in loose, garden-style arrangements that echoed the cliffside setting, and kept the schedule open enough that nobody ever felt rushed from one moment to the next.",
    ],
    photos: [
      { label: "Ceremony florals and chairs", src: unsplash("photo-1769812344081-92b3e2ac39c0") },
      { label: "Wedding rings, up close", src: unsplash("photo-1561828995-aa79a2db86dd") },
      { label: "A quiet embrace, rooftop at golden hour", src: unsplash("photo-1624228652376-d4faa602b278") },
      { label: "The wedding cake", src: unsplash("photo-1631998878375-236a6826ce7f") },
      { label: "A close embrace among the trees", src: unsplash("photo-1594425437587-e75c19ebf332") },
      { label: "A couple in traditional dress, together", src: unsplash("photo-1661332517932-2d441bfb2994") },
      { label: "Amanda & Brian, portrait", src: brideWindowCloseup },
      { label: "Getting-ready details", src: unsplash("photo-1680789527271-f1fc1528f27e") },
      { label: "Bride, full length", src: brideWindowFulllength },
      { label: "Veil, up close", src: unsplash("photo-1473271008451-b0fcb08b728d") },
      { label: "A small, tender detail", src: unsplash("photo-1535428245347-3ab06a1b100a") },
      { label: "Lifted up in celebration", src: unsplash("photo-1786529745852-d7d529b55676") },
    ],
  },
  {
    slug: "planning-a-destination-wedding",
    index: "02",
    title: "Planning a Destination Wedding",
    location: "Where to start when your guest list crosses a border",
    excerpt: "A guest list that spans time zones changes almost everything about how a wedding gets planned — here's how we approach it.",
    date: "2026-05-02",
    category: "Planning Tips",
    media: { label: "Moodboard and travel itinerary flat lay", src: unsplash("photo-1719938570902-6fe35719cde9"), focalPoint: "center" },
    body: [
      "The single biggest difference in planning a destination wedding is timeline — everything simply takes longer to confirm from a distance, so we start earlier and lean harder on trusted local vendor relationships.",
      "We also build a short guest-facing travel guide early, so your loved ones can book flights and stays with confidence well before the big day.",
    ],
    photos: [
      { label: "Passport, camera, ready to go", src: unsplash("photo-1559234626-44ceccf8fbc5") },
      { label: "Packed and ready to travel", src: unsplash("photo-1742327648952-5babf1d04ae4") },
      { label: "Planning notes", src: unsplash("photo-1540350394557-8d14678e7f91") },
    ],
  },
  {
    slug: "sofia-and-daniel",
    index: "03",
    title: "Sofia & Daniel",
    location: "A warm, garden-style celebration at golden hour",
    excerpt: "Family-style dinner under string lights, and a first dance that ran twenty minutes long because nobody wanted it to end.",
    date: "2026-03-18",
    category: "Real Weddings",
    media: { label: "Sofia & Daniel's reception, dancing the night away", src: receptionDanceGoldDress, focalPoint: "center" },
    body: [
      "Sofia and Daniel's only real brief was 'make it feel like a big family dinner' — so we leaned all the way into long communal tables, warm string lighting, and a menu built around both of their grandmothers' recipes.",
    ],
    photos: [
      { label: "String lights over the barn", src: unsplash("photo-1780728953990-50a6513d05e1") },
      { label: "Twilight at the reception", src: unsplash("photo-1780888207019-dd9121069a81") },
      { label: "First dance, in black and white", src: unsplash("photo-1624228652954-9e3725a2a4f8") },
      { label: "Cutting the cake", src: unsplash("photo-1719499683843-721331f2495f") },
      { label: "A bite for the groom", src: unsplash("photo-1594425437587-e75c19ebf332") },
      { label: "A toast with the wedding party", src: brideArmchairBouquet },
      { label: "Bracelet detail", src: unsplash("photo-1631050165122-626a1377fbce") },
      { label: "Garden ceremony, guests seated", src: unsplash("photo-1788035963213-b8021895ce6d") },
      { label: "The groom, one last check", src: groomGettingReadyBowtie, focalPoint: "top" },
      { label: "Dancing under the string lights", src: receptionDanceGoldDress },
      { label: "Tango on the dance floor", src: unsplash("photo-1786529745852-d7d529b55676") },
      { label: "A quiet moment together", src: unsplash("photo-1624228652376-d4faa602b278") },
    ],
  },
];

// ---------------------------------------------------------------------------
// Connect with Us (formerly "Contact")
// ---------------------------------------------------------------------------
export const CONNECT = {
  media: {
    label: "Celebrating in the hallway, dressed in white",
    src: coupleHallwayWhiteAttire,
    focalPoint: "center",
  } as MarketingMedia,
  eyebrow: "Get in touch",
  title: "Let's connect",
  paragraphs: [
    "Planning your wedding starts with a conversation. Whether you already have a vision in mind or are just beginning to imagine your day, we'd love to hear your story.",
    "Our process begins with a personalized consultation where we'll learn more about you, your style, and your wishes. From there, we'll craft a proposal tailored to your needs.",
    "We take on a limited number of weddings each year to ensure every couple receives our full attention and care.",
  ],
  formNote: "Please complete the form below, and we'll be in touch shortly.",
};
