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
      name: "Full Service Planning",
      currency: "GHS",
      priceMin: 60000,
      summary: "From the first idea to the last dance, we plan, design and run your entire wedding so you can simply enjoy it.",
      media: { label: "A bride by the window", src: brideWindowFulllength, focalPoint: "center" } as MarketingMedia,
      background:
        "Full Service Planning is for couples who want a partner for every detail. From your first conversation to the final goodbye, we shape the vision, manage the budget and vendors, design every moment and run the day itself — so the only thing left for you to do is be present. We embrace quiet luxury: refined, personal and entirely yours.",
      sections: [
        {
          title: "Design",
          cards: [
            {
              title: "Styling & Creative Direction",
              bullets: [
                "Moodboards built around your palette and atmosphere.",
                "Furniture, lighting and décor selection.",
                "Guidance on fashion and beauty styling.",
              ],
            },
            {
              title: "Production",
              bullets: [
                "Collaboration with trusted vendors to bring the design to life.",
                "Floorplans to visualise the event.",
                "Sourcing of unique props, favours and design elements.",
              ],
            },
            {
              title: "Florals & Stationery",
              bullets: [
                "Bespoke floral design for ceremony and reception.",
                "Invitations, signage and printed details.",
                "A cohesive look from save-the-date to farewell.",
              ],
            },
          ],
        },
        {
          title: "Planning",
          cards: [
            {
              title: "Venue Selection & Management",
              bullets: [
                "Guidance on locations, from intimate gardens to grand estates.",
                "Venue research, visits and tailored recommendations.",
                "Contracts and venue liaison handled for you.",
              ],
            },
            {
              title: "Budget & Vendors",
              bullets: [
                "Transparent budget creation and management.",
                "Vendor selection aligned with your style and budget.",
                "Negotiation and liaison before and during the wedding.",
              ],
            },
            {
              title: "Timeline & Logistics",
              bullets: [
                "A planning roadmap with clear milestones.",
                "Travel, transfers and accommodation coordination.",
                "Permits and the small logistics of a destination wedding.",
              ],
            },
          ],
        },
        {
          title: "Coordination",
          cards: [
            {
              title: "Guest Experience",
              bullets: [
                "A bespoke wedding website and RSVP management.",
                "Dietary, travel and accommodation details collected.",
                "Concierge support for your guests.",
              ],
            },
            {
              title: "Day-Of Coordination",
              bullets: [
                "A detailed run of show for every service and vendor.",
                "On-site supervision from first light to last dance.",
                "Music, speeches and transitions cued seamlessly.",
              ],
            },
            {
              title: "Post-Ceremony",
              bullets: [
                "Vendor breakdown and return of rentals.",
                "Gift and keepsake handling.",
                "A closing wrap-up so nothing is left behind.",
              ],
            },
          ],
        },
      ],
      groups: [
        {
          title: "Everything, end to end",
          bullets: [
            "Venue, vendors, budget and timeline managed from start to finish.",
            "Creative direction and styling for every moment of the day.",
            "Guest experience, travel and on-the-day coordination.",
          ],
        },
      ],
    },
    {
      name: "Planning",
      currency: "GHS",
      priceMin: 20000,
      summary: "We handle venue, budget and vendors end to end, so every decision is guided and nothing is left to chance.",
      media: { label: "A bride seated with her bouquet", src: brideArmchairBouquet, focalPoint: "center" } as MarketingMedia,
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
      currency: "GHS",
      priceMin: 30000,
      summary: "From moodboards to floorplans, we shape a cohesive look and bring it to life with trusted vendors.",
      media: { label: "A first dance among the clouds", src: receptionFirstDanceClouds, focalPoint: "center" } as MarketingMedia,
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
      currency: "GHS",
      priceMin: 10000,
      summary: "A bespoke wedding website, organised RSVPs and thoughtful guest support from invitation to farewell.",
      media: { label: "A couple in white, in a hallway", src: coupleHallwayWhiteAttire, focalPoint: "center" } as MarketingMedia,
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
      currency: "GHS",
      priceMin: 15000,
      summary: "A detailed run of show and a team on-site from first light to last dance, so you can simply be present.",
      media: { label: "A dance in a gold dress", src: receptionDanceGoldDress, focalPoint: "center" } as MarketingMedia,
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
      media: { label: "Getting ready, unhurried", src: brideGettingReadyBed, focalPoint: "center" } as MarketingMedia,
      title: "Discovery call",
      body: "We begin with a consultation to understand your story, your style, and your wishes for the day — no assumptions, just listening. This is where we learn who you are as a couple: how you met, what draws you to a destination, the moments you most want your guests to remember. We ask about budget and boundaries early and honestly, so nothing that follows comes as a surprise. By the end of the call, we should feel less like planners you've hired and more like friends who happen to know how to throw a wedding.",
    },
    {
      index: "02",
      media: { label: "A couple in traditional dress", src: coupleTradWickerCoral, focalPoint: "center" } as MarketingMedia,
      title: "A tailored proposal",
      body: "From there, we craft a proposal built around your needs, your guests, and your venue — a clear picture of what working together looks like. It lays out scope, timeline, and investment in plain language, with room to adjust before anything is finalized. We'd rather spend an extra week refining a proposal than hand you one that doesn't feel like yours. Once you sign on, you'll know exactly what to expect from us at every stage that follows, and when to expect it.",
    },
    {
      index: "03",
      media: { label: "A gift, ready to give", src: groomGettingReadyGiftbox, focalPoint: "center" } as MarketingMedia,
      title: "Design & planning",
      body: "Together, we build every layer of the day — vendors, design, logistics — with you involved as much or as little as you like. We source venues and vendors who match your vision and vet every contract on your behalf, so you're never the one chasing a confirmation. Design moves from mood boards to floor plans to final details, with regular check-ins to keep you close to the process without carrying its weight. Travel, permits, and the countless small logistics of a destination wedding are ours to manage.",
    },
    {
      index: "04",
      media: { label: "The first dance", src: receptionFirstDanceSparklersWide, focalPoint: "center" } as MarketingMedia,
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
  /** Story paragraphs (rich text) with an optional section heading and image; when absent the page uses `body`. */
  blocks?: { heading?: string; text: string; image?: MarketingMedia }[];
  /** The full photo set for a real-wedding post's gallery grid — omitted for posts (like planning
   * tips) that aren't a photoshoot writeup and don't need one. */
  photos?: MarketingMedia[];
}

