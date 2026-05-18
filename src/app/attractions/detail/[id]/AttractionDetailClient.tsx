"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Share2, Clock3, CheckCircle, XCircle, Star, MapPin } from "lucide-react";
import type { Attraction } from "@/types";

interface Props { attraction: Attraction; }

function fmt(p: number) { return p > 0 ? `UZS ${Math.round(p).toLocaleString("ru-RU")}` : "Бесплатно"; }
function ratingLabel(r: number) {
  if (r >= 4.7) return "Потрясающе";
  if (r >= 4.5) return "Превосходно";
  if (r >= 4.0) return "Очень хорошо";
  return "Хорошо";
}

const DAY_NAMES = ["вс","пн","вт","ср","чт","пт","сб"];
const MONTH_NAMES = ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек"];

export default function AttractionDetailClient({ attraction: a }: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [guests, setGuests] = useState(1);
  const [selectedDate, setSelectedDate] = useState("");

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i); return d;
  });

  const photos = [a.image_url, ...Array.from({ length: 4 }, (_, i) =>
    `https://picsum.photos/seed/attr${a.id}_${i}/800/500`)];

  return (
    <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px 48px" }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: 13, color: "#0071c2", padding: "12px 0" }}>
        <span style={{ cursor: "pointer" }} onClick={() => router.push("/")}>Главная</span>
        {" › "}
        <span style={{ cursor: "pointer" }} onClick={() => router.push("/attractions")}>Варианты досуга</span>
        {" › "}
        <span style={{ color: "#333" }}>{a.name}</span>
      </div>

      {/* Title */}
      {a.badge && <div style={{ display: "inline-block", background: "#fff4d5", color: "#8a5a00", fontSize: 12, fontWeight: 800, padding: "3px 10px", borderRadius: 999, marginBottom: 8 }}>{a.badge}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{a.name}</h1>
          {a.city && <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 14, color: "#595959" }}><MapPin size={14} />{a.city}, {a.country}</div>}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setLiked(!liked)} style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #e0e0e0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Heart size={18} fill={liked ? "#e00" : "none"} color={liked ? "#e00" : "#555"} />
          </button>
          <button style={{ width: 40, height: 40, borderRadius: "50%", border: "1px solid #e0e0e0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Share2 size={18} color="#555" />
          </button>
        </div>
      </div>

      {/* Rating */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Star size={18} fill="#febb02" color="#febb02" />
        <span style={{ fontSize: 16, fontWeight: 700 }}>{a.rating.toFixed(1)}</span>
        <span style={{ fontSize: 14, color: "#595959" }}>· {ratingLabel(a.rating)} ({a.reviews_count.toLocaleString("ru-RU")} отзывов)</span>
      </div>

      {/* Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24 }}>
        <div>
          {/* Photos */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "300px 150px", gap: 6, borderRadius: 12, overflow: "hidden", marginBottom: 24 }}>
            {photos.slice(0, 5).map((src, i) => (
              <div key={i} style={{ gridRow: i === 0 ? "1 / 3" : "auto", overflow: "hidden" }}>
                <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/a${a.id}_${i}/400/300`; }} />
              </div>
            ))}
          </div>

          {/* Key info */}
          <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
            {a.free_cancel && <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#008234", fontSize: 13, fontWeight: 600 }}><CheckCircle size={16} />Доступна бесплатная отмена</div>}
            {a.duration_hours > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#595959", fontSize: 13 }}><Clock3 size={16} />Продолжительность: {a.duration_hours} ч.</div>}
          </div>

          {/* Description */}
          {a.description && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>Описание</h2>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "#333" }}>{a.description}</p>
            </section>
          )}

          {/* Includes / Excludes */}
          {(a.includes.length > 0 || a.excludes.length > 0) && (
            <section style={{ marginBottom: 28 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>Что входит в бронирование</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                {a.includes.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#008234" }}>Включено</div>
                    {a.includes.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}>
                        <CheckCircle size={16} color="#008234" style={{ flexShrink: 0, marginTop: 1 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                )}
                {a.excludes.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: "#cc0000" }}>Не включено</div>
                    {a.excludes.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}>
                        <XCircle size={16} color="#cc0000" style={{ flexShrink: 0, marginTop: 1 }} />
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Booking panel */}
        <div style={{ position: "sticky", top: 16 }}>
          <div style={{ border: "1px solid #e7e7e7", borderRadius: 12, padding: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 13, color: "#595959", marginBottom: 4 }}>Билеты и цены</div>
            <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 4 }}>{fmt(a.price)}</div>
            <div style={{ fontSize: 12, color: "#888", marginBottom: 20 }}>Включая налоги и сборы</div>

            {/* Dates */}
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>Выберите дату</div>
            <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
              {dates.map((d, i) => {
                const iso = d.toISOString().slice(0, 10);
                const sel = selectedDate === iso;
                return (
                  <button key={i} onClick={() => setSelectedDate(iso)}
                    style={{ minWidth: 52, padding: "8px 6px", borderRadius: 8, border: sel ? "2px solid #0071c2" : "1px solid #e0e0e0", background: sel ? "#e8f0fe" : "#fff", cursor: "pointer", textAlign: "center", flexShrink: 0 }}>
                    <div style={{ fontSize: 11, color: sel ? "#0071c2" : "#888" }}>{DAY_NAMES[d.getDay()]}</div>
                    <div style={{ fontSize: 17, fontWeight: 700, color: sel ? "#0071c2" : "#333" }}>{d.getDate()}</div>
                    <div style={{ fontSize: 10, color: "#888" }}>{MONTH_NAMES[d.getMonth()]}</div>
                    {i === 0 && <div style={{ fontSize: 10, color: "#0071c2", fontWeight: 700 }}>Сегодня</div>}
                  </button>
                );
              })}
            </div>

            {/* Guests */}
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Участники</div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button onClick={() => setGuests(Math.max(1, guests - 1))} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #0071c2", background: "#fff", color: "#0071c2", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
              <span style={{ fontSize: 18, fontWeight: 700 }}>{guests}</span>
              <button onClick={() => setGuests(Math.min(20, guests + 1))} style={{ width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #0071c2", background: "#fff", color: "#0071c2", fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>

            {guests > 1 && (
              <div style={{ background: "#f5f5f5", borderRadius: 8, padding: "10px 12px", marginBottom: 16, display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                <span>{guests} × {fmt(a.price)}</span>
                <span style={{ fontWeight: 700 }}>{fmt(a.price * guests)}</span>
              </div>
            )}

            {a.free_cancel && <div style={{ color: "#008234", fontSize: 13, marginBottom: 16 }}>✓ Доступна бесплатная отмена</div>}

            <button style={{ width: "100%", padding: 14, background: "#0071c2", color: "#fff", border: "none", borderRadius: 8, fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
              Забронировать
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
