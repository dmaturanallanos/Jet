"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { createClient } from "@/lib/supabase/server";
import { meetingPointSchema } from "@/schemas/meeting-point";
import { parseMapsLink, slugify } from "@/utils/geo";

export type PointFormState = {
  error?: string;
};

export async function createMeetingPoint(_state: PointFormState, formData: FormData): Promise<PointFormState> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return { error: "Solo un administrador puede crear Puntos Jet." };
  }

  const parsed = meetingPointSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address"),
    mapsLink: formData.get("mapsLink"),
    latitude: formData.get("latitude") || undefined,
    longitude: formData.get("longitude") || undefined,
    reference: formData.get("reference"),
    description: formData.get("description"),
    status: formData.get("status"),
    internalNotes: formData.get("internalNotes"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Revisa los datos del punto." };
  }

  const mapsCoords = parsed.data.mapsLink ? parseMapsLink(parsed.data.mapsLink) : null;
  const latitude = parsed.data.latitude === "" || parsed.data.latitude === undefined ? mapsCoords?.latitude ?? null : Number(parsed.data.latitude);
  const longitude = parsed.data.longitude === "" || parsed.data.longitude === undefined ? mapsCoords?.longitude ?? null : Number(parsed.data.longitude);

  const supabase = await createClient();
  const slugBase = slugify(parsed.data.name);
  const slug = `${slugBase}-${Date.now().toString(36)}`;

  const { data: point, error } = await supabase
    .from("meeting_points")
    .insert({
      organization_id: profile.organization_id,
      name: parsed.data.name,
      slug,
      address: parsed.data.address || parsed.data.mapsLink || "Sin direccion",
      latitude,
      longitude,
      reference: parsed.data.reference || null,
      description: parsed.data.description || null,
      status: parsed.data.status,
      internal_notes: parsed.data.internalNotes || null,
      created_by: profile.id,
      updated_by: profile.id,
    })
    .select("id")
    .single();

  if (error || !point) {
    return { error: error?.message ?? "No fue posible crear el Punto Jet." };
  }

  await uploadPointImage(formData.get("image"), point.id, profile.organization_id, profile.id, true);

  await supabase.from("activity_logs").insert({
    organization_id: profile.organization_id,
    user_id: profile.id,
    meeting_point_id: point.id,
    action_type: "meeting_point_created",
    entity_type: "meeting_point",
    entity_id: point.id,
    title: "Punto Jet creado",
    description: parsed.data.name,
  });

  revalidatePath("/points");
  redirect(`/points/${point.id}`);
}

export async function uploadReferenceImage(_state: PointFormState, formData: FormData): Promise<PointFormState> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Debes iniciar sesion." };

  const pointId = String(formData.get("pointId") ?? "");
  if (!pointId) return { error: "Punto no encontrado." };

  const result = await uploadPointImage(formData.get("image"), pointId, profile.organization_id, profile.id, false);
  if (result?.error) return result;

  revalidatePath(`/points/${pointId}`);
  return {};
}

async function uploadPointImage(
  value: FormDataEntryValue | null,
  pointId: string,
  organizationId: string,
  userId: string,
  primary: boolean,
): Promise<PointFormState | null> {
  if (!(value instanceof File) || value.size === 0) return null;

  if (!["image/jpeg", "image/png", "image/webp"].includes(value.type)) {
    return { error: "La imagen debe ser JPG, PNG o WEBP." };
  }

  if (value.size > 8 * 1024 * 1024) {
    return { error: "La imagen no puede superar 8 MB." };
  }

  const supabase = await createClient();
  const extension = value.name.split(".").pop()?.toLowerCase() || "jpg";
  const storagePath = `${organizationId}/meeting-points/${pointId}/${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage.from("jet-operations").upload(storagePath, value, {
    contentType: value.type,
    upsert: false,
  });

  if (uploadError) return { error: uploadError.message };

  const { error: imageError } = await supabase.from("meeting_point_images").insert({
    organization_id: organizationId,
    meeting_point_id: pointId,
    storage_path: storagePath,
    is_primary: primary,
    uploaded_by: userId,
  });

  if (imageError) return { error: imageError.message };

  if (primary) {
    await supabase.from("meeting_points").update({ main_image_url: storagePath, updated_by: userId }).eq("id", pointId);
  }

  await supabase.from("activity_logs").insert({
    organization_id: organizationId,
    user_id: userId,
    meeting_point_id: pointId,
    action_type: "meeting_point_image_added",
    entity_type: "meeting_point",
    entity_id: pointId,
    title: "Imagen agregada",
    description: storagePath,
  });

  return null;
}
