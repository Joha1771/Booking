import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { DbBooking } from "@/types";

export async function getUserBookings(userId: string): Promise<DbBooking[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*, hotels(id, name, image_url, city, country, stars, rating)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DbBooking[];
}

export async function cancelBooking(bookingId: number, userId: string): Promise<void> {
  const supabase = createBrowserClient();
  const { error } = await supabase
    .from("bookings").update({ status: "cancelled" })
    .eq("id", bookingId).eq("user_id", userId);
  if (error) throw error;
}

export async function createBooking(bookingData: Partial<DbBooking>): Promise<DbBooking> {
  const supabase = createBrowserClient();
  const ref = "BK-" + Math.random().toString(36).substr(2, 8).toUpperCase();
  const { data, error } = await supabase
    .from("bookings").insert([{ ...bookingData, booking_ref: ref }])
    .select().single();
  if (error) throw error;
  return data as DbBooking;
}
