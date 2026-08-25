import { createClient } from "./server";

const STORAGE_BUCKET = "jet-operations";

export async function createSignedStorageUrl(path?: string | null) {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;

  const supabase = await createClient();
  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(path, 60 * 60);

  if (error) return null;
  return data.signedUrl;
}
