"use client";
import { useRouter } from "next/navigation";
import type { Attraction } from "@/types";

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[аа]/g, "a")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .replace(/-+/g, "-");
}

interface Props {
  attractions?: Attraction[];
  isLoading?: boolean;
}

function fmt(p: number) {
  return p > 0 ? `UZS ${Math.round(p).toLocaleString("ru-RU")}` : "Бесплатно";
}

export default function AttractionsSection({
  attractions = [],
  isLoading = false,
}: Props) {
  const router = useRouter();

  return (
    <section style={{ padding: "32px 0" }}>
      <div className="site-container">
        <div className="attractions-header">
          <div>
            <h2
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#1a1a1a",
                margin: 0,
              }}
            >
              Достопримечательности и развлечения
            </h2>
            <p
              style={{
                fontSize: 14,
                color: "var(--booking-text-light)",
                marginTop: 4,
                marginBottom: 0,
              }}
            >
              Откройте лучшие места рядом с вашим жильём
            </p>
          </div>
          <button
            onClick={() => router.push("/attractions")}
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "var(--booking-blue-light)",
              background: "none",
              border: "none",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            Посмотреть все
          </button>
        </div>

        <div className="attractions-grid">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    background: "#f0f0f0",
                    paddingBottom: "75%",
                  }}
                />
              ))
            : attractions.map((item) => (
                <div
                  key={item.id}
                  onClick={() =>
                    router.push(`/attractions/${slugify(item.city || "")}`)
                  }
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    border: "1px solid var(--booking-border)",
                    cursor: "pointer",
                    background: "#fff",
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
                  <div
                    style={{
                      position: "relative",
                      paddingBottom: "75%",
                      background: "#f0f0f0",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={item.image_url}
                      alt={item.name}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://picsum.photos/seed/${item.id}/300/200`;
                      }}
                    />
                    <span
                      style={{
                        position: "absolute",
                        top: 8,
                        left: 8,
                        background: "rgba(255,255,255,0.92)",
                        color: "#1a1a1a",
                        fontSize: 11,
                        fontWeight: 500,
                        padding: "2px 8px",
                        borderRadius: 20,
                      }}
                    >
                      {item.category}
                    </span>
                  </div>
                  <div style={{ padding: "10px 12px 12px" }}>
                    <h3
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: "#1a1a1a",
                        margin: "0 0 4px",
                        lineHeight: 1.3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {item.name}
                    </h3>
                    <p
                      style={{
                        fontSize: 12,
                        color: "var(--booking-text-light)",
                        margin: "0 0 8px",
                      }}
                    >
                      {item.city}, {item.country}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      {item.rating > 0 && (
                        <span
                          style={{
                            background: "var(--booking-blue)",
                            color: "#fff",
                            fontSize: 12,
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 4,
                          }}
                        >
                          {item.rating.toFixed(1)}
                        </span>
                      )}
                      <span
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: "var(--booking-blue-light)",
                        }}
                      >
                        {fmt(item.price)}
                      </span>
                    </div>
                    {item.duration_hours > 0 && (
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--booking-text-light)",
                          margin: "6px 0 0",
                        }}
                      >
                        ⏱ {item.duration_hours} ч
                      </p>
                    )}
                  </div>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
