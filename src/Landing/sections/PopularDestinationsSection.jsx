import { useTrendingDestinations } from "../../hooks/useQueries.js";
import { useNavigate } from "react-router-dom";

// Real data from booking.com Apollo cache (May 2025)
const FALLBACK_DESTINATIONS = [
  {
    name: "Ташкент",
    country: "Узбекистан",
    flag: "🇺🇿",
    variants: "1 408 вариантов",
    image_url:
      "https://cf.bstatic.com/xdata/images/city/600x600/686023.jpg?k=315b82bac9991c71d6f14f8618e68a9b6d3f45b61b9ceb335523918d0e086dbf&o=",
  },
  {
    name: "Стамбул",
    country: "Турция",
    flag: "🇹🇷",
    variants: "4 863 варианта",
    image_url:
      "https://cf.bstatic.com/xdata/images/city/600x600/999839.jpg?k=0c48abf88150a98bc1ec9280347e9ea97f41265ebfc439c53a5b8fec61ab4fa5&o=",
  },
  {
    name: "Алматы",
    country: "Казахстан",
    flag: "🇰🇿",
    variants: "4 511 вариантов",
    image_url:
      "https://cf.bstatic.com/xdata/images/city/600x600/685481.jpg?k=4bdd14cdd8b0cec50da3eb8020820389e14ca9ef86608dd3b8b1e9e65a32009d&o=",
  },
  {
    name: "Душанбе",
    country: "Таджикистан",
    flag: "🇹🇯",
    variants: "181 вариант",
    image_url:
      "https://cf.bstatic.com/xdata/images/city/600x600/956220.jpg?k=9b2c71abc93d24b4c6070ac92dc7a124dbbbbae312ff09954a4370647ec69c08&o=",
  },
  {
    name: "Бишкек",
    country: "Киргизия",
    flag: "🇰🇬",
    variants: "1 097 вариантов",
    image_url:
      "https://cf.bstatic.com/xdata/images/city/600x600/685462.jpg?k=2fccb7808a3180fe652862cb256841f9e4e18f3d161c59e04c2d090bc16b748d&o=",
  },
];

export default function PopularDestinationsSection() {
  const navigate = useNavigate();
  const { data: destinations, isLoading } = useTrendingDestinations();

  const items = (
    destinations?.length ? destinations : FALLBACK_DESTINATIONS
  ).slice(0, 5);

  const handleClick = (dest) => {
    navigate(`/search?destination=${encodeURIComponent(dest.name)}`);
  };

  if (isLoading) {
    return (
      <section style={{ padding: "24px 0 32px" }}>
        <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
          <div
            style={{
              height: 28,
              width: 240,
              background: "#f0f0f0",
              borderRadius: 4,
              marginBottom: 8,
            }}
          />
          <div
            style={{
              height: 16,
              width: 380,
              background: "#f0f0f0",
              borderRadius: 4,
              marginBottom: 16,
            }}
          />
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
          >
            {[0, 1].map((i) => (
              <div
                key={i}
                style={{
                  paddingTop: "55%",
                  background: "#f0f0f0",
                  borderRadius: 8,
                }}
              />
            ))}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: 8,
                gridColumn: "1/-1",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    paddingTop: "60%",
                    background: "#f0f0f0",
                    borderRadius: 8,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: "24px 0 32px" }}>
      <div className="site-container">
        <h2 className="section-heading">Популярные направления</h2>
        <p className="section-subheading">
          Гости, искавшие Узбекистан, также бронировали здесь.
        </p>

        {/* Top 2 large cards */}
        <div className="destinations-top-grid">
          {items.slice(0, 2).map((dest, i) => (
            <DestCard
              key={i}
              dest={dest}
              height="55%"
              large
              onClick={() => handleClick(dest)}
            />
          ))}
        </div>

        {/* Bottom 3 smaller cards */}
        <div className="destinations-bottom-grid">
          {items.slice(2, 5).map((dest, i) => (
            <DestCard
              key={i}
              dest={dest}
              height="60%"
              onClick={() => handleClick(dest)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function DestCard({ dest, height, large, onClick }) {
  const flag = dest.flag || "";
  const fallbackSrc = `https://picsum.photos/seed/${dest.name}/600/400`;

  return (
    <div
      onClick={onClick}
      style={{
        position: "relative",
        borderRadius: 8,
        overflow: "hidden",
        paddingTop: height,
        cursor: "pointer",
      }}
    >
      <img
        src={dest.image_url}
        alt={dest.name}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "transform 0.3s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        onError={(e) => {
          e.currentTarget.src = fallbackSrc;
        }}
      />
      {/* Gradient overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: large ? "48px 16px 16px" : "32px 12px 12px",
          background: "linear-gradient(transparent, rgba(0,0,0,0.6))",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontSize: large ? 22 : 18,
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          {dest.name} {flag}
        </div>
        {dest.variants && (
          <div
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 13,
              marginTop: 2,
            }}
          >
            {dest.variants}
          </div>
        )}
      </div>
    </div>
  );
}
