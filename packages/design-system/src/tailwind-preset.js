/** Tailwind theme extension shared across all Ovutor apps. Keep in sync with tokens.ts / DESIGN.md. */

export default {
  theme: {
    extend: {
      colors: {
        primary: "#E0115F", // brand-primary / brand-accent — ruby pink
        "primary-tint": "#E6F4FE",
        ink: "#1E1E1E", // brand-ink — charcoal body text
        bg: "#FAF9F8", // brand-background — warm off-white canvas
        "bg-warm": "#F9F9FB",
        surface: "#FFFFFF", // brand-surface — card/panel fill
        // Solid dark-section fills (footers, hero overlays, dark button/toast variants) —
        // replaces the old near-black ("ink") background sections. Always pair with `text-ink`,
        // never `text-white` — white-on-gold fails contrast badly (~1.6:1).
        gold: "#FEB326",
      },
      fontFamily: {
        display: ['"Playfair Display"', "Georgia", "serif"],
        sans: ["Inter", "Arial", "sans-serif"],
        // The Ovutor wordmark's cursive script — only the wedding-website app loads the font file
        // and uses this, but the token lives here alongside the others it's kept in sync with.
        script: ['"Alex Brush"', "cursive"],
      },
      // Every corner in the designs is square — flatten Tailwind's radius scale.
      borderRadius: {
        none: "0px",
        sm: "0px",
        DEFAULT: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "0px",
        pill: "0px",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
        "2xl": "32px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(30,30,30,.06)",
        modal: "0 20px 50px rgba(30,30,30,.18)",
      },
    },
  },
};
