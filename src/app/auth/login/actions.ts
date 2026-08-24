"use server";

import { redirect } from "next/navigation";
import { loginSchema } from "@/schemas/auth";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

export async function signIn(_previousState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa tus datos." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "No fue posible iniciar sesion con esas credenciales." };
  }

  redirect("/dashboard");
}