export const JOURNAL = {
  masthead: {
    eyebrow: "Our Journal — the stories we tell",
    title: "From every wedding, a story worth telling.",
    subtitle: "Real weddings we've planned, destination guides, and the odd bit of planning advice — from us to you.",
  },
};

export const JOURNAL_CATEGORIES = ["All Posts", "Real Weddings", "Destinations", "Planning Tips"];

/** Splits each long section of a story into as many parts as it has images, breaking at the
 * nearest speaker turn (or sentence) to an even split, and places each image after its part. */
function storyBlocks(sections: { heading: string; text: string }[], images: MarketingMedia[][]) {
  const out: { heading?: string; text: string; image?: MarketingMedia }[] = [];
  sections.forEach((sec, si) => {
    const imgs = images[si] ?? [];
    const parts = Math.max(imgs.length, 1);
    const text = sec.text;
    const boundaries: number[] = [];
    const re = /[.!?”"’]\s+(?=[A-Z][a-z]{1,15}:\s)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text))) boundaries.push(m.index + m[0].length);
    if (boundaries.length < parts - 1) {
      const re2 = /[.!?]\s+(?=[A-Z])/g;
      while ((m = re2.exec(text))) boundaries.push(m.index + m[0].length);
      boundaries.sort((a, b) => a - b);
    }
    const cuts: number[] = [];
    for (let p = 1; p < parts; p++) {
      const target = (text.length * p) / parts;
      cuts.push(boundaries.reduce((a, b) => (Math.abs(b - target) < Math.abs(a - target) ? b : a), boundaries[0] ?? text.length));
    }
    const edges = [0, ...cuts, text.length];
    for (let p = 0; p < parts; p++) {
      out.push({ heading: p === 0 ? sec.heading : undefined, text: text.slice(edges[p], edges[p + 1]).trim(), image: imgs[p] });
    }
  });
  return out;
}

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
  {
    slug: "lekan-and-marie",
    index: "04",
    title: "Lekan & Marie",
    location: "An intimate restaurant wedding in Lagos",
    excerpt: "No bride price, no big hall, no programme — just 65 people they loved, a restaurant, and a day that felt exactly like them.",
    date: "2026-09-20",
    category: "Real Weddings",
    media: { label: "Lekan & Marie", src: coupleHallwayWhiteAttire, focalPoint: "center" },
    body: [],
    blocks: storyBlocks(
      [
        { heading: "Arriving at an Intimate Wedding", text: "Marie: I always knew I wanted a small wedding. Growing up, I never really pictured or “dreamed” about my wedding. What I obsessed over, however, was how I was going to be proposed to. The proposal felt more like the main, the bigger, the actual declaration of love to me. The wedding felt more like a public spectacle, something you had to do to satisfy others - your families, the law, the church, etc. - so that you could go on and do “approved” life with your person. So the proposal was for me, for us. And I felt like this one was under my control. The wedding didn’t seem like it was something that I could control - or so I thought. Lekan: And I knew this about her - that the proposal was what she cared about. Marie: Yes. Because I always talked about it. In fact I told him exactly how I wanted to be proposed to: the setting, the ring. Yes, the ring was a big one - my engagement ring. I didn’t want anything gaudy, with so many things on it, etc. But I wanted a diamond ring. Lekan: On my own end, if you had asked me about the kind of wedding I was going to have, a few years before we got married, I would have said it would be the conventional Nigerian, Yoruba, wedding. One of my sisters got married in 2018 and I saw how that went - I think half of the town was at that wedding. So seeing that, plus the fact that I am the first child, the first son, and only son… I knew mine was not going to be similar. It was how everyone got married, so that was just it. But then, a series of terrible things happened: I lost my dad during covid, Marie lost her mom in 2022, and her dad was dealing with some health issues. So when it came time for us to get married, it felt like it was really just us. Our parents would have been the push but without them it didn’t seem like we had to do anything just for the sake of it. And around this time I had also started being really intentional about life and my relationship, rather than just going with the flow. So these were all the things that led us to the kind of wedding we had." },
        { heading: "Planning the Wedding", text: "Lekan: So, Marie got the proposal she wanted, and the ring. While I was planning the proposal, I knew I was also going to be responsible for planning the wedding - we were going to get married in Lagos, where I lived at the time, while Marie was in the UK. While planning the proposal I started mentally planning the wedding - noting details of the things we needed and the things I had to do, etc. At this point, we knew we were not going to have a big wedding, but I imagined that this would just be about the scale and the number of people we were going to invite. I didn’t go into it thinking we were going to have the kind of intimate wedding we ended up having. That happened by a beautiful accident. In the course of putting things together for the wedding, I met this couple who had just had an intimate wedding, and when I heard about the wedding they had had, I knew that that was what I wanted. Before meeting Soma & Terrence I was just planning the typical Nigerian wedding, for our small guest list. But Soma & Terrence made me realise that there were other options! They made me realise that we could get married in a restaurant, rather than the usual wedding hall/venue. They introduced me to the Registrar who was open to coming to our private ceremony to officiate the legal part of the wedding - so we didn’t have to go to the public Registry office to do that part of the wedding. Marie: And I was really grateful about this. Because the public registry process is just so chaotic and unpleasant. I didn’t like it at all and was very grateful that we didn’t have to do this. Lekan: Absolutely. During the planning for the proposal, I had gone to meet this guy who sold rings, to buy Marie’s engagement ring. We met at a restaurant and while I was there, I remember thinking that the restaurant was lovely and could make a lovely venue for our wedding. I took pictures and sent to Marie, who loved it. But while talking to the ring guy, I mentioned something about the restaurant and loving it, and he mentioned that his uncle had a lovely restaurant we could check out. He sent me to his uncle and he was right, his uncle’s restaurant felt a lot more special than the other restaurant I had been considering. The moment I stepped into the restaurant, I was sold completely. I took pictures and made videos and sent them to Marie, and she felt the same way. I immediately spoke to the owner and locked it down! Before booking the restaurant, I had a list of things I had to get together - find a caterer, find a decorator, buy drinks, etc. But at the restaurant, I realised that I could get an all-inclusive deal: they could provide the food, drinks, water. They were happy to do minimal decorations for us, and they had a music system, so we didn’t have to worry about hiring all these things. It was the easiest wedding to plan. And that was really it - all I did for the planning: I found a fantastic restaurant and they provided everything else we needed." },
        { heading: "Getting Everyone Onboard", text: "Marie: With me, it was very easy to get my family on board with the kind of wedding Lekan and I had planned. My dad wasn’t well enough and even apart from that, my extended family is generally chilled. We are not your typical traditional Nigerian family and we aren’t big on traditional things. Plus everyone also understood not to make a fuss, about wanting anything. They were just happy for us and supported what we wanted. Lekan: I am a Yoruba boy, and we are very big on tradition. While my dad wasn’t around to do things his way, my mom still wanted us to do as much of the traditional stuff that she felt was necessary. But I stood my ground. Marie and I had discussed and we had made our plans and I was not going to let anything change it or come in the way of it. Marie: And I really appreciated this about him, how he handled it. He insulated me from the stress of getting his extended family onboard and he made sure that we got the wedding we had agreed on. Because one thing we talked about was that we didn’t want to just give in to do things to please everyone. We were the ones getting married and we said it had to be about us and what we wanted. We agreed that if there was something in the whole process that we didn’t have to do, we simply wouldn’t do it. And Lekan really stock to that. He was the one on ground dealing with everything and he delivered on our plan. Lekan: The pressure was really from trying to get us to do a traditional, Yoruba wedding, especially about paying bride price and all that. Marie: And we discussed and agreed very early that we were not going to do all that bride price things. Our marriage was going to be based on statute, not traditional rites. Lekan: My mom was very uncomfortable with this. This was not how Yoruba people got married. But I had to remind her that Marie was not a Yoruba girl. Then there was the issue of getting married in the church. My family is Catholic, so everyone expected that we were going to get married in the church. Again, I said no. Marie wasn’t a Catholic and I am not personally big on church either. We simply didn’t see the need to do it just for the sake of others. Then there was the issue of who was coming and who wasn’t getting invited. It was a lot but I was really resolved and when they saw that we weren’t going to do things that we didn’t want to, everyone had to deal with it." },
        { heading: "The Wedding", text: "Our entire wedding felt like a party, which it actually really was. It was so much fun! We had 65 guests in all - 40 that we had invited and about 25 that weren’t invited, but it was not so bad because we had enough space to accommodate them. The ceremony started at 12, and it started at 12:00 on the dot - we had a set time with the restaurant, the Registrar had a set time, and most - if not all - of Marie’s family and friends had come from out of town. We started with the official, registry part, officiated by the Marriage Registrar. We went through the legal stuff, said our vows, signed the register, got our marriage certificate, and took official pictures - with the Registry banner. And that was it. All of this took about 20-30 minutes, and then it was time to celebrate being married. We started off sitting together, at the “couple’s table” and our guests went round telling stories about us - from childhood stories to teenage escapades, and all of it. It felt really special going back to fun, wholesome stories that we hadn’t even thought of for ages! It was really endearing. Then the older, married couples spoke about marriage experience - and I mean real talk. It felt like a really safe space and everyone felt very free to share and give us important advice about marriage. Aside from the registry part, this was the most serious part of the wedding. But it didn’t feel heavy at all. Some people gave speeches and toasts, and Lekan gave a toast to thank everyone for supporting and being there to celebrate with us. After the speeches and all, we cut our cake and proceeded to dance. It started with just the two of us, and then guests joined us, and everyone just rocked. From there, the rest of it was just us hanging out with our friends and family, eating and drinking. This was pretty much all we did till around 5/5:30pm when the ceremony was scheduled to end - we had the restaurant from 12:00pm-5:30pm. At five, we were ready to go and no one really felt the need for an after party. We had had enough to eat and drink, we had danced and had so much fun that when the wedding ended everyone had had a full day and everyone was happy to go home and rest. There were so many great things about our wedding: we did not overspend, I did not have to deal with vendors, the entire thing took just one month to put together, the ceremony itself felt exactly like us, and the day had a very natural, organic flow - there was no structured order of events. In fact, we didn’t even have anything written down, like a program. We did not preplan what we were going to do. We just knew that we were going to get married and hang out with our friends, eating and dancing. Best of all, we would say the best thing about our wedding was the vibe. It was relaxed, fun, easy and happy. Before the wedding our respective friends had never met. At the beginning of the ceremony, everyone sat with their people - which is normal. But as the day progressed, the barriers broke down and they all started mingling. At one point we had a mixed group of our friends sitting around a table, playing drinking games! That’s how much fun it was. And from the wedding most of them became friends, in and out of social media and it has just been the best thing." },
      ],
      [
        [
          { label: "Lekan & Marie, together", src: coupleHallwayWhiteAttire, focalPoint: "center" },
          { label: "A quiet moment before the day", src: brideWindowCloseup, focalPoint: "center" },
        ],
        [
          { label: "The restaurant they chose", src: receptionFirstDanceSparklersWide, focalPoint: "center" },
          { label: "Getting ready", src: groomGettingReadyBowtie, focalPoint: "center" },
        ],
        [{ label: "Family and tradition", src: coupleTradPortraitGold, focalPoint: "center" }],
        [
          { label: "Cutting the cake", src: receptionFirstDanceClouds, focalPoint: "center" },
          { label: "Dancing with everyone", src: receptionDanceGoldDress, focalPoint: "center" },
        ],
      ],
    ),
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
  // The image-and-text section between the introduction and the enquiry form.
  feature: {
    heading: "Every love story begins with a conversation",
    body: "Tell us about the day you're imagining — the place, the people, the feeling you want to hold on to. There's no pressure and no wrong answer; we simply listen, ask a few questions, and share how we'd bring your wedding to life.\n\nMost couples hear back from us within two working days.",
    media: { label: "A quiet moment before the day", src: brideWindowCloseup, focalPoint: "center" } as MarketingMedia,
  },
};
