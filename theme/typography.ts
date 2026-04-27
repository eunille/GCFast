// theme/typography.ts
// Layer: THEME — all typography tokens live here. Never hardcode font values in components.

export const typography = {
  fontFamily: {
    sans: "Inter, sans-serif",
    mono: "JetBrains Mono, monospace",
  },
  fontSize: {
    xs: "0.75rem",   // 12px — captions, labels
    sm: "0.875rem",  // 14px — table cells, secondary text
    base: "1rem",    // 16px — body text
    lg: "1.125rem",  // 18px — card titles
    xl: "1.25rem",   // 20px — section headings
    "2xl": "1.5rem", // 24px — page headings
    "3xl": "1.875rem", // 30px — dashboard hero numbers
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;
