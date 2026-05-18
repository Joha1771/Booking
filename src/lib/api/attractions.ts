import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { Attraction, AttractionCity, DbAttraction, DbAttractionCity } from "@/types";

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export function normalizeAttraction(a: DbAttraction): Attraction {
  return {
    id: a.id, name: a.name, city: a.city ?? "", country: a.country ?? "",
    category: a.category ?? "Экскурсии",
    rating: parseFloat(String(a.rating ?? 0)),
    reviews_count: a.reviews_count ?? 0, price: a.price ?? 0,
    duration_hours: a.duration_hours ?? 2,
    image_url: a.image_url || `https://picsum.photos/seed/attr_${a.id}/800/500`,
    badge: a.badge ?? null, free_cancel: a.free_cancel ?? true,
    description: a.description ?? "",
    includes: a.includes ?? [], excludes: a.excludes ?? [], slug: a.slug ?? null,
  };
}

export function normalizeCity(c: DbAttractionCity): AttractionCity {
  return {
    id: c.id, name: c.name, slug: slugify(c.name),
    country: c.country ?? "", region: c.region ?? "Все",
    variants: c.variants ?? 0,
    image_url: c.image_url || `https://picsum.photos/seed/${slugify(c.name)}/600/400`,
  };
}

export async function getAttractions(city?: string, limit = 12): Promise<Attraction[]> {
  const supabase = await createClient();
  let query = supabase.from("attractions").select("*")
    .order("rating", { ascending: false }).limit(limit);
  if (city) query = query.eq("city", city);
  const { data } = await query;
  return ((data ?? []) as DbAttraction[]).map(normalizeAttraction);
}

export async function getAttractionById(id: number | string): Promise<Attraction | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("attractions").select("*").eq("id", id).single();
  if (error || !data) return null;
  return normalizeAttraction(data as DbAttraction);
}

export async function getAttractionCities(): Promise<AttractionCity[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("attraction_cities").select("*")
    .order("variants", { ascending: false });
  return ((data ?? []) as DbAttractionCity[]).map(normalizeCity);
}

export async function searchAttractionsClient(params: {
  city?: string; category?: string; query?: string; limit?: number;
}): Promise<Attraction[]> {
  const supabase = createBrowserClient();
  let q = supabase.from("attractions").select("*")
    .order("rating", { ascending: false }).limit(params.limit ?? 60);
  if (params.city) q = q.eq("city", params.city);
  if (params.category) q = q.eq("category", params.category);
  if (params.query) q = q.ilike("name", `%${params.query}%`);
  const { data } = await q;
  return ((data ?? []) as DbAttraction[]).map(normalizeAttraction);
}
