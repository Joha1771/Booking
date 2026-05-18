// CLIENT-SIDE ONLY — uses browser Supabase client, safe in "use client" components
import { createClient } from "@/lib/supabase/client";
import type {
  Attraction,
  AttractionCity,
  DbAttraction,
  DbAttractionCity,
} from "@/types";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function normalizeAttraction(a: DbAttraction): Attraction {
  return {
    id: a.id,
    name: a.name,
    city: a.city ?? "",
    country: a.country ?? "",
    category: a.category ?? "Экскурсии",
    rating: parseFloat(String(a.rating ?? 0)),
    reviews_count: a.reviews_count ?? 0,
    price: a.price ?? 0,
    duration_hours: a.duration_hours ?? 2,
    image_url: a.image_url || `https://picsum.photos/seed/attr_${a.id}/800/500`,
    badge: a.badge ?? null,
    free_cancel: a.free_cancel ?? true,
    description: a.description ?? "",
    includes: a.includes ?? [],
    excludes: a.excludes ?? [],
    slug: a.slug ?? null,
  };
}

function normalizeCity(c: DbAttractionCity): AttractionCity {
  return {
    id: c.id,
    name: c.name,
    slug: slugify(c.name),
    country: c.country ?? "",
    region: c.region ?? "Все",
    variants: c.variants ?? 0,
    image_url:
      c.image_url || `https://picsum.photos/seed/${slugify(c.name)}/600/400`,
  };
}

export async function searchAttractionsClient(params: {
  city?: string;
  category?: string;
  query?: string;
  limit?: number;
}): Promise<Attraction[]> {
  const supabase = createClient();
  let q = supabase
    .from("attractions")
    .select("*")
    .order("rating", { ascending: false })
    .limit(params.limit ?? 60);
  if (params.city) q = q.eq("city", params.city);
  if (params.category) q = q.eq("category", params.category);
  if (params.query) q = q.ilike("name", `%${params.query}%`);
  const { data } = await q;
  return ((data ?? []) as DbAttraction[]).map(normalizeAttraction);
}

export async function getAttractionCities(): Promise<AttractionCity[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("attraction_cities")
    .select("*")
    .order("variants", { ascending: false });
  return ((data ?? []) as DbAttractionCity[]).map(normalizeCity);
}

export async function getAttractionById(
  id: number | string,
): Promise<Attraction | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("attractions")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return normalizeAttraction(data as DbAttraction);
}

export interface DiscoveryCard {
  id: string | number;
  title: string;
  subtitle: string;
  category: string;
  citySlug: string;
  totalItems: number;
  image: string;
}

export async function getAttractionDiscoveryCards(): Promise<DiscoveryCard[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("attraction_collections")
    .select("*")
    .order("sort_order", { ascending: true });
  if (!error && data?.length) {
    return data.map((row: any, i: number) => ({
      id: row.id || `collection-${i + 1}`,
      title: row.title || "Подборка",
      subtitle: row.subtitle || "Лучшие развлечения для выбранной категории.",
      category: row.category || "История",
      citySlug: row.city_slug || "all",
      totalItems: Number(row.total_items ?? 0),
      image:
        row.image_url ||
        `https://picsum.photos/seed/collection-${i + 1}/1200/760`,
    }));
  }
  return [];
}
