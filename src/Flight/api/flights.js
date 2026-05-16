import { supabase } from "../../lib/supabase.js";

const AIRPORT_HINTS = {
  TAS: {
    city: "Ташкент",
    airport_name: "Islam Karimov Tashkent International Airport",
    country: "Узбекистан",
    popular_rank: 1,
  },
  DXB: {
    city: "Дубай",
    airport_name: "Dubai International Airport",
    country: "ОАЭ",
    popular_rank: 2,
  },
  IST: {
    city: "Стамбул",
    airport_name: "Istanbul Airport",
    country: "Турция",
    popular_rank: 3,
  },
  SAW: {
    city: "Стамбул",
    airport_name: "Sabiha Gokcen International Airport",
    country: "Турция",
    popular_rank: 4,
  },
  SHJ: {
    city: "Шарджа",
    airport_name: "Sharjah International Airport",
    country: "ОАЭ",
    popular_rank: 5,
  },
  DOH: {
    city: "Доха",
    airport_name: "Hamad International Airport",
    country: "Катар",
    popular_rank: 6,
  },
  AUH: {
    city: "Абу-Даби",
    airport_name: "Zayed International Airport",
    country: "ОАЭ",
    popular_rank: 7,
  },
  GYD: {
    city: "Баку",
    airport_name: "Heydar Aliyev International Airport",
    country: "Азербайджан",
    popular_rank: 8,
  },
  TBS: {
    city: "Тбилиси",
    airport_name: "Tbilisi International Airport",
    country: "Грузия",
    popular_rank: 9,
  },
  ALA: {
    city: "Алматы",
    airport_name: "Almaty International Airport",
    country: "Казахстан",
    popular_rank: 10,
  },
};

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function buildTags(tags, isBest, isCheapest) {
  const nextTags = Array.isArray(tags)
    ? [...tags]
    : typeof tags === "string" && tags.trim().length > 0
      ? tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  if (isBest && !nextTags.includes("Best")) nextTags.push("Best");
  if (isCheapest && !nextTags.includes("Cheapest")) nextTags.push("Cheapest");

  return nextTags;
}

function normalizeFlight(row) {
  return {
    id: row.id,
    fromCity: row.from_city,
    fromCode: row.from_code,
    toCity: row.to_city,
    toCode: row.to_code,
    out: {
      dep: row.out_depart_time || row.depart_time,
      arr: row.out_arrive_time || row.arrive_time,
      airline: row.out_airline || row.airline,
      airlineCode: row.out_airline_code || row.airline_code || null,
      stops: row.out_stops || row.stops || "nonstop",
      stopCity: row.out_stop_city || null,
      duration: row.out_duration || row.duration,
      route: `${row.from_code}-${row.to_code}`,
    },
    back: {
      dep: row.back_depart_time || row.return_depart_time,
      arr: row.back_arrive_time || row.return_arrive_time,
      airline: row.back_airline || row.airline,
      airlineCode: row.back_airline_code || row.airline_code || null,
      stops: row.back_stops || row.stops || "nonstop",
      stopCity: row.back_stop_city || null,
      duration: row.back_duration || row.return_duration,
      route: `${row.to_code}-${row.from_code}`,
    },
    price: Number(row.price || 0),
    cabin: row.cabin_class || "Economy Cabin",
    tags: buildTags(row.tags, row.is_best, row.is_cheapest),
  };
}

function normalizeAirport(row) {
  return {
    code: row.code,
    city: row.city,
    name: row.airport_name,
    country: row.country,
    popularRank: row.popular_rank ?? 999,
  };
}

function normalizeRoute(row) {
  return {
    id: row.id,
    fromCode: row.from_code,
    fromCity: row.from_city,
    toCode: row.to_code,
    toCity: row.to_city,
    toCountry: row.to_country,
    routeLabel: row.route_label,
    teaser: row.teaser,
    samplePrice: Number(row.sample_price || 0),
    isFeatured: !!row.is_featured,
    sortOrder: row.sort_order ?? 999,
  };
}

function getAirportHint(code) {
  return AIRPORT_HINTS[String(code || "").toUpperCase()] || null;
}

function isMissingTableError(error) {
  return error?.code === "PGRST205";
}

