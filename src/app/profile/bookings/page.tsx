"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Calendar, ChevronLeft } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import useAuthStore from "@/store/authStore";
import { getUserBookings, cancelBooking } from "@/lib/api/bookings";
import type { DbBooking } from "@/types";

const TABS = ["Все", "Предстоящие", "Завершённые", "Отменённые"];
const TAB_STATUS: Record<string, string> = { "Предстоящие": "confirmed", "Завершённые": "completed", "Отменённые": "cancelled" };
function fmt(n: number) { return Math.round(n).toLocaleString("ru-RU"); }
function statusLabel(s: string | null) {
  if (s === "confirmed") return { text: "Предстоящее", color: "#008234" };
  if (s === "completed") return { text: "Завершено", color: "#595959" };
  return { text: "Отменено", color: "#c00" };
}

export default function BookingsPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("Все");

  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings", user?.id],
    queryFn: () => getUserBookings(user!.id),
    enabled: !!user?.id,
  });

  const cancelMutation = useMutation({
    mutationFn: ({ id }: { id: number }) => cancelBooking(id, user!.id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });

  const filtered = activeTab === "Все" ? bookings : bookings.filter((b: DbBooking) => b.status === TAB_STATUS[activeTab]);

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Header />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px 48px" }}>
        <button onClick={() => router.push("/profile")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#0071c2", fontSize: 14, marginBottom: 20, padding: 0 }}>
          <ChevronLeft size={16} /> Назад к профилю
        </button>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Бронирования и поездки</h1>

        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: "8px 20px", borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: "pointer", border: activeTab === tab ? "2px solid #0071c2" : "1px solid #d0d5dd", background: activeTab === tab ? "#e8f0fe" : "#fff", color: activeTab === tab ? "#0071c2" : "#333" }}>{tab}</button>
          ))}
        </div>

        {isLoading ? <div style={{ textAlign: "center", padding: "60px 0" }}>Загрузка...</div>
          : filtered.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 8, padding: "60px 32px", textAlign: "center", border: "1px solid #e7e7e7" }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🌍</div>
              <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Куда дальше?</h2>
              <p style={{ color: "#595959", marginBottom: 24 }}>У вас пока нет поездок.</p>
              <button onClick={() => router.push("/search")} style={{ padding: "12px 28px", background: "#0071c2", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700 }}>Найти жильё</button>
            </div>
          ) : filtered.map((booking: DbBooking) => {
            const hotel = booking.hotels;
            const st = statusLabel(booking.status);
            const nights = booking.check_out && booking.check_in
              ? Math.round((new Date(booking.check_out).getTime() - new Date(booking.check_in).getTime()) / 86400000) : 1;
            return (
              <div key={booking.id} style={{ background: "#fff", borderRadius: 8, marginBottom: 16, overflow: "hidden", border: "1px solid #e7e7e7", display: "flex" }}>
                <img src={hotel?.image_url || `https://picsum.photos/seed/bk${booking.hotel_id}/200/160`} alt="" style={{ width: 160, minHeight: 160, objectFit: "cover", flexShrink: 0 }} onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/h${booking.hotel_id}/200/160`; }} />
                <div style={{ flex: 1, padding: "20px 24px" }}>
                  {hotel?.city && <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 13, color: "#595959", marginBottom: 4 }}><MapPin size={13} />{hotel.city}{hotel.country ? `, ${hotel.country}` : ""}</div>}
                  <div onClick={() => router.push(`/hotel/${booking.hotel_id}`)} style={{ fontSize: 18, fontWeight: 700, color: "#0071c2", cursor: "pointer", marginBottom: 8 }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
                  >{hotel?.name || "Бронирование"}</div>
                  {booking.check_in && <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#595959", marginBottom: 4 }}><Calendar size={13} />
                    {new Date(booking.check_in).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })} — {new Date(booking.check_out!).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })} · {nights} {nights === 1 ? "ночь" : nights < 5 ? "ночи" : "ночей"}
                  </div>}
                  <div style={{ fontSize: 12, color: "#888" }}>#{booking.booking_ref}</div>
                </div>
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between", minWidth: 180 }}>
                  <div style={{ color: st.color, fontWeight: 700, fontSize: 14 }}>{st.text}</div>
                  {booking.total_price && <div style={{ fontSize: 20, fontWeight: 800 }}>UZS {fmt(booking.total_price)}</div>}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {booking.status === "confirmed" && <button onClick={() => { if (confirm("Отменить?")) cancelMutation.mutate({ id: booking.id }); }} style={{ padding: "8px 16px", border: "1px solid #c00", color: "#c00", background: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Отменить</button>}
                    {booking.status === "completed" && <button style={{ padding: "8px 16px", border: "1px solid #0071c2", color: "#0071c2", background: "#fff", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Оставить отзыв</button>}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      <Footer />
    </div>
  );
}
