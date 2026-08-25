import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  organization_id: string;
  display_name: string;
  role: "admin" | "moderator" | "scout";
  status: "active" | "inactive";
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, organization_id, display_name, role, status")
    .eq("id", user.id)
    .maybeSingle();

  return data as CurrentProfile | null;
}

export function canManageOperations(role?: CurrentProfile["role"] | null) {
  return role === "admin" || role === "moderator";
}
