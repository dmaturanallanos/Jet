import { z } from "zod";
import { taskPriorities } from "@/config/app";

export const createTaskSchema = z.object({
  title: z.string().trim().min(3, "Ingresa un titulo."),
  description: z.string().trim().optional().or(z.literal("")),
  priority: z.enum(taskPriorities),
  meetingPointId: z.string().uuid().optional().or(z.literal("")),
  assignedTo: z.string().uuid().optional().or(z.literal("")),
  dueDate: z.string().optional().or(z.literal("")),
});
