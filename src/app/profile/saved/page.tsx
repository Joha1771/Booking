"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, ChevronLeft, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import useAuthStore from "@/store/authStore";
import { createClient } from "@/lib/supabase/client";

async function getSaved(userId: string) {
  const sb = createClient();
  const { data } = await sb.from("saved_items")
    .select("*, hotels(id,name,city,country,image_url,rating,price_per_night)")
    .eq("user_id", userId).order("created_at", { ascending: false });
  return data || [];
}

export default function SavedPage() {
  const router = useRouter();
  const { user, loading } = useAuthStore();
  const qc = useQueryClient();

  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);

  const { data: saved = [] } = useQuery({
    queryKey: ["saved", user?.id],
    queryFn: () => getSaved(user!.id),
    enabled: !!user?.id,
  });

  const removeMutation = useMutation({
    mutationFn: async (id: number) => {
      const sb = createClient();
      await sb.from("saved_items").delete().eq("id", id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["saved"] }),
  });

  if (!user) return null;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Header />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px 48px" }}>
        <button onClick={() => router.push("/profile")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#0071c2", fontSize: 14, marginBottom: 20, padding: 0 }}>
          <ChevronLeft size={16} /> Назад к профилю
        </button>
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <div style={{ padding: "8px 16px", border: "2px solid #0071c2", borderRadius: 4, fontSize: 14, fontWeight: 600, color: "#0071c2" }}>Моя следующая поездка ▾</div>
          <button style={{ padding: "8px 16px", border: "1px solid #d0d5dd", borderRadius: 4, fontSize: 14, background: "#fff", cursor: "pointer" }}>Поделиться</button>
          <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", border: "1px solid #d0d5dd", borderRadius: 4, fontSize: 14, background: "#fff", cursor: "pointer" }}>
            <Plus size={14} /> Создать список
          </button>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Моя следующая поездка</h1>

        {saved.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 8, padding: "48px 32px", textAlign: "center", border: "1px solid #e7e7e7" }}>
            <Heart size={48} color="#e0e0e0" style={{ marginBottom: 16 }} />
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Список пуст</h2>
            <p style={{ color: "#595959", marginBottom: 24 }}>Сохраняйте понравившиеся отели, нажимая ❤️</p>
            <button onClick={() => router.push("/search")} style={{ padding: "12px 28px", background: "#0071c2", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700 }}>Найти жильё</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
            {(saved as any[]).map((item) => {
              const h = item.hotels;
              if (!h) return null;
              return (
                <div key={item.id} style={{ background: "#fff", borderRadius: 8, overflow: "hidden", border: "1px solid #e7e7e7" }}>
                  <div style={{ position: "relative" }}>
                    <img src={h.image_url || `https://picsum.photos/seed/h${h.id}/400/250`} alt={h.name} style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
                    <button onClick={() => removeMutation.mutate(item.id)} style={{ position: "absolute", top: 8, right: 8, width: 34, height: 34, borderRadius: "50%", background: "#fff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Heart size={16} fill="#e00" color="#e00" />
                    </button>
                  </div>
                  <div style={{ padding: 14 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{h.name}</div>
                    <div style={{ fontSize: 12, color: "#595959", marginBottom: 8 }}>{h.city}, {h.country}</div>
                    {h.rating && <div style={{ display: "inline-block", background: "#003580", color: "#fff", fontSize: 12, fontWeight: 700, padding: "2px 6px", borderRadius: 4, marginBottom: 8 }}>{Number(h.rating).toFixed(1)}</div>}
                    {h.price_per_night > 0 && <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>UZS {Math.round(h.price_per_night).toLocaleString("ru-RU")}</div>}
                    <button onClick={() => router.push(`/hotel/${h.id}`)} style={{ width: "100%", padding: 8, background: "#0071c2", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 13, fontWeight: 700 }}>Посмотреть</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
