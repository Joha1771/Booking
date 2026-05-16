import { supabase } from "./supabase.js";

// ─── HELPERS ──────────────────────────────────────────────────

function ratingLabel(r) {
  if (r >= 9.5) return "Великолепно";
  if (r >= 9.0) return "Превосходно";
  if (r >= 8.5) return "Потрясающе";
  if (r >= 8.0) return "Очень хорошо";
  if (r >= 7.0) return "Хорошо";
  return "Оценка по отзывам";
}

function normalizeHotel(h) {
  // category в БД хранится по-русски ("Гостиница", "Апартаменты" etc.)
  // просто передаём как есть, а если английский — конвертируем
  const typeMap = {
    apartment: "Апартаменты",
    resort: "Курортный отель",
    guesthouse: "Гостевой дом",
    hostel: "Хостел",
    hotel: "Гостиница",
  };
  const type = typeMap[h.category?.toLowerCase()] || h.category || "Гостиница";

  return {
    id: h.id,
    name: h.name,
    city: h.city,
    country: h.country,
    location: h.city ? `${h.city}${h.country ? ", " + h.country : ""}` : "",
    type,
    stars: h.stars ?? 0,
    rating: parseFloat(h.rating) ?? 0,
    ratingLabel: ratingLabel(parseFloat(h.rating) ?? 0),
    reviews: h.reviews_count || 0,
    distance: h.distance_center || "",
    address: h.address || "",
    price: h.price_per_night || 0,
    priceOld: h.original_price || null,
    priceFrom: true,
    nights: 1,
    genius: h.is_genius ?? false,
    image: h.image_url || `https://picsum.photos/seed/hotel_${h.id}/300/200`,
    liked: false,
    badge: h.badge || null,
    freeCancel: h.free_cancel ?? true,
    noPrep: h.no_prepay ?? true,
    breakfast: h.breakfast ?? false,
    description: h.description || "",
  };
}

// ─── HOTELS ──────────────────────────────────────────────────

export async function getPopularHotels({ limit = 8 } = {}) {
  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .order("rating", { ascending: false })
    .limit(limit);
  if (error) console.error("getPopularHotels:", error.message);
  if (!data?.length) return getMockHotels("dubai", limit);
  return data.map(normalizeHotel);
}

export async function getWeekendHotels({ limit = 8 } = {}) {
  // Берём топ отелей по рейтингу — для "предложения на выходные"
  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .order("rating", { ascending: false })
    .limit(limit);
  if (error) console.error("getWeekendHotels:", error.message);
  if (!data?.length) return getMockHotels("tashkent", limit);
  return data.map(normalizeHotel);
}

export async function getUniqueHotels({ limit = 4 } = {}) {
  // Сначала пробуем отели с badge (уникальные места)
  const { data: badgeData, error: badgeError } = await supabase
    .from("hotels")
    .select("*")
    .not("badge", "is", null)
    .order("rating", { ascending: false })
    .limit(limit);

  if (!badgeError && badgeData?.length >= limit) {
    return badgeData.map(normalizeHotel);
  }

  // Fallback: топ отелей по рейтингу из разных стран (не Узбекистан)
  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .order("rating", { ascending: false })
    .limit(limit);
  if (error) console.error("getUniqueHotels:", error.message);
  if (!data?.length) return getMockHotels("unique", limit);
  return data.map(normalizeHotel);
}

export async function searchHotels({
  destination,
  checkIn,
  checkOut,
  adults,
  children,
  rooms,
} = {}) {
  let query = supabase
    .from("hotels")
    .select("*")
    .order("rating", { ascending: false });

  if (destination) {
    query = query.or(
      `city.ilike.%${destination}%,name.ilike.%${destination}%,country.ilike.%${destination}%`,
    );
  }

  const { data, error } = await query;
  if (error) console.error("searchHotels:", error.message);
  if (!data?.length) {
    const all = getMockHotels("all");
    if (!destination) return all;
    const q = destination.toLowerCase();
    return all.filter(
      (h) =>
        h.name?.toLowerCase().includes(q) ||
        h.location?.toLowerCase().includes(q) ||
        h.city?.toLowerCase().includes(q),
    );
  }
  return data.map(normalizeHotel);
}

