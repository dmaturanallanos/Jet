"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createUserSchema } from "@/schemas/users";

export type CreateUserState = {
  message?: string;
  error?: string;
};

export async function createUser(_state: CreateUserState, formData: FormData): Promise<CreateUserState> {
  const currentProfile = await getCurrentProfile();

  if (!currentProfile || currentProfile.role !== "admin") {
    return { error: "Solo un administrador puede crear usuarios." };
  }

  const parsed = createUserSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    role: formData.get("role"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del usuario." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Falta SUPABASE_SERVICE_ROLE_KEY en .env.local para crear usuarios desde la app." };
  }

  const { data, error } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: {
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      role: parsed.data.role,
    },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "No fue posible crear el usuario." };
  }

  const displayName = `${parsed.data.firstName} ${parsed.data.lastName}`;
  const { error: profileError } = await admin.from("profiles").insert({
    id: data.user.id,
    organization_id: currentProfile.organization_id,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    display_name: displayName,
    phone: parsed.data.phone || null,
    role: parsed.data.role,
    status: "active",
  });

  if (profileError) {
    return { error: `Usuario Auth creado, pero fallo el perfil: ${profileError.message}` };
  }

  revalidatePath("/users");
  return { message: `Usuario ${displayName} creado correctamente.` };
}
