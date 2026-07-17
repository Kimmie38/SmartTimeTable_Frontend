// Central design system for the Faculty of Computing Timetable App
// Green + Gold brand, refined for a more advanced / professional feel.

export const colors = {
  // Brand
  primary: "#0B6E4F",
  primaryDark: "#084F39",
  primaryDarker: "#063526",
  primaryLight: "#BFE3D2",
  primarySoft: "#EAF7F1",

  accent: "#F5A623",
  accentDark: "#0B6E4F",
  accentLight: "#BFE3D2",
  accentSoft: "#EAF7F1",

  // Neutrals
  ink: "#0F2A22",
  inkSoft: "#1A3B30",
  body: "#3A4B45",
  muted: "#5B6B65",
  faint: "#9AA6A1",
  border: "#DCEDE5",
  borderSoft: "#E9F3EE",
  divider: "#EFF7F2",

  surface: "#FFFFFF",
  background: "#F4FBF8",
  backgroundAlt: "#EAF3EF",

  // Status
  success: "#0B6E4F",
  successBg: "#EAF7F1",
  successBorder: "#BFE3D2",

  warning: "#B45309",
  warningBg: "#FDEFD3",
  warningBorder: "#F7CD7E",

  danger: "#DC2626",
  dangerBg: "#FADCDC",
  dangerBorder: "#F0A3A3",

  info: "#1D4ED8",
  infoBg: "#DCE8FE",

  white: "#FFFFFF",
  black: "#111111",
  overlay: "rgba(15, 42, 34, 0.65)",
};

export const font = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const shadow = {
  card: {
    shadowColor: "#0B4027",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  raised: {
    shadowColor: "#0B4027",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
    elevation: 6,
  },
  floating: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
};

// Status -> visual mapping used across student + admin screens
export const statusStyles = {
  Ongoing: {
    color: colors.success,
    bg: colors.successBg,
    border: colors.successBorder,
    label: "Ongoing",
  },
  Pending: {
    color: colors.warning,
    bg: colors.warningBg,
    border: colors.warningBorder,
    label: "Pending",
  },
  Cancelled: {
    color: colors.danger,
    bg: colors.dangerBg,
    border: colors.dangerBorder,
    label: "Cancelled",
  },
  Completed: {
    color: colors.info,
    bg: colors.infoBg,
    border: "#B8D2FC",
    label: "Completed",
  },
};

export const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
export const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const WEEKDAY_SHORT = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri" };

export function getTodayName() {
  return DAY_NAMES[new Date().getDay()];
}

export function formatFullDate(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatShortDate(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}