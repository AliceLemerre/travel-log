import { supabase } from "../lib/supabaseClient";

export interface Media {
  id: number;
  nom: string;
  url: string;
  voyage_id: number;
  etape_id: number | null;
  user_id: string;
}

export async function getMediasByVoyage(voyageId: number) {
  return supabase
    .from("Medias")
    .select("*")
    .eq("voyage_id", voyageId)
    .order("created_at", { ascending: false });
}

export async function getMediasByEtape(etapeId: number) {
  return supabase
    .from("Medias")
    .select("*")
    .eq("etape_id", etapeId)
    .order("created_at", { ascending: false });
}

export async function addMedia({
  nom,
  url,
  voyage_id,
  etape_id,
  user_id,
}: {
  nom: string;
  url: string;
  voyage_id: number;
  etape_id: number | null;
  user_id: string;
}) {
  return supabase.from("Medias").insert({
    nom,
    url,
    voyage_id,
    etape_id,
    user_id,
  });
}

export async function updateMedia(
  id: number,
  payload: Partial<Pick<Media, "nom" | "url">>
) {
  return supabase.from("Medias").update(payload).eq("id", id);
}

export async function deleteMedia(id: number) {
  return supabase.from("Medias").delete().eq("id", id);
}