async function getFlightsRows(columns = "*") {
  const { data, error } = await supabase
    .from("flights")
    .select(columns)
    .order("price", { ascending: true });

  if (error) {
    console.error("getFlightsRows:", error.message);
    return [];
  }

  return data || [];
}

function deriveAirportsFromFlights(rows) {
  const airportsMap = new Map();

  rows.forEach((row) => {
    [
      {
        code: row.from_code,
        city: row.from_city,
      },
      {
        code: row.to_code,
        city: row.to_city,
      },
    ].forEach((item) => {
      if (!item.code) return;

      const hint = getAirportHint(item.code);
      const code = String(item.code).toUpperCase();

      if (!airportsMap.has(code)) {
        airportsMap.set(code, {
          code,
          city: item.city || hint?.city || code,
          airport_name: hint?.airport_name || `${item.city || code} Airport`,
          country: hint?.country || "International",
          popular_rank: hint?.popular_rank ?? 999,
        });
      }
    });
  });

  return [...airportsMap.values()]
    .sort((left, right) => {
      if (left.popular_rank !== right.popular_rank) {
        return left.popular_rank - right.popular_rank;
      }
      return left.city.localeCompare(right.city, "ru");
    })
    .map(normalizeAirport);
}

function buildRouteTeaser(group) {
  if (group.hasNonstop && group.airlines.size > 1) {
    return "Прямые рейсы и варианты с разными авиакомпаниями";
  }
  if (group.hasNonstop) {
    return "Есть прямые варианты без пересадок";
  }
  if (group.airlines.size > 1) {
    return "Доступны варианты с пересадкой и разными перевозчиками";
  }
  return "Доступны варианты с пересадкой";
}

function deriveRoutesFromFlights(rows) {
  const routesMap = new Map();

  rows.forEach((row) => {
    if (!row.from_code || !row.to_code) return;

    const key = `${String(row.from_code).toUpperCase()}-${String(row.to_code).toUpperCase()}`;
    const existing = routesMap.get(key) || {
      id: key,
      from_code: row.from_code,
      from_city: row.from_city,
      to_code: row.to_code,
      to_city: row.to_city,
      to_country: getAirportHint(row.to_code)?.country || "International",
      route_label: `${row.from_city} → ${row.to_city}`,
      teaser: "",
      sample_price: Number(row.price || 0),
      is_featured: true,
      sort_order: 999,
      airlines: new Set(),
      hasNonstop: false,
    };

    existing.sample_price = Math.min(
      existing.sample_price,
      Number(row.price || 0),
    );
    if (row.airline) existing.airlines.add(row.airline);

    const outboundStops = String(
      row.out_stops || row.stops || "nonstop",
    ).toLowerCase();
    const returnStops = String(
      row.back_stops || row.stops || "nonstop",
    ).toLowerCase();
    if (
      outboundStops.includes("nonstop") ||
      outboundStops.includes("без перес")
    ) {
      existing.hasNonstop = true;
    }
    if (returnStops.includes("nonstop") || returnStops.includes("без перес")) {
      existing.hasNonstop = true;
    }

    routesMap.set(key, existing);
  });

  return [...routesMap.values()]
    .sort((left, right) => left.sample_price - right.sample_price)
    .map((route, index) =>
      normalizeRoute({
        ...route,
        teaser: buildRouteTeaser(route),
        sort_order: index + 1,
      }),
    );
}

