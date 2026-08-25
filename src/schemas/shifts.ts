import { z } from "zod";

export const createShiftSchema = z.object({
  title: z.string().trim().min(3, "Ingresa un nombre para el turno."),
  assignedTo: z.string().uuid("Selecciona un trabajador."),
  startsAt: z.string().min(1, "Ingresa hora de inicio."),
  endsAt: z.string().min(1, "Ingresa hora de termino."),
  meetingPointId: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().trim().optional().or(z.literal("")),
});
