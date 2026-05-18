// CLIENT-SIDE ONLY — uses browser Supabase client, safe in "use client" components
import { createClient } from "@/lib/supabase/client";
import type { Hotel, DbHotel } from "@/types";

export function ratingLabel(r: number): string {
  if (r >= 9.5) return "Великолепно";
  if (r >= 9.0) return "Превосходно";
  if (r >= 8.5) return "Потрясающе";
  if (r >= 8.0) return "Очень хорошо";
  if (r >= 7.0) return "Хорошо";
  return "Оценка по отзывам";
}

export function normalizeHotel(h: DbHotel): Hotel {
  const typeMap: Record<string, string> = {
    apartment: "Апартаменты", resort: "Курортный отель",
    guesthouse: "Гостевой дом", hostel: "Хостел", hotel: "Гостиница",
  };
  const type = typeMap[h.category?.toLowerCase() ?? ""] || h.category || "Гостиница";
  const rating = parseFloat(String(h.rating ?? 0));
  return {
    id: h.id, name: h.name,
    city: h.city ?? "", country: h.country ?? "",
    location: h.city ? `${h.city}${h.country ? ", " + h.country : ""}` : "",
    type, stars: h.stars ?? 0, rating,
    ratingLabel: ratingLabel(rating),
    reviews: h.reviews_count ?? 0,
    distance: h.distance_center ?? "",
    address: h.address ?? "",
    price: h.price_per_night ?? 0,
    priceOld: h.original_price ?? null,
    nights: 1,
    genius: h.is_genius ?? false,
    image: h.image_url || `https://picsum.photos/seed/hotel_${h.id}/300/200`,
    liked: false, badge: h.badge ?? null,
    freeCancel: h.free_cancel ?? true,
    noPrep: h.no_prepay ?? true,
    breakfast: h.breakfast ?? false,
    description: h.description ?? "",
  };
}

export async function searchHotelsClient(destination: string): Promise<Hotel[]> {
  const supabase = createClient();
  let query = supabase.from("hotels").select("*").order("rating", { ascending: false });
  if (destination) {
    query = query.or(
      `city.ilike.%${destination}%,name.ilike.%${destination}%,country.ilike.%${destination}%`
    );
  }
  const { data } = await query;
  return ((data ?? []) as DbHotel[]).map(normalizeHotel);
}

export async function getHotelByIdClient(id: number | string): Promise<Hotel | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from("hotels").select("*").eq("id", id).single();
  if (error || !data) return null;
  return normalizeHotel(data as DbHotel);
}