function getFallbackFlights() {
  return [
    {
      id: 1,
      from_city: "Ташкент",
      from_code: "TAS",
      to_city: "Дубай",
      to_code: "DXB",
      out_airline: "Centrum Air",
      out_airline_code: "CA",
      out_depart_time: "7:50 am",
      out_arrive_time: "11:30 am",
      out_duration: "4h 40m",
      out_stops: "nonstop",
      back_airline: "Centrum Air",
      back_airline_code: "CA",
      back_depart_time: "1:00 pm",
      back_arrive_time: "6:50 pm",
      back_duration: "4h 50m",
      back_stops: "nonstop",
      price: 5374124,
      cabin_class: "Economy Cabin",
      tags: ["Best", "Cheapest"],
    },
    {
      id: 2,
      from_city: "Ташкент",
      from_code: "TAS",
      to_city: "Дубай",
      to_code: "DXB",
      out_airline: "Uzbekistan Airways",
      out_airline_code: "HY",
      out_depart_time: "8:25 am",
      out_arrive_time: "11:00 am",
      out_duration: "3h 35m",
      out_stops: "nonstop",
      back_airline: "Uzbekistan Airways",
      back_airline_code: "HY",
      back_depart_time: "12:30 pm",
      back_arrive_time: "4:40 pm",
      back_duration: "3h 10m",
      back_stops: "nonstop",
      price: 6615478,
      cabin_class: "Economy Cabin",
      tags: [],
    },
    {
      id: 3,
      from_city: "Ташкент",
      from_code: "TAS",
      to_city: "Стамбул",
      to_code: "IST",
      out_airline: "Uzbekistan Airways",
      out_airline_code: "HY",
      out_depart_time: "2:30 am",
      out_arrive_time: "5:00 am",
      out_duration: "5h 30m",
      out_stops: "nonstop",
      back_airline: "Uzbekistan Airways",
      back_airline_code: "HY",
      back_depart_time: "6:00 pm",
      back_arrive_time: "11:30 pm",
      back_duration: "5h 30m",
      back_stops: "nonstop",
      price: 7200000,
      cabin_class: "Economy Cabin",
      tags: [],
    },
    {
      id: 4,
      from_city: "Ташкент",
      from_code: "TAS",
      to_city: "Шарджа",
      to_code: "SHJ",
      out_airline: "Air Arabia",
      out_airline_code: "G9",
      out_depart_time: "10:00 pm",
      out_arrive_time: "11:45 pm",
      out_duration: "3h 45m",
      out_stops: "nonstop",
      back_airline: "Air Arabia",
      back_airline_code: "G9",
      back_depart_time: "10:00 am",
      back_arrive_time: "3:30 pm",
      back_duration: "4h 30m",
      back_stops: "nonstop",
      price: 5900000,
      cabin_class: "Economy Cabin",
      tags: [],
    },
    {
      id: 5,
      from_city: "Ташкент",
      from_code: "TAS",
      to_city: "Доха",
      to_code: "DOH",
      out_airline: "Qatar Airways",
      out_airline_code: "QR",
      out_depart_time: "8:25 am",
      out_arrive_time: "4:05 pm",
      out_duration: "9h 40m",
      out_stops: "1 stop",
      out_stop_city: "Baku",
      back_airline: "Qatar Airways",
      back_airline_code: "QR",
      back_depart_time: "5:35 pm",
      back_arrive_time: "7:20 am",
      back_duration: "11h 45m",
      back_stops: "1 stop",
      back_stop_city: "Dubai",
      price: 8267352,
      cabin_class: "Economy Cabin",
      tags: [],
    },
    {
      id: 6,
      from_city: "Ташкент",
      from_code: "TAS",
      to_city: "Абу-Даби",
      to_code: "AUH",
      out_airline: "Etihad Airways",
      out_airline_code: "EY",
      out_depart_time: "3:20 am",
      out_arrive_time: "9:20 am",
      out_duration: "7h 0m",
      out_stops: "1 stop",
      out_stop_city: "Doha",
      back_airline: "Etihad Airways",
      back_airline_code: "EY",
      back_depart_time: "2:10 pm",
      back_arrive_time: "1:40 am",
      back_duration: "8h 30m",
      back_stops: "1 stop",
      back_stop_city: "Muscat",
      price: 6480000,
      cabin_class: "Economy Cabin",
      tags: [],
    },
    {
      id: 7,
      from_city: "Ташкент",
      from_code: "TAS",
      to_city: "Стамбул",
      to_code: "SAW",
      out_airline: "Pegasus Airlines",
      out_airline_code: "PC",
      out_depart_time: "5:40 am",
      out_arrive_time: "11:10 am",
      out_duration: "7h 30m",
      out_stops: "1 stop",
      out_stop_city: "Bishkek",
      back_airline: "Pegasus Airlines",
      back_airline_code: "PC",
      back_depart_time: "12:15 pm",
      back_arrive_time: "12:35 am",
      back_duration: "8h 20m",
      back_stops: "1 stop",
      back_stop_city: "Almaty",
      price: 6120000,
      cabin_class: "Economy Cabin",
      tags: [],
    },
    {
      id: 8,
      from_city: "Ташкент",
      from_code: "TAS",
      to_city: "Баку",
      to_code: "GYD",
      out_airline: "Azerbaijan Airlines",
      out_airline_code: "J2",
      out_depart_time: "2:40 pm",
      out_arrive_time: "7:15 pm",
      out_duration: "5h 35m",
      out_stops: "1 stop",
      out_stop_city: "Aktau",
      back_airline: "Azerbaijan Airlines",
      back_airline_code: "J2",
      back_depart_time: "8:40 pm",
      back_arrive_time: "4:20 am",
      back_duration: "6h 40m",
      back_stops: "1 stop",
      back_stop_city: "Aktau",
      price: 5840000,
      cabin_class: "Economy Cabin",
      tags: ["Cheapest"],
    },
    {
      id: 9,
      from_city: "Ташкент",
      from_code: "TAS",
      to_city: "Тбилиси",
      to_code: "TBS",
      out_airline: "Turkish Airlines",
      out_airline_code: "TK",
      out_depart_time: "6:10 am",
      out_arrive_time: "1:25 pm",
      out_duration: "8h 15m",
      out_stops: "1 stop",
      out_stop_city: "Istanbul",
      back_airline: "Turkish Airlines",
      back_airline_code: "TK",
      back_depart_time: "2:50 pm",
      back_arrive_time: "2:10 am",
      back_duration: "8h 20m",
      back_stops: "1 stop",
      back_stop_city: "Istanbul",
      price: 6390000,
      cabin_class: "Economy Cabin",
      tags: [],
    },
    {
      id: 10,
      from_city: "Ташкент",
      from_code: "TAS",
      to_city: "Алматы",
      to_code: "ALA",
      out_airline: "Air Astana",
      out_airline_code: "KC",
      out_depart_time: "9:10 am",
      out_arrive_time: "11:35 am",
      out_duration: "2h 25m",
      out_stops: "nonstop",
      back_airline: "Air Astana",
      back_airline_code: "KC",
      back_depart_time: "7:20 pm",
      back_arrive_time: "9:50 pm",
      back_duration: "2h 30m",
      back_stops: "nonstop",
      price: 4510000,
      cabin_class: "Economy Cabin",
      tags: ["Best"],
    },
  ].map(normalizeFlight);
}

