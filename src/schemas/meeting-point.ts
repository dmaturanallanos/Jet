import { z } from "zod";
import { meetingPointStatuses } from "@/config/app";

export const meetingPointSchema = z.object({
  name: z.string().trim().min(2, "Ingresa un nombre para el Punto Jet."),
  address: z.string().trim().optional().or(z.literal("")),
  mapsLink: z.string().trim().optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal("")),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal("")),
  targetScooters: z.coerce.number().int().min(0, "No puede ser negativo.").max(200, "Revisa la cantidad de scooters.").optional().or(z.literal("")),
  reference: z.string().trim().max(240).optional().or(z.literal("")),
  description: z.string().trim().max(1200).optional().or(z.literal("")),
  status: z.enum(meetingPointStatuses),
  internalNotes: z.string().trim().max(2000).optional().or(z.literal("")),
}).refine((data) => data.address || data.mapsLink || (data.latitude !== "" && data.longitude !== ""), {
  message: "Agrega direccion, coordenadas o un link de Google Maps.",
  path: ["address"],
});

export type MeetingPointInput = z.infer<typeof meetingPointSchema>;
