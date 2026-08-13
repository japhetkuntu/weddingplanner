import designSystemPreset from "@ovutor/design-system/tailwind-preset";

export default {
  presets: [designSystemPreset],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
    "../../packages/design-system/src/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
};
