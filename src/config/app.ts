export const appConfig = {
  name: "Jet Scooter Operaciones",
  shortName: "Jet Ops",
  description: "PWA interna para gestionar Puntos Jet, tareas, reportes y actividad operativa.",
  timezone: "America/Santiago",
  colors: {
    jetBlue: "#16c8ff",
  },
  routes: {
    dashboard: "/dashboard",
    map: "/map",
    points: "/points",
    tasks: "/tasks",
    reports: "/reports",
    dailyReports: "/reports/daily",
    users: "/users",
    settings: "/settings",
    profile: "/profile",
    login: "/auth/login",
  },
} as const;

export const meetingPointStatuses = ["active", "inactive", "review", "temporary"] as const;
export const taskPriorities = ["low", "medium", "high", "urgent"] as const;
export const taskStatuses = ["pending", "in_progress", "completed", "cancelled"] as const;
export const profileRoles = ["admin", "operator"] as const;

export const imageLimits = {
  maxSizeMb: 8,
  allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;
