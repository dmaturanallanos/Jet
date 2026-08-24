import { z } from "zod";
import { profileRoles } from "@/config/app";

export const createUserSchema = z.object({
  email: z.string().trim().email("Ingresa un correo valido."),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
  firstName: z.string().trim().min(2, "Ingresa el nombre."),
  lastName: z.string().trim().min(2, "Ingresa el apellido."),
  role: z.enum(profileRoles),
  phone: z.string().trim().optional().or(z.literal("")),
});
