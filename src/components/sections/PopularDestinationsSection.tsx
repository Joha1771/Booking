"use client";
import { useRouter } from "next/navigation";
import type { Destination } from "@/types";

interface Props { destinations: Destination[]; }

const FALLBACK_DESTINATIONS = [
  { id: 1, name: "Ташкент", country: "Узбекистан", flag: "🇺🇿", variants: 1408, avg_price: 0, image_url: "https://cf.bstatic.com/xdata/images/city/600x600/686023.jpg?k=315b82bac9991c71d6f14f8618e68a9b6d3f45b61b9ceb335523918d0e086dbf&o=", dest_type: "city", is_trending: true, region: "" },
  { id: 2, name: "Стамбул", country: "Турция", flag: "🇹🇷", variants: 4863, avg_price: 0, image_url: "https://cf.bstatic.com/xdata/images/city/600x600/999839.jpg?k=0c48abf88150a98bc1ec9280347e9ea97f41265ebfc439c53a5b8fec61ab4fa5&o=", dest_type: "city", is_trending: true, region: "" },
  { id: 3, name: "Алматы", country: "Казахстан", flag: "🇰🇿", variants: 4511, avg_price: 0, image_url: "https://cf.bstatic.com/xdata/images/city/600x600/685481.jpg?k=4bdd14cdd8b0cec50da3eb8020820389e14ca9ef86608dd3b8b1e9e65a32009d&o=", dest_type: "city", is_trending: true, region: "" },
  { id: 4, name: "Душанбе", country: "Таджикистан", flag: "🇹🇯", variants: 181, avg_price: 0, image_url: "https://cf.bstatic.com/xdata/images/city/600x600/956220.jpg?k=9b2c71abc93d24b4c6070ac92dc7a124dbbbbae312ff09954a4370647ec69c08&o=", dest_type: "city", is_trending: true, region: "" },
  { id: 5, name: "Бишкек", country: "Киргизия", flag: "🇰🇬", variants: 1097, avg_price: 0, image_url: "https://cf.bstatic.com/xdata/images/city/600x600/685462.jpg?k=2fccb7808a3180fe652862cb256841f9e4e18f3d161c59e04c2d090bc16b748d&o=", dest_type: "city", is_trending: true, region: "" },
];

function DestCard({ dest, height, large, onClick }: { dest: Destination; height: string; large?: boolean; onClick: () => void }) {
  const flag = dest.flag || "";
  const fallbackSrc = `https://picsum.photos/seed/${dest.name}/600/400`;
  const variants = typeof dest.variants === "number" ? dest.variants.toLocaleString("ru-RU") + " вариантов" : (dest as any).variants_label || "";

  return (
    <div onClick={onClick} style={{ position: "relative", borderRadius: 8, overflow: "hidden", paddingTop: height, cursor: "pointer" }}>
      <img src={dest.image_url} alt={dest.name}
        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
        onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
        onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
        onError={e => { (e.currentTarget as HTMLImageElement).src = fallbackSrc; }}
      />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: large ? "48px 16px 16px" : "32px 12px 12px", background: "linear-gradient(transparent, rgba(0,0,0,0.6))", pointerEvents: "none" }}>
        <div style={{ color: "#fff", fontSize: large ? 22 : 18, fontWeight: 700, lineHeight: 1.2 }}>
          {dest.name} {flag}
        </div>
        {variants && <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, marginTop: 2 }}>{variants}</div>}
      </div>
    </div>
  );
}

export default function PopularDestinationsSection({ destinations }: Props) {
  const router = useRouter();
  const items = (destinations?.length ? destinations : FALLBACK_DESTINATIONS).slice(0, 5);
  const handleClick = (dest: Destination) => router.push(`/search?destination=${encodeURIComponent(dest.name)}`);

  return (
    <section style={{ padding: "24px 0 32px" }}>
      <div className="site-container">
        <h2 className="section-heading">Популярные направления</h2>
        <p className="section-subheading">Гости, искавшие Узбекистан, также бронировали здесь.</p>
        <div className="destinations-top-grid">
          {items.slice(0, 2).map((dest, i) => <DestCard key={i} dest={dest} height="55%" large onClick={() => handleClick(dest)} />)}
        </div>
        <div className="destinations-bottom-grid">
          {items.slice(2, 5).map((dest, i) => <DestCard key={i} dest={dest} height="60%" onClick={() => handleClick(dest)} />)}
        </div>
      </div>
    </section>
  );
}
