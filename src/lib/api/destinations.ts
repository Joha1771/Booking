import { createClient } from "@/lib/supabase/server";
import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { Destination, DbDestination } from "@/types";

export async function getTrendingDestinations(): Promise<Destination[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("destinations").select("*")
    .eq("is_trending", true).order("variants", { ascending: false });
  return ((data ?? []) as DbDestination[]).map((d) => ({
    ...d,
    variants: d.variants ?? 0,
    avg_price: d.avg_price ?? 0,
    flag: d.flag ?? "",
    dest_type: d.dest_type ?? "city",
    is_trending: d.is_trending ?? false,
    region: d.region ?? "",
    image_url: d.image_url || `https://picsum.photos/seed/${d.name}/400/250`,
  })) as Destination[];
}

export async function searchDestinationsClient(q: string): Promise<Destination[]> {
  const supabase = createBrowserClient();
  const { data } = await supabase.from("destinations").select("*")
    .or(`name.ilike.%${q}%,country.ilike.%${q}%`)
    .order("variants", { ascending: false }).limit(8);
  return ((data ?? []) as DbDestination[]) as Destination[];
}
