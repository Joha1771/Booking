"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Calendar, Search } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GeniusSection from "@/components/sections/GeniusSection";
import {
  searchAttractionsClient,
  getAttractionCities,
  getAttractionDiscoveryCards,
  getAttractionById,
} from "@/lib/api/attractions.client";

function buildAttractionsLink(slug: string, category?: string) {
  if (!category) return `/attractions/${slug}`;
  return `/attractions/${slug}?category=${encodeURIComponent(category)}`;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[аа]/g, "a")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-");
}

export default function AttractionsHomePage() {
  const router = useRouter();
  const navigate = (p: string) => router.push(p);
  const [searchQuery, setSearchQuery] = useState("");
  const [date, setDate] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeRegion, setActiveRegion] = useState("Все");

  const { data: cities = [], isLoading: citiesLoading } = useQuery({
    queryKey: ["attraction-cities"],
    queryFn: getAttractionCities,
  });
  const { data: discoveryCards = [] } = useQuery({
    queryKey: ["discovery-cards"],
    queryFn: getAttractionDiscoveryCards,
  });

  // Build region tabs from actual data
  const regionTabs = useMemo(() => {
    const regions = [
      "Все",
      ...new Set(cities.map((c) => c.region).filter(Boolean)),
    ];
    return regions;
  }, [cities]);

  const filteredCities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const byRegion =
      activeRegion === "Все"
        ? cities
        : cities.filter((c) => c.region === activeRegion);
    if (!q) return byRegion;
    return byRegion.filter((c) =>
      `${c.name} ${c.country}`.toLowerCase().includes(q),
    );
  }, [activeRegion, cities, searchQuery]);

  const suggestedCities = useMemo(
    () => filteredCities.slice(0, 8),
    [filteredCities],
  );

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (!q) return;
    const match =
      cities.find((c) => c.name.toLowerCase() === q.toLowerCase()) ||
      cities.find((c) => c.name.toLowerCase().includes(q.toLowerCase()));
    if (match) {
      navigate(buildAttractionsLink(match.slug));
    } else {
      navigate(`/attractions/all?query=${encodeURIComponent(q)}`);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fff",
        fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      }}
    >
      <Header />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section style={{ background: "#003580", padding: "40px 0 48px" }}>
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(28px, 4vw, 44px)",
              fontWeight: 900,
              margin: "0 0 10px",
            }}
          >
            Экскурсии и развлечения
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.88)",
              fontSize: 16,
              margin: "0 0 28px",
              maxWidth: 600,
            }}
          >
            Найдите новые варианты досуга по вкусу и интересам.
          </p>

          {/* Searchbar */}
          <div
            className="attr-hero-searchbar"
            style={{
              background: "#febb02",
              borderRadius: 4,
              padding: 4,
            }}
          >
            {/* Destination */}
            <div style={{ position: "relative", flex: 2 }}>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 2,
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  minHeight: 52,
                }}
              >
                <Search size={18} color="#555" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#888" }}>Направление</div>
                  <input
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setSearchQuery(e.target.value);
                      setSearchOpen(true);
                    }}
                    onFocus={() => setSearchOpen(true)}
                    onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                    placeholder="Например: Париж, Лондон, Стамбул"
                    style={{
                      border: "none",
                      outline: "none",
                      fontSize: 15,
                      fontWeight: 600,
                      width: "100%",
                      background: "transparent",
                    }}
                  />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    style={{
                      background: "none",
                      border: "none",
                      fontSize: 18,
                      color: "#888",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Dropdown */}
              {searchOpen && suggestedCities.length > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    left: 0,
                    width: "100%",
                    background: "#fff",
                    borderRadius: 4,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                    zIndex: 100,
                    overflow: "hidden",
                  }}
                >
                  {suggestedCities.map((city) => (
                    <button
                      key={city.slug}
                      onMouseDown={() => {
                        setSearchQuery(city.name);
                        setSearchOpen(false);
                        navigate(buildAttractionsLink(city.slug));
                      }}
                      style={{
                        width: "100%",
                        border: "none",
                        background: "#fff",
                        padding: "11px 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                        textAlign: "left",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#f5f7ff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "#fff")
                      }
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: "#1a1a1a",
                          }}
                        >
                          {city.name}
                        </div>
                        <div
                          style={{ fontSize: 12, color: "#888", marginTop: 2 }}
                        >
                          {city.country} ·{" "}
                          {city.variants?.toLocaleString("ru-RU")} вариантов
                        </div>
                      </div>
                      <ArrowRight size={14} color="#0071c2" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date */}
            <div
              style={{
                flex: 1,
                background: "#fff",
                borderRadius: 2,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                minHeight: 52,
              }}
            >
              <Calendar size={16} color="#555" style={{ flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 11, color: "#888" }}>Даты</div>
                <input
                  type="date"
                  value={date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setDate(e.target.value)
                  }
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: 14,
                    background: "transparent",
                    cursor: "pointer",
                  }}
                />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSearchSubmit}
              style={{
                background: "#0071c2",
                color: "#fff",
                border: "none",
                borderRadius: 2,
                padding: "0 28px",
                fontSize: 16,
                fontWeight: 700,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              Проверить цены
            </button>
          </div>
        </div>
      </section>

      {/* ── NEARBY (Ташкент) ────────────────────────────────── */}
      {(() => {
        const tashkent = cities.find((c) => c.name === "Ташкент");
        if (!tashkent) return null;
        return (
          <section style={{ padding: "32px 0 0" }}>
            <div
              style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>
                Направления поблизости
              </h2>
              <button
                onClick={() => navigate(buildAttractionsLink(tashkent.slug))}
                style={{
                  display: "block",
                  width: "100%",
                  maxWidth: 520,
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  borderRadius: 8,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                <img
                  src={tashkent.image_url}
                  alt="Ташкент"
                  style={{
                    width: "100%",
                    height: 150,
                    objectFit: "cover",
                    display: "block",
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://picsum.photos/seed/tashkent/600/300";
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(transparent 40%, rgba(0,0,0,0.7))",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    left: 14,
                    color: "#fff",
                    textAlign: "left",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Ташкент</div>
                  <div style={{ fontSize: 12, opacity: 0.85 }}>
                    {tashkent.variants} вариантов
                  </div>
                </div>
              </button>
            </div>
          </section>
        );
      })()}

      {/* ── GENIUS ───────────────────────────────────────────── */}
      <div style={{ marginTop: 40 }}>
        <GeniusSection />
      </div>

      {/* ── DISCOVER BY TYPE ─────────────────────────────────── */}
      {discoveryCards.length > 0 && (
        <section style={{ padding: "40px 0" }}>
          <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
              Посмотрите другие направления
            </h2>
            <p style={{ fontSize: 14, color: "#595959", marginBottom: 20 }}>
              Найдите занятия в разных городах мира
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 16,
              }}
            >
              {discoveryCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() =>
                    navigate(buildAttractionsLink(card.citySlug, card.category))
                  }
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "#fff",
                    padding: 0,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0,0,0,0.12)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.boxShadow = "none")
                  }
                >
                  <img
                    src={card.image}
                    alt={card.title}
                    style={{
                      width: "100%",
                      height: 160,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <div style={{ padding: 16 }}>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#0071c2",
                        fontWeight: 700,
                        marginBottom: 6,
                      }}
                    >
                      {card.totalItems} вариантов
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#1a1a1a",
                        marginBottom: 6,
                      }}
                    >
                      {card.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#595959",
                        lineHeight: 1.5,
                      }}
                    >
                      {card.subtitle}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CITY GRID ────────────────────────────────────────── */}
      <section style={{ padding: "0 0 48px" }}>
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>
            Посмотрите другие направления
          </h2>
          <p style={{ fontSize: 14, color: "#595959", marginBottom: 16 }}>
            Найдите занятия в разных городах мира
          </p>

          {/* Region tabs */}
          <div
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginBottom: 20,
              overflowX: "auto",
              paddingBottom: 4,
            }}
          >
            {regionTabs.map((region) => (
              <button
                key={region}
                onClick={() => setActiveRegion(region)}
                style={{
                  border:
                    region === activeRegion
                      ? "2px solid #003580"
                      : "1px solid #d1d5db",
                  background: region === activeRegion ? "#003580" : "#fff",
                  color: region === activeRegion ? "#fff" : "#333",
                  borderRadius: 999,
                  padding: "8px 16px",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="attr-city-grid">
            {citiesLoading
              ? Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      height: 160,
                      borderRadius: 8,
                      background: "#f0f0f0",
                    }}
                  />
                ))
              : filteredCities.map((city) => (
                  <button
                    key={city.slug}
                    onClick={() => navigate(buildAttractionsLink(city.slug))}
                    style={{
                      position: "relative",
                      height: 160,
                      border: "none",
                      borderRadius: 8,
                      overflow: "hidden",
                      padding: 0,
                      cursor: "pointer",
                      background: "#ccc",
                    }}
                    onMouseEnter={(e) => {
                      const img = e.currentTarget.querySelector("img");
                      if (img)
                        (img as HTMLElement).style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      const img = e.currentTarget.querySelector("img");
                      if (img)
                        (img as HTMLElement).style.transform = "scale(1)";
                    }}
                  >
                    <img
                      src={city.image_url}
                      alt={city.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                        transition: "transform 0.3s",
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://picsum.photos/seed/${city.slug}/400/250`;
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(transparent 35%, rgba(0,0,0,0.72))",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        bottom: 10,
                        left: 12,
                        right: 12,
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          color: "#fff",
                          fontSize: 16,
                          fontWeight: 700,
                          lineHeight: 1.2,
                        }}
                      >
                        {city.name}
                      </div>
                      <div
                        style={{
                          color: "rgba(255,255,255,0.82)",
                          fontSize: 12,
                          marginTop: 3,
                        }}
                      >
                        {city.variants?.toLocaleString("ru-RU")} вариантов
                      </div>
                    </div>
                  </button>
                ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
