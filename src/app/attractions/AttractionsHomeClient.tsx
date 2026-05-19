"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { AttractionCity, Attraction, Destination } from "@/types";

interface Props {
  cities: AttractionCity[];
  initialAttractions: Attraction[];
  destinations: Destination[];
}

function fmt(p: number) { return p > 0 ? "UZS " + Math.round(p).toLocaleString("ru-RU") : "Бесплатно"; }

export default function AttractionsHomeClient({ cities, initialAttractions, destinations }: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeRegion, setActiveRegion] = useState("Все");

  const regions = useMemo(() => ["Все", ...new Set(cities.map((c) => c.region))], [cities]);

  const filteredCities = useMemo(() => {
    const byRegion = activeRegion === "Все" ? cities : cities.filter((c) => c.region === activeRegion);
    if (!query) return byRegion;
    return byRegion.filter((c) => `${c.name} ${c.country}`.toLowerCase().includes(query.toLowerCase()));
  }, [cities, activeRegion, query]);

  return (
    <>
      {/* Hero */}
      <div style={{ background: "#003580", padding: "40px 0 48px" }}>
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          <h1 style={{ color: "#fff", fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, marginBottom: 10 }}>
            Экскурсии и развлечения
          </h1>
          <p style={{ color: "rgba(255,255,255,0.88)", fontSize: 16, marginBottom: 28 }}>
            Найдите новые варианты досуга по вкусу и интересам.
          </p>
          <div style={{ background: "#febb02", borderRadius: 4, padding: 4, display: "flex", gap: 4, maxWidth: 700 }}>
            <div style={{ flex: 1, background: "#fff", borderRadius: 2, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
              <Search size={18} color="#555" />
              <input value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder="Например: Париж, Лондон, Стамбул"
                style={{ border: "none", outline: "none", fontSize: 15, fontWeight: 600, width: "100%", background: "transparent" }} />
            </div>
            <button style={{ background: "#0071c2", color: "#fff", border: "none", borderRadius: 2, padding: "0 24px", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              Поиск
            </button>
          </div>
        </div>
      </div>

      {/* Nearby attractions */}
      <div style={{ maxWidth: 1150, margin: "32px auto 0", padding: "0 16px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Рекомендации</h2>
        <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
          {initialAttractions.map((a) => (
            <div key={a.id} onClick={() => router.push(`/attractions/detail/${a.id}`)}
              style={{ minWidth: 220, flexShrink: 0, borderRadius: 8, overflow: "hidden", border: "1px solid #e7e7e7", cursor: "pointer", background: "#fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              <img src={a.image_url} alt={a.name} style={{ width: "100%", height: 160, objectFit: "cover", display: "block" }}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/a${a.id}/400/260`; }} />
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>{a.name}</div>
                <div style={{ fontSize: 12, color: "#595959", marginBottom: 8 }}>{a.city}</div>
                {a.rating > 0 && <div style={{ fontSize: 13, fontWeight: 700, color: "#febb02" }}>★ {a.rating.toFixed(1)}</div>}
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0071c2", marginTop: 4 }}>С {fmt(a.price)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* City grid */}
      <div style={{ maxWidth: 1150, margin: "40px auto 0", padding: "0 16px 48px" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Посмотрите другие направления</h2>

        {/* Region tabs */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20, overflowX: "auto" }}>
          {regions.map((region) => (
            <button key={region} onClick={() => setActiveRegion(region)}
              style={{ border: region === activeRegion ? "2px solid #003580" : "1px solid #d1d5db", background: region === activeRegion ? "#003580" : "#fff", color: region === activeRegion ? "#fff" : "#333", borderRadius: 999, padding: "8px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
              {region}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          {filteredCities.map((city) => (
            <button key={city.id} onClick={() => router.push(`/attractions/${city.slug}`)}
              style={{ position: "relative", height: 160, border: "none", borderRadius: 8, overflow: "hidden", padding: 0, cursor: "pointer", background: "#ccc" }}>
              <img src={city.image_url} alt={city.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${city.slug}/400/250`; }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(transparent 35%, rgba(0,0,0,0.72))" }} />
              <div style={{ position: "absolute", bottom: 10, left: 12, right: 12, textAlign: "left" }}>
                <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{city.name}</div>
                <div style={{ color: "rgba(255,255,255,0.82)", fontSize: 12, marginTop: 3 }}>
                  {city.variants.toLocaleString("ru-RU")} вариантов
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
