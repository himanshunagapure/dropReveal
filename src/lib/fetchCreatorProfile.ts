import { supabase } from "@/lib/supabase";

export type CreatorProfile = {
  id: string;
  handle: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
};

export async function fetchCreatorProfile(handle: string): Promise<CreatorProfile | null> {
  const { data, error } = await supabase
    .from("creators")
    .select("id, handle, display_name, avatar_url, bio")
    .eq("handle", handle.trim().toLowerCase())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as CreatorProfile | null;
}
