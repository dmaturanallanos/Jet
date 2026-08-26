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

export const updateUserPermissionsSchema = z.object({
  userId: z.string().uuid("Usuario invalido."),
  firstName: z.string().trim().min(2, "Ingresa el nombre."),
  lastName: z.string().trim().min(2, "Ingresa el apellido."),
  email: z.string().trim().email("Ingresa un correo valido.").optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  role: z.enum(profileRoles),
  status: z.enum(["active", "inactive"]),
});
