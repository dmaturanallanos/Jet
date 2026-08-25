import { z } from "zod";
import { taskPriorities } from "@/config/app";

export const createReportSchema = z.object({
  title: z.string().trim().min(3, "Ingresa un titulo."),
  description: z.string().trim().min(5, "Describe el reporte."),
  observations: z.string().trim().optional().or(z.literal("")),
  importance: z.enum(taskPriorities).optional(),
  meetingPointId: z.string().uuid().optional().or(z.literal("")),
});
