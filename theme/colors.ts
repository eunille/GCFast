// theme/colors.ts
// Layer: THEME — all color tokens live here. Never hardcode colors in components.

export const palette = {
  blue: {
    900: "#1E3A5F", // Dark navy — primary brand
    600: "#2E86C1", // Accent blue — buttons, links
    100: "#D6E4F0", // Light blue — backgrounds, table headers
  },
  gray: {
    700: "#7F8C8D", // Muted text, captions
    100: "#F2F3F4", // Table row stripe, backgrounds
  },
  green: {
    500: "#27AE60", // All Dues Paid badge
    100: "#D5F5E3", // All Dues Paid badge background
  },
  red: {
    500: "#E74C3C", // Has Outstanding Balance badge
    100: "#FADBD8", // Has Outstanding Balance badge background
  },
  white: "#FFFFFF",
  text: {
    primary: "#2C3E50",
    secondary: "#7F8C8D",
  },
} as const;

// Semantic tokens — use these in components, not raw palette values
export const colors = {
  brand: {
    primary: palette.blue[900],
    accent: palette.blue[600],
    subtle: palette.blue[100],
  },
  status: {
    paid: palette.green[500],
    paidBg: palette.green[100],
    outstanding: palette.red[500],
    outstandingBg: palette.red[100],
  },
  surface: {
    page: palette.white,
    stripe: palette.gray[100],
    header: palette.blue[900],
  },
  text: palette.text,
} as const;
