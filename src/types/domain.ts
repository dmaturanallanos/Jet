import type {
  meetingPointStatuses,
  profileRoles,
  taskPriorities,
  taskStatuses,
} from "@/config/app";

export type ProfileRole = (typeof profileRoles)[number];
export type MeetingPointStatus = (typeof meetingPointStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];
export type TaskStatus = (typeof taskStatuses)[number];

export type Profile = {
  id: string;
  organizationId: string;
  displayName: string;
  role: ProfileRole;
  status: "active" | "inactive";
};

export const roleLabels: Record<ProfileRole, string> = {
  admin: "Administrador",
  moderator: "Moderador",
  scout: "Scout",
};
