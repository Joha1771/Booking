import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

export interface RouteSuggestion {
  toCity: string;
  toCode: string;
}

async function fetchAirports(): Promise<Airport[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("airports")
    .select("code, city, name, country")
    .order("city", { ascending: true })
    .limit(200);

  if (!data?.length) {
    // Fallback static list so the UI is never empty
    return [
      {
        code: "TAS",
        city: "Ташкент",
        name: "Международный аэропорт Ислама Каримова",
        country: "Узбекистан",
      },
      {
        code: "SKD",
        city: "Самарканд",
        name: "Аэропорт Самарканд",
        country: "Узбекистан",
      },
      {
        code: "BHK",
        city: "Бухара",
        name: "Аэропорт Бухара",
        country: "Узбекистан",
      },
      {
        code: "NMA",
        city: "Наманган",
        name: "Аэропорт Наманган",
        country: "Узбекистан",
      },
      {
        code: "AZN",
        city: "Андижан",
        name: "Аэропорт Андижан",
        country: "Узбекистан",
      },
      {
        code: "FEG",
        city: "Фергана",
        name: "Аэропорт Фергана",
        country: "Узбекистан",
      },
      {
        code: "NCU",
        city: "Нукус",
        name: "Аэропорт Нукус",
        country: "Узбекистан",
      },
      {
        code: "DXB",
        city: "Дубай",
        name: "Международный аэропорт Дубай",
        country: "ОАЭ",
      },
      {
        code: "IST",
        city: "Стамбул",
        name: "Аэропорт Стамбул",
        country: "Турция",
      },
      {
        code: "MOW",
        city: "Москва",
        name: "Аэропорт Домодедово",
        country: "Россия",
      },
      {
        code: "ALA",
        city: "Алматы",
        name: "Международный аэропорт Алматы",
        country: "Казахстан",
      },
      {
        code: "FRA",
        city: "Франкфурт",
        name: "Аэропорт Франкфурт-на-Майне",
        country: "Германия",
      },
      {
        code: "LHR",
        city: "Лондон",
        name: "Аэропорт Хитроу",
        country: "Великобритания",
      },
      {
        code: "CDG",
        city: "Париж",
        name: "Аэропорт Шарль-де-Голль",
        country: "Франция",
      },
      {
        code: "PEK",
        city: "Пекин",
        name: "Международный аэропорт Пекин Столичный",
        country: "Китай",
      },
    ];
  }

  return data as Airport[];
}

async function fetchRoutes(fromCode: string): Promise<RouteSuggestion[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from("flight_routes")
    .select("to_city, to_code")
    .eq("from_code", fromCode)
    .limit(10);

  if (!data?.length) {
    // Fallback suggestions from TAS
    const fallback: Record<string, RouteSuggestion[]> = {
      TAS: [
        { toCity: "Дубай", toCode: "DXB" },
        { toCity: "Стамбул", toCode: "IST" },
        { toCity: "Москва", toCode: "MOW" },
      ],
    };
    return fallback[fromCode] ?? [{ toCity: "Дубай", toCode: "DXB" }];
  }

  return data.map((row: any) => ({ toCity: row.to_city, toCode: row.to_code }));
}

export function useFlightAirports(_query: string) {
  return useQuery({
    queryKey: ["flight-airports"],
    queryFn: fetchAirports,
    staleTime: 1000 * 60 * 10, // 10 min
  });
}

export function useFlightRoutes({ fromCode }: { fromCode: string }) {
  return useQuery({
    queryKey: ["flight-routes", fromCode],
    queryFn: () => fetchRoutes(fromCode),
    enabled: !!fromCode,
    staleTime: 1000 * 60 * 10,
  });
}

export function useFlights(_params?: unknown) {
  return useQuery({
    queryKey: ["flights"],
    queryFn: async () => [] as any[],
    staleTime: Infinity,
  });
}
