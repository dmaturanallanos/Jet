"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { canManageOperations, getCurrentProfile } from "@/lib/auth/current-profile";
import { createClient } from "@/lib/supabase/server";
import { createUserSchema, updateUserPermissionsSchema } from "@/schemas/users";

export type CreateUserState = {
  message?: string;
  error?: string;
};

export async function createUser(_state: CreateUserState, formData: FormData): Promise<CreateUserState> {
  const currentProfile = await getCurrentProfile();

  if (!currentProfile || !canManageOperations(currentProfile.role)) {
    return { error: "Solo administradores o moderadores pueden crear usuarios." };
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
    email: parsed.data.email,
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

export async function updateUserPermissions(formData: FormData) {
  const currentProfile = await getCurrentProfile();

  if (!currentProfile || currentProfile.role !== "admin") {
    return;
  }

  const parsed = updateUserPermissionsSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    status: formData.get("status"),
  });

  if (!parsed.success) return;
  if (parsed.data.userId === currentProfile.id && parsed.data.role !== "admin") return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({
      role: parsed.data.role,
      status: parsed.data.status,
    })
    .eq("id", parsed.data.userId)
    .eq("organization_id", currentProfile.organization_id);

  if (error) return;

  try {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(parsed.data.userId, {
      user_metadata: { role: parsed.data.role },
    });
  } catch {
    // The app reads permissions from profiles, so Auth metadata sync is optional.
  }

  revalidatePath("/users");
}