export async function getHotelById(id) {
  const { data, error } = await supabase
    .from("hotels")
    .select("*")
    .eq("id", id)
    .single();
  if (error) console.error("getHotelById:", error.message);
  if (!data) {
    const all = getMockHotels("all");
    return all.find((h) => String(h.id) === String(id)) || null;
  }
  return normalizeHotel(data);
}

// ─── DESTINATIONS ─────────────────────────────────────────────

export async function getTrendingDestinations() {
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("is_trending", true)
    .order("variants", { ascending: false });
  if (error) console.error("getTrendingDestinations:", error.message);
  if (!data?.length) return getMockDestinations();
  return data.map((d) => ({
    ...d,
    image_url: d.image_url || `https://picsum.photos/seed/${d.name}/400/250`,
  }));
}

export async function getAllDestinations({ limit = 200 } = {}) {
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .order("variants", { ascending: false })
    .limit(limit);
  if (error) console.error("getAllDestinations:", error.message);
  if (!data?.length) return getMockDestinations();
  return data;
}

export async function searchDestinations(query) {
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .or(`name.ilike.%${query}%,country.ilike.%${query}%`)
    .order("variants", { ascending: false })
    .limit(8);
  if (error) console.error("searchDestinations:", error.message);
  if (!data?.length) {
    return getMockDestinations().filter(
      (d) =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.country.toLowerCase().includes(query.toLowerCase()),
    );
  }
  return data;
}

export async function getDestinationsByRegion(region) {
  const { data, error } = await supabase
    .from("destinations")
    .select("*")
    .eq("region", region)
    .order("variants", { ascending: false });
  if (error) console.error("getDestinationsByRegion:", error.message);
  return data ?? [];
}

// ─── FLIGHTS ──────────────────────────────────────────────────

// ─── CARS ─────────────────────────────────────────────────────

export async function getCars({ category } = {}) {
  let query = supabase
    .from("car_rentals")
    .select("*")
    .order("price_per_day", { ascending: true });
  if (category) query = query.eq("car_class", category);
  const { data, error } = await query;
  if (error) console.error("getCars:", error.message);
  if (!data?.length) return getMockCars();
  return data.map((c) => ({
    ...c,
    name: c.car_model,
    category: c.car_class || c.company,
    seats: c.seats,
    transmission: c.transmission,
    fuel: c.fuel_type,
    rating: parseFloat(c.rating) || 8.5,
    reviews_count: c.reviews || 0,
    image: c.image_url || `https://picsum.photos/seed/car_${c.id}/400/240`,
    priceDay: c.price_per_day,
    free_cancel: true,
  }));
}

// ─── BOOKINGS ─────────────────────────────────────────────────