function getFallbackAirports() {
  return Object.entries(AIRPORT_HINTS).map(([code, value]) =>
    normalizeAirport({ code, ...value }),
  );
}

function getFallbackRoutes() {
  return [
    {
      id: 1,
      from_code: "TAS",
      from_city: "Ташкент",
      to_code: "DXB",
      to_city: "Дубай",
      to_country: "ОАЭ",
      route_label: "Ташкент → Дубай",
      teaser: "Прямые рейсы и варианты с разными авиакомпаниями",
      sample_price: 5374124,
      is_featured: true,
      sort_order: 1,
    },
    {
      id: 2,
      from_code: "TAS",
      from_city: "Ташкент",
      to_code: "IST",
      to_city: "Стамбул",
      to_country: "Турция",
      route_label: "Ташкент → Стамбул",
      teaser: "Популярные прямые и стыковочные варианты",
      sample_price: 7200000,
      is_featured: true,
      sort_order: 2,
    },
    {
      id: 3,
      from_code: "TAS",
      from_city: "Ташкент",
      to_code: "SHJ",
      to_city: "Шарджа",
      to_country: "ОАЭ",
      route_label: "Ташкент → Шарджа",
      teaser: "Бюджетные прямые рейсы",
      sample_price: 5900000,
      is_featured: true,
      sort_order: 3,
    },
    {
      id: 4,
      from_code: "TAS",
      from_city: "Ташкент",
      to_code: "DOH",
      to_city: "Доха",
      to_country: "Катар",
      route_label: "Ташкент → Доха",
      teaser: "Удобные варианты с одной пересадкой",
      sample_price: 8267352,
      is_featured: true,
      sort_order: 4,
    },
    {
      id: 5,
      from_code: "TAS",
      from_city: "Ташкент",
      to_code: "AUH",
      to_city: "Абу-Даби",
      to_country: "ОАЭ",
      route_label: "Ташкент → Абу-Даби",
      teaser: "Гибкие тарифы на Ближний Восток",
      sample_price: 6480000,
      is_featured: true,
      sort_order: 5,
    },
    {
      id: 6,
      from_code: "TAS",
      from_city: "Ташкент",
      to_code: "GYD",
      to_city: "Баку",
      to_country: "Азербайджан",
      route_label: "Ташкент → Баку",
      teaser: "Удобные городские короткие маршруты",
      sample_price: 5840000,
      is_featured: true,
      sort_order: 6,
    },
    {
      id: 7,
      from_code: "TAS",
      from_city: "Ташкент",
      to_code: "TBS",
      to_city: "Тбилиси",
      to_country: "Грузия",
      route_label: "Ташкент → Тбилиси",
      teaser: "Варианты для city break и отпуска",
      sample_price: 6390000,
      is_featured: true,
      sort_order: 7,
    },
    {
      id: 8,
      from_code: "TAS",
      from_city: "Ташкент",
      to_code: "ALA",
      to_city: "Алматы",
      to_country: "Казахстан",
      route_label: "Ташкент → Алматы",
      teaser: "Быстрые прямые рейсы по лучшей цене",
      sample_price: 4510000,
      is_featured: true,
      sort_order: 8,
    },
  ].map(normalizeRoute);
}

