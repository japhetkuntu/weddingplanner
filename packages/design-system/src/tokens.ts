/** Ovutor brand tokens — shared across admin-portal, client-portal, wedding-website.
 * Sourced from Designs/Admin/DESIGN.md and Designs/Client/DESIGN.md. Keep in
 * sync with tailwind-preset.js. */

export const colors = {
  brandPrimary: "#E0115F", // ruby pink — CTAs, active states, links
  brandAccent: "#E0115F",
  brandAccentTint: "#E6F4FE",
  brandBg: "#FAF9F8", // page canvas — warm off-white
  brandBackgroundWarm: "#F9F9FB",
  brandInk: "#1E1E1E", // primary text — near-black charcoal
  brandGold: "#FEB326", // solid dark-section fills (footers, hero overlays, dark button/toast
  // variants) — replaces the old near-black ("ink") background sections. Text on top of it uses
  // `ink`, not white — white-on-gold fails contrast badly (~1.6:1).
  brandSurface: "#FFFFFF", // card / panel fill
};

export const fonts = {
  display: '"Playfair Display", Georgia, serif',
  sans: '"Inter", Arial, sans-serif',
};

// Every corner in the designs is square — radius scale is intentionally flat.
export const radius = {
  sm: "0px",
  md: "0px",
  lg: "0px",
  pill: "0px",
};

export const spacing = {
  none: "0px",
  xs: "4px",
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "24px",
  "2xl": "32px",
};

export const shadows = {
  card: "0 2px 8px rgba(30,30,30,.06)",
  modal: "0 20px 50px rgba(30,30,30,.18)",
};
