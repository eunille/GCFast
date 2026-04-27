// theme/radius.ts
// Layer: THEME — border radius tokens. Never hardcode radius values in components.

export const radius = {
  none: "0px",
  sm: "0.125rem",  // 2px
  base: "0.25rem", // 4px
  md: "0.375rem",  // 6px
  lg: "0.5rem",    // 8px
  xl: "0.75rem",   // 12px
  "2xl": "1rem",   // 16px
  full: "9999px",  // pill shape
} as const;