export async function getFlights({ fromCode, toCode, from, to } = {}) {
  let query = supabase.from("flights").select("*").order("price", {
    ascending: true,
  });

  if (fromCode) {
    query = query.eq("from_code", String(fromCode).toUpperCase());
  } else if (from) {
    const search = normalizeText(from);
    query = query.or(`from_city.ilike.%${search}%,from_code.ilike.%${search}%`);
  }

  if (toCode) {
    query = query.eq("to_code", String(toCode).toUpperCase());
  } else if (to) {
    const search = normalizeText(to);
    query = query.or(`to_city.ilike.%${search}%,to_code.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) console.error("getFlights:", error.message);
  if (!data?.length) return getFallbackFlights();

  return data.map(normalizeFlight);
}

export async function getFlightAirports({ search = "" } = {}) {
  let query = supabase
    .from("flight_airports")
    .select("*")
    .order("popular_rank", { ascending: true })
    .order("city", { ascending: true });

  const normalizedSearch = normalizeText(search);
  if (normalizedSearch) {
    query = query.or(
      `city.ilike.%${normalizedSearch}%,code.ilike.%${normalizedSearch}%,airport_name.ilike.%${normalizedSearch}%`,
    );
  }

  const { data, error } = await query.limit(20);

  if (error) console.error("getFlightAirports:", error.message);
  if (error && !isMissingTableError(error)) return getFallbackAirports();
  if (!error && data?.length) return data.map(normalizeAirport);

  const flightsRows = await getFlightsRows(
    "from_city,from_code,to_city,to_code,price,airline,stops,out_stops,back_stops",
  );
  const derivedAirports = deriveAirportsFromFlights(flightsRows);

  if (derivedAirports.length) {
    if (!normalizedSearch) return derivedAirports.slice(0, 20);

    return derivedAirports
      .filter((airport) => {
        const haystack = `${airport.city} ${airport.code} ${airport.name} ${airport.country}`;
        return normalizeText(haystack).includes(normalizedSearch);
      })
      .slice(0, 20);
  }

  return getFallbackAirports();
}

export async function getFlightRoutes({ fromCode } = {}) {
  let query = supabase
    .from("flight_routes")
    .select("*")
    .eq("is_featured", true)
    .order("sort_order", { ascending: true })
    .order("sample_price", { ascending: true });

  if (fromCode) {
    query = query.eq("from_code", String(fromCode).toUpperCase());
  }

  const { data, error } = await query;

  if (error) console.error("getFlightRoutes:", error.message);
  if (error && !isMissingTableError(error)) return getFallbackRoutes();
  if (!error && data?.length) return data.map(normalizeRoute);

  const flightsRows = await getFlightsRows(
    "from_city,from_code,to_city,to_code,price,airline,stops,out_stops,back_stops",
  );
  const derivedRoutes = deriveRoutesFromFlights(flightsRows);

  if (derivedRoutes.length) {
    const normalizedFromCode = String(fromCode || "").toUpperCase();
    return derivedRoutes.filter((route) =>
      normalizedFromCode ? route.fromCode === normalizedFromCode : true,
    );
  }

  return getFallbackRoutes().filter((route) =>
    fromCode ? route.fromCode === String(fromCode).toUpperCase() : true,
  );
}
