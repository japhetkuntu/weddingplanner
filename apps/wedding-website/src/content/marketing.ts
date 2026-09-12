import type { SiteImage } from "@/types";

/** Marketing media extends the couple-site `SiteImage` placeholder pattern with an optional
 * video source — when `video` is set it takes priority over `src`, and `src` (if also set)
 * is used as the `<video>`'s poster frame. Leaving both unset falls back to the same labeled
 * gradient placeholder the rest of the app already uses for "no real asset yet". */
export interface MarketingMedia extends SiteImage {
  video?: string;
}

/** Real Unsplash/Pexels demo assets so the site isn't just gradient placeholders while you
 * gather your own photos and video — every one of these is a stable, directly-hotlinkable CDN
 * URL (not a redirect/search service), so swap them for your own by just replacing the `src`/
 * `video` value here. `unsplash(id)` keeps the sizing params consistent across the file. */
function unsplash(id: string) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2400&q=90`;
}

export interface NavLink {
  label: string;
  to: string;
}

export const NAV_LINKS: NavLink[] = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Journal", to: "/journal" },
  { label: "Contact", to: "/contact" },
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
      { label: "A couple's first look, golden hour", src: unsplash("photo-1566813142858-99f1e35e333a"), focalPoint: "center" },
      { label: "Getting into the getaway car", video: "https://videos.pexels.com/video-files/34502718/14618802_640_360_25fps.mp4", focalPoint: "center" },
      { label: "Celebrating on the dance floor", src: unsplash("photo-1708569176813-746f00614012"), focalPoint: "center" },
    ] as MarketingMedia[],
    eyebrow: "Ovutor Weddings",
    title: "Thoughtfully planned.\nBeautifully celebrated.",
    subtitle: "A boutique studio designing intimate, unforgettable weddings — from the first toast to the last dance.",
    ctaLabel: "Start planning your day",
    ctaTo: "/contact",
  },
};

// ---------------------------------------------------------------------------
// About
// ---------------------------------------------------------------------------
export const ABOUT = {
  hero: {
    media: [
      {
        label: "Behind the scenes, planning a tablescape",
        src: unsplash("photo-1762941744800-385b067dff21"),
        video: "https://videos.pexels.com/video-files/34502718/14618802_640_360_25fps.mp4",
        focalPoint: "center",
      },
      { label: "Amanda & Brian's ceremony", src: unsplash("photo-1708569176850-9de9aa6b179b"), focalPoint: "center" },
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
        label: "Planner and couple reviewing a moodboard",
        src: unsplash("photo-1719938570902-6fe35719cde9"),
        focalPoint: "center",
      } as MarketingMedia,
    },
    {
      index: "02",
      title: "We handle the\ndetails, quietly.",
      body: "From vendor negotiations to the seating chart nobody sees, our role is to make the hard parts invisible — so you and your families get to actually be present on the day, instead of managing it.",
      meta: "How we work",
      media: {
        label: "Coordinator adjusting table florals",
        src: unsplash("photo-1769812344081-92b3e2ac39c0"),
        focalPoint: "center",
      } as MarketingMedia,
    },
    {
      index: "03",
      title: "Your day, your\nvoice, always.",
      body: "We bring craft and experience — but the taste, the story, the little rituals that make it feel like you, come from you. We're here to build the frame that lets that shine.",
      meta: "How we design",
      media: {
        label: "Bride laughing with her bridesmaids",
        src: unsplash("photo-1758810409706-7e83e2434c40"),
        focalPoint: "center",
      } as MarketingMedia,
    },
  ],
};

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------
export const SERVICES = {
  hero: {
    media: [
      {
        label: "Planner walking a couple through a venue",
        src: unsplash("photo-1768777278495-5ffe24f9e3a8"),
        video: "https://videos.pexels.com/video-files/34448979/14597235_640_360_25fps.mp4",
        focalPoint: "center",
      },
      { label: "Sofia & Daniel's reception", src: unsplash("photo-1769230387364-8b0c2b63e18b"), focalPoint: "center" },
    ] as MarketingMedia[],
    eyebrow: "Work with us",
    title: "Destination weddings,\ndesigned with intention",
  },
  intro: "Since our first wedding, our approach has been rooted in one belief: your day should feel effortless, authentic, and designed with intention. We embrace quiet luxury — refined elegance without excess — to create a celebration that feels entirely yours.",
  categories: [
    {
      name: "Planning",
      heading: "Full wedding planning and thoughtful design",
      body: "As your planner and designer, we oversee every step of your wedding. Together, we imagine and bring to life an elegant, timeless event tailored to your story — from selecting inspired vendors to designing a cohesive atmosphere for every moment.",
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
      heading: "Styling & creative direction",
      body: "Every detail is designed, never defaulted. We build a full visual world for your wedding — palette, texture, light — and bring in the right hands to make it real.",
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
      heading: "Guest experience, start to finish",
      body: "Your guests are part of the story too. We handle the logistics of getting everyone there, comfortable, and cared for — quietly, in the background.",
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
      heading: "On-site coordination",
      body: "On your wedding day, we're the ones checking the time so you don't have to. A detailed run of show, and a team on the ground to hold it together.",
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
  howWeWork: {
    heading: "How we work",
    steps: [
      { title: "Discovery call", body: "We begin with a consultation to understand your story, your style, and your wishes for the day." },
      { title: "A tailored proposal", body: "From there, we craft a proposal built around your needs, your guests, and your venue." },
      { title: "Design & planning", body: "Together, we build every layer of the day — vendors, design, logistics — with you involved as much or as little as you like." },
      { title: "Your wedding day", body: "We're on-site from first light to last dance, so every moment is exactly as it should be." },
    ],
  },
};

// ---------------------------------------------------------------------------
// Journal
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
    media: { label: "Amanda & Brian's first dance", src: unsplash("photo-1708569176850-9de9aa6b179b"), focalPoint: "center" },
    body: [
      "Amanda and Brian wanted their wedding to feel like a long, unhurried evening with the people they loved most — so we built the whole day around golden light and long tables.",
      "We worked with local florists to bring in loose, garden-style arrangements that echoed the cliffside setting, and kept the schedule open enough that nobody ever felt rushed from one moment to the next.",
    ],
    photos: [
      { label: "Ceremony florals and chairs", src: unsplash("photo-1769812344081-92b3e2ac39c0") },
      { label: "Wedding rings, up close", src: unsplash("photo-1561828995-aa79a2db86dd") },
      { label: "Toasting with champagne", src: unsplash("photo-1758810410268-5e9d85b60065") },
      { label: "The wedding cake", src: unsplash("photo-1631998878375-236a6826ce7f") },
      { label: "Feeding each other cake", src: unsplash("photo-1685524482095-93501703552c") },
      { label: "Down the aisle", src: unsplash("photo-1769869174509-7d448052e605") },
      { label: "Amanda & Brian, portrait", src: unsplash("photo-1762941744800-385b067dff21") },
      { label: "Getting-ready details", src: unsplash("photo-1680789527271-f1fc1528f27e") },
      { label: "Bride, in the mirror", src: unsplash("photo-1746777758990-04d0d42ea497") },
      { label: "Veil, up close", src: unsplash("photo-1473271008451-b0fcb08b728d") },
      { label: "Pinning the boutonniere", src: unsplash("photo-1445117627052-274425469152") },
      { label: "Lifted up in celebration", src: unsplash("photo-1758810411287-a362740f269e") },
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
    media: { label: "Sofia & Daniel's reception under string lights", src: unsplash("photo-1769230387364-8b0c2b63e18b"), focalPoint: "center" },
    body: [
      "Sofia and Daniel's only real brief was 'make it feel like a big family dinner' — so we leaned all the way into long communal tables, warm string lighting, and a menu built around both of their grandmothers' recipes.",
    ],
    photos: [
      { label: "String lights over the barn", src: unsplash("photo-1780728953990-50a6513d05e1") },
      { label: "Twilight at the reception", src: unsplash("photo-1780888207019-dd9121069a81") },
      { label: "First dance", src: unsplash("photo-1772945492345-ee8d17e9a74b") },
      { label: "Cutting the cake", src: unsplash("photo-1637015131338-2e546e84a462") },
      { label: "A bite for the groom", src: unsplash("photo-1707192325061-98ce20b94eb6") },
      { label: "A toast with the wedding party", src: unsplash("photo-1732594518883-878478999758") },
      { label: "Bracelet detail", src: unsplash("photo-1631050165122-626a1377fbce") },
      { label: "Garden ceremony, guests seated", src: unsplash("photo-1769230365032-4591a0050fe3") },
      { label: "The groom, one last check", src: unsplash("photo-1472417583565-62e7bdeda490") },
      { label: "Dancing under the string lights", src: unsplash("photo-1769374075776-2a44ee11e086") },
      { label: "Tango on the dance floor", src: unsplash("photo-1767784097269-943e5c8bd3b1") },
      { label: "A quiet moment together", src: unsplash("photo-1772945492456-8dd1ad977172") },
    ],
  },
];

// ---------------------------------------------------------------------------
// Contact
// ---------------------------------------------------------------------------
export const CONTACT = {
  media: {
    label: "Celebrating on the dance floor",
    src: unsplash("photo-1708569176813-746f00614012"),
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