export async function createBooking(bookingData) {
  const ref = "BK-" + Math.random().toString(36).substr(2, 8).toUpperCase();
  const { data, error } = await supabase
    .from("bookings")
    .insert([{ ...bookingData, booking_ref: ref }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUserBookings(userId) {
  const { data, error } = await supabase
    .from("bookings")
    .select(`*, hotels(id, name, image_url, city, country, stars, rating)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function cancelBooking(bookingId, userId) {
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ─── AUTH ─────────────────────────────────────────────────────

export async function signUp({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signIn({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// ─── MINIMAL MOCK FALLBACKS (только если Supabase недоступен) ──

function getMockHotels(type = "all", limit = 20) {
  const DUBAI = [
    {
      id: 1,
      name: "Citadines Metro Central Dubai",
      city: "Дубай",
      country: "ОАЭ",
      location: "Дубай, ОАЭ",
      type: "Апарт-отель",
      stars: 4,
      rating: 8.7,
      ratingLabel: "Потрясающе",
      reviews: 3450,
      distance: "14.6 км от центра",
      price: 623020,
      priceOld: 1064991,
      priceFrom: true,
      nights: 1,
      genius: true,
      image: "https://picsum.photos/seed/hotel1/300/200",
      liked: false,
      badge: null,
      freeCancel: true,
      noPrep: true,
      breakfast: false,
    },
    {
      id: 2,
      name: "Grand Heights Dubai Hotel Apartments",
      city: "Дубай",
      country: "ОАЭ",
      location: "Дубай, ОАЭ",
      type: "Апарт-отель",
      stars: 4,
      rating: 8.7,
      ratingLabel: "Потрясающе",
      reviews: 3173,
      distance: "14.4 км от центра",
      price: 513036,
      priceOld: 982816,
      priceFrom: true,
      nights: 1,
      genius: true,
      image: "https://picsum.photos/seed/hotel2/300/200",
      liked: false,
      badge: null,
      freeCancel: true,
      noPrep: true,
      breakfast: false,
    },
    {
      id: 3,
      name: "Gulf Oasis Hotel Apartments Fz LLC",
      city: "Дубай",
      country: "ОАЭ",
      location: "Дубай, ОАЭ",
      type: "Апартаменты",
      stars: 3,
      rating: 8.5,
      ratingLabel: "Очень хорошо",
      reviews: 1582,
      distance: "14.8 км от центра",
      price: 457946,
      priceOld: 500829,
      priceFrom: true,
      nights: 1,
      genius: true,
      image: "https://picsum.photos/seed/hotel3/300/200",
      liked: false,
      badge: null,
      freeCancel: true,
      noPrep: true,
      breakfast: false,
    },
    {
      id: 4,
      name: "Ramada by Wyndham Downtown Dubai",
      city: "Дубай",
      country: "ОАЭ",
      location: "Дубай, ОАЭ",
      type: "Отель",
      stars: 5,
      rating: 8.9,
      ratingLabel: "Потрясающе",
      reviews: 9477,
      distance: "0.3 км от центра",
      price: 693427,
      priceOld: 963094,
      priceFrom: true,
      nights: 1,
      genius: true,
      image: "https://picsum.photos/seed/hotel4/300/200",
      liked: false,
      badge: null,
      freeCancel: true,
      noPrep: true,
      breakfast: true,
    },
  ];
  const TASHKENT = [
    {
      id: 5,
      name: "Blueloft 47 | studio with balcony",
      city: "Ташкент",
      country: "Узбекистан",
      location: "Ташкент, Узбекистан",
      type: "Апартаменты",
      stars: 0,
      rating: 9.3,
      ratingLabel: "Превосходно",
      reviews: 164,
      distance: "0.5 км от центра",
      price: 1153986,
      priceOld: 1424675,
      priceFrom: true,
      nights: 2,
      genius: true,
      image: "https://picsum.photos/seed/hotel5/300/200",
      liked: false,
      badge: null,
      freeCancel: true,
      noPrep: true,
      breakfast: false,
    },
    {
      id: 6,
      name: "SADI Hotel",
      city: "Ташкент",
      country: "Узбекистан",
      location: "Ташкент, Узбекистан",
      type: "Гостиница",
      stars: 0,
      rating: 8.9,
      ratingLabel: "Потрясающе",
      reviews: 373,
      distance: "3.5 км от центра",
      price: 902616,
      priceOld: 1014175,
      priceFrom: true,
      nights: 2,
      genius: true,
      image: "https://picsum.photos/seed/hotel6/300/200",
      liked: false,
      badge: null,
      freeCancel: true,
      noPrep: true,
      breakfast: true,
    },
    {
      id: 7,
      name: "Farovon Tashkent Boutique Hotel",
      city: "Ташкент",
      country: "Узбекистан",
      location: "Ташкент, Узбекистан",
      type: "Гостиница",
      stars: 0,
      rating: 9.0,
      ratingLabel: "Превосходно",
      reviews: 48,
      distance: "1.2 км от центра",
      price: 3187770,
      priceOld: 3561688,
      priceFrom: true,
      nights: 2,
      genius: true,
      image: "https://picsum.photos/seed/hotel7/300/200",
      liked: false,
      badge: null,
      freeCancel: true,
      noPrep: true,
      breakfast: true,
    },
    {
      id: 8,
      name: "South Hotel Tashkent",
      city: "Ташкент",
      country: "Узбекистан",
      location: "Ташкент, Узбекистан",
      type: "Гостиница",
      stars: 4,
      rating: 8.3,
      ratingLabel: "Очень хорошо",
      reviews: 1373,
      distance: "4.8 км от центра",
      price: 1118853,
      priceOld: 1521625,
      priceFrom: true,
      nights: 2,
      genius: true,
      image: "https://picsum.photos/seed/hotel8/300/200",
      liked: false,
      badge: null,
      freeCancel: true,
      noPrep: true,
      breakfast: true,
    },
  ];
  const UNIQUE = [
    {
      id: 9,
      name: "Orient Star Khiva Hotel-Madrasah",
      city: "Хива",
      country: "Узбекистан",
      location: "Хива, Узбекистан",
      type: "Исторический отель",
      stars: 0,
      rating: 8.8,
      ratingLabel: "Потрясающе",
      reviews: 1136,
      distance: "0.1 км от центра",
      price: 956222,
      priceOld: 1062469,
      priceFrom: true,
      nights: 1,
      genius: true,
      image: "https://picsum.photos/seed/unique1/300/200",
      liked: false,
      badge: null,
      freeCancel: true,
      noPrep: true,
      breakfast: true,
    },
    {
      id: 10,
      name: "Tsinandali Estate",
      city: "Цинандали",
      country: "Грузия",
      location: "Цинандали, Грузия",
      type: "Курортный отель",
      stars: 5,
      rating: 9.2,
      ratingLabel: "Превосходно",
      reviews: 764,
      distance: "0.5 км от центра",
      price: 3349049,
      priceOld: 3721165,
      priceFrom: true,
      nights: 1,
      genius: true,
      image: "https://picsum.photos/seed/unique2/300/200",
      liked: false,
      badge: null,
      freeCancel: true,
      noPrep: true,
      breakfast: true,
    },
    {
      id: 11,
      name: "Shahdag Hotel & Spa",
      city: "Шахдаг",
      country: "Азербайджан",
      location: "Шахдаг, Азербайджан",
      type: "Курортный отель",
      stars: 5,
      rating: 9.3,
      ratingLabel: "Превосходно",
      reviews: 4172,
      distance: "0.0 км от центра",
      price: 1116933,
      priceOld: 1241037,
      priceFrom: true,
      nights: 1,
      genius: true,
      image: "https://picsum.photos/seed/unique3/300/200",
      liked: false,
      badge: null,
      freeCancel: true,
      noPrep: true,
      breakfast: true,
    },
    {
      id: 12,
      name: "Marxal Resort & Spa",
      city: "Шеки",
      country: "Азербайджан",
      location: "Шеки, Азербайджан",
      type: "Курортный отель",
      stars: 5,
      rating: 9.6,
      ratingLabel: "Великолепно",
      reviews: 1080,
      distance: "2.0 км от центра",
      price: 1276495,
      priceOld: null,
      priceFrom: true,
      nights: 1,
      genius: true,
      image: "https://picsum.photos/seed/unique4/300/200",
      liked: false,
      badge: null,
      freeCancel: true,
      noPrep: true,
      breakfast: true,
    },
  ];
  if (type === "dubai") return DUBAI.slice(0, limit);
  if (type === "tashkent") return TASHKENT.slice(0, limit);
  if (type === "unique") return UNIQUE.slice(0, limit);
  return [...DUBAI, ...TASHKENT, ...UNIQUE].slice(0, limit);
}

function getMockDestinations() {
  return [
    {
      id: 1,
      name: "Ташкент",
      country: "Узбекистан",
      flag: "🇺🇿",
      variants: 1408,
      avg_price: 950000,
      image_url:
        "https://cf.bstatic.com/xdata/images/city/max1280x900/686023.jpg?k=315b82bac9991c71d6f14f8618e68a9b6d3f45b61b9ceb335523918d0e086dbf&o=",
      is_trending: true,
    },
    {
      id: 2,
      name: "Самарканд",
      country: "Узбекистан",
      flag: "🇺🇿",
      variants: 864,
      avg_price: 759000,
      image_url:
        "https://cf.bstatic.com/xdata/images/city/max1280x900/916707.jpg?k=92d3c6a6f59fe96b7044218defba0d9e1b9b376b424121dbb29db63a45c62d24&o=",
      is_trending: true,
    },
    {
      id: 3,
      name: "Бухара",
      country: "Узбекистан",
      flag: "🇺🇿",
      variants: 570,
      avg_price: 641000,
      image_url:
        "https://cf.bstatic.com/xdata/images/city/max1280x900/948982.jpg?k=df876b79aa087808adf33387dfdad56350813a328ca436dbad74fb9fa597bc16&o=",
      is_trending: true,
    },
    {
      id: 4,
      name: "Хива",
      country: "Узбекистан",
      flag: "🇺🇿",
      variants: 154,
      avg_price: 520000,
      image_url:
        "https://cf.bstatic.com/xdata/images/city/max1280x900/685491.jpg?k=c01e7a88b1b08c54bb3f282ec0ddc28e0ef82e8c3cb48a2b37baa0e91e9cac38&o=",
      is_trending: true,
    },
    {
      id: 5,
      name: "Стамбул",
      country: "Турция",
      flag: "🇹🇷",
      variants: 4863,
      avg_price: 2138000,
      image_url:
        "https://cf.bstatic.com/xdata/images/city/max1280x900/999839.jpg?k=0c48abf88150a98bc1ec9280347e9ea97f41265ebfc439c53a5b8fec61ab4fa5&o=",
      is_trending: true,
    },
    {
      id: 6,
      name: "Дубай",
      country: "ОАЭ",
      flag: "🇦🇪",
      variants: 28003,
      avg_price: 3557000,
      image_url:
        "https://cf.bstatic.com/xdata/images/city/max1280x900/1000203.jpg?k=207c20a3559b06975deaac8d2e5721e7bb33797dcc064c386533101d12281a39&o=",
      is_trending: true,
    },
  ];
}

function getMockCars() {
  return [
    {
      id: 1,
      name: "Toyota Camry",
      category: "Бизнес",
      seats: 5,
      transmission: "Автомат",
      fuel: "Бензин",
      ac: true,
      rating: 9.1,
      reviews_count: 243,
      company: "Hertz",
      priceDay: 320000,
      free_cancel: true,
      image: "https://picsum.photos/seed/car1/400/240",
    },
    {
      id: 2,
      name: "Hyundai Sonata",
      category: "Средний класс",
      seats: 5,
      transmission: "Автомат",
      fuel: "Бензин",
      ac: true,
      rating: 8.8,
      reviews_count: 184,
      company: "Avis",
      priceDay: 245000,
      free_cancel: true,
      image: "https://picsum.photos/seed/car2/400/240",
    },
    {
      id: 3,
      name: "Chevrolet Spark",
      category: "Эконом",
      seats: 5,
      transmission: "Механика",
      fuel: "Бензин",
      ac: true,
      rating: 8.3,
      reviews_count: 97,
      company: "Budget",
      priceDay: 145000,
      free_cancel: false,
      image: "https://picsum.photos/seed/car3/400/240",
    },
    {
      id: 4,
      name: "Mercedes-Benz E-Class",
      category: "Премиум",
      seats: 5,
      transmission: "Автомат",
      fuel: "Бензин",
      ac: true,
      rating: 9.5,
      reviews_count: 312,
      company: "Europcar",
      priceDay: 680000,
      free_cancel: true,
      image: "https://picsum.photos/seed/car4/400/240",
    },
    {
      id: 5,
      name: "Toyota Land Cruiser",
      category: "Внедорожник",
      seats: 7,
      transmission: "Автомат",
      fuel: "Дизель",
      ac: true,
      rating: 9.3,
      reviews_count: 421,
      company: "Hertz",
      priceDay: 890000,
      free_cancel: true,
      image: "https://picsum.photos/seed/car5/400/240",
    },
    {
      id: 6,
      name: "Kia Rio",
      category: "Эконом",
      seats: 5,
      transmission: "Автомат",
      fuel: "Бензин",
      ac: true,
      rating: 8.6,
      reviews_count: 156,
      company: "Budget",
      priceDay: 165000,
      free_cancel: true,
      image: "https://picsum.photos/seed/car6/400/240",
    },
  ];
}
