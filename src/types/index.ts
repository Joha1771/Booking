
export interface DbHotel {
  id: number; name: string; city: string | null; country: string | null;
  address: string | null; stars: number | null; rating: number | null;
  reviews_count: number | null; price_per_night: number | null;
  original_price: number | null; category: string | null; is_genius: boolean | null;
  image_url: string | null; description: string | null; distance_center: string | null;
  badge: string | null; free_cancel: boolean | null; no_prepay: boolean | null;
  breakfast: boolean | null; created_at: string | null;
}

export interface DbDestination {
  id: number; name: string; country: string | null; flag: string | null;
  variants: number | null; avg_price: number | null; image_url: string | null;
  dest_type: string | null; is_trending: boolean | null; region: string | null;
}

export interface DbAttraction {
  id: number; name: string; city: string | null; country: string | null;
  category: string | null; rating: number | null; reviews_count: number | null;
  price: number | null; duration_hours: number | null; image_url: string | null;
  badge: string | null; free_cancel: boolean | null; description: string | null;
  includes: string[] | null; excludes: string[] | null; slug: string | null;
  created_at: string | null;
}

export interface DbAttractionCity {
  id: number; name: string; country: string | null; region: string | null;
  variants: number | null; image_url: string | null; created_at: string | null;
}

export interface DbBooking {
  id: number; user_id: string | null; hotel_id: number | null;
  check_in: string | null; check_out: string | null;
  adults: number | null; children: number | null; rooms: number | null;
  total_price: number | null; status: string | null; booking_ref: string | null;
  guest_name: string | null; guest_email: string | null; guest_phone: string | null;
  payment_method: string | null; special_requests: string | null;
  created_at: string | null;
  hotels?: Pick<DbHotel, "id" | "name" | "image_url" | "city" | "country" | "stars" | "rating">;
}

export interface DbProfile {
  id: string; full_name: string | null; email: string | null;
  avatar_url: string | null; phone: string | null; created_at: string | null;
}

export interface DbFlight {
  id: number; airline: string | null; airline_code: string | null;
  from_city: string | null; from_code: string | null;
  to_city: string | null; to_code: string | null;
  depart_time: string | null; arrive_time: string | null;
  return_depart_time: string | null; return_arrive_time: string | null;
  duration: string | null; return_duration: string | null;
  stops: string | null; price: number | null; cabin_class: string | null;
  is_best: boolean | null; is_cheapest: boolean | null;
}

// ─── UI TYPES ─────────────────────────────────────────────────

export interface Hotel {
  id: number; name: string; city: string; country: string; location: string;
  type: string; stars: number; rating: number; ratingLabel: string;
  reviews: number; distance: string; address: string; price: number;
  priceOld: number | null; nights: number; genius: boolean; image: string;
  liked: boolean; badge: string | null; freeCancel: boolean; noPrep: boolean;
  breakfast: boolean; description: string;
}

export interface Destination {
  id: number; name: string; country: string; flag: string;
  variants: number; avg_price: number; image_url: string;
  dest_type: string; is_trending: boolean; region: string;
}

export interface Attraction {
  id: number; name: string; city: string; country: string; category: string;
  rating: number; reviews_count: number; price: number; duration_hours: number;
  image_url: string; badge: string | null; free_cancel: boolean;
  description: string; includes: string[]; excludes: string[]; slug: string | null;
}

export interface AttractionCity {
  id: number; name: string; slug: string; country: string;
  region: string; variants: number; image_url: string;
}

export interface SearchParams {
  destination: string; checkIn: Date; checkOut: Date;
  adults: number; children: number; rooms: number;
}

export interface UserProfile {
  id: string; full_name: string | null; email: string | null;
  avatar_url: string | null; phone: string | null;
}
