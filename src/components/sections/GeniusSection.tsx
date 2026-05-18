"use client";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";

const GENIUS_BENEFITS = [
  { icon: "percentage", title: "Скидки 10% на жильё", desc: "Экономьте на вариантах жилья по всему миру, участвующих в программе.", locked: false },
  { icon: "car", title: "Скидка 10% на аренду автомобилей", desc: "Сэкономьте на аренде некоторых автомобилей", locked: false },
  { icon: "percentage", title: "Скидки 10–15% на жильё", desc: "Завершите 5 бронирований, чтобы получить статус Genius 2-го уровня.", locked: true },
  { icon: "car", title: "Скидки 10–15% на аренду автомобилей", desc: "Завершите 5 бронирований, чтобы получить статус Genius 2-го уровня.", locked: true },
  { icon: "coffee", title: "Бесплатный завтрак", desc: "Завершите 5 бронирований, чтобы получить статус Genius 2-го уровня.", locked: true },
  { icon: "bed", title: "Бесплатное повышение категории номера", desc: "Завершите 5 бронирований, чтобы получить статус Genius 2-го уровня.", locked: true },
];

function PercentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="#888" strokeWidth="1.5"/>
      <text x="12" y="16" textAnchor="middle" fontSize="11" fill="#888" fontWeight="700">%</text>
    </svg>
  );
}
function CarIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M5 12h14"/>
    </svg>
  );
}
function CoffeeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
      <line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
    </svg>
  );
}
function BedIconSvg() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>
    </svg>
  );
}

function BenefitIcon({ type }: { type: string }) {
  switch (type) {
    case "percentage": return <PercentIcon />;
    case "car": return <CarIcon />;
    case "coffee": return <CoffeeIcon />;
    case "bed": return <BedIconSvg />;
    default: return <PercentIcon />;
  }
}

export default function GeniusSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const scroll = (dir: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dir * 400, behavior: "smooth" });
    }
  };

  return (
    <section style={{ padding: "16px 0 32px" }}>
      <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
        {/* Header row */}
        <div className="genius-header">
          <h2 className="section-heading" style={{ marginBottom: 0 }}>
            Путешествуйте больше, тратьте меньше
          </h2>
          <a href="/genius" onClick={(e) => { e.preventDefault(); router.push("/genius"); }}
            style={{ color: "var(--booking-blue-light)", fontSize: 14, textDecoration: "none", whiteSpace: "nowrap" }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}
          >
            Узнать больше о вознаграждениях
          </a>
        </div>

        <div className="genius-shell">
          <button onClick={() => scroll(-1)} className="genius-arrow">
            <ChevronLeft size={18} />
          </button>
          <div className="genius-track-wrap">
            <div ref={scrollRef} className="genius-track">
              {/* Genius blue card */}
              <div className="genius-card" onClick={() => router.push("/genius")}
                style={{ background: "var(--booking-blue)", color: "#fff", borderRadius: 8, padding: "14px", display: "flex", flexDirection: "column", justifyContent: "space-between", cursor: "pointer" }}
              >
                <div>
                  <div style={{ fontWeight: 900, fontSize: 22, fontStyle: "italic", marginBottom: 12, letterSpacing: "-0.5px", color: "#febb02" }}>Genius</div>
                  <div style={{ fontSize: 14, lineHeight: 1.5 }}>
                    Joha, ваш статус в нашей программе лояльности — <strong>Genius 1-го уровня</strong>
                  </div>
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                    {[1, 2, 3].map((level) => (
                      <div key={level} style={{ flex: 1, height: 4, borderRadius: 2, background: level === 1 ? "#febb02" : "rgba(255,255,255,0.3)" }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Уровень 1 из 3</div>
                </div>
              </div>

              {/* Benefit cards */}
              {GENIUS_BENEFITS.map((b, i) => (
                <div key={i} className="genius-card" onClick={() => router.push("/genius")}
                  style={{ border: "1px solid var(--booking-border)", borderRadius: 8, padding: "14px", display: "flex", flexDirection: "column", gap: 8, cursor: "pointer", transition: "box-shadow 0.15s", position: "relative", background: b.locked ? "#fafafa" : "#fff", opacity: b.locked ? 0.85 : 1 }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                >
                  {b.locked && <Lock size={14} color="#aaa" style={{ position: "absolute", top: 12, right: 12 }} />}
                  <BenefitIcon type={b.icon} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, paddingRight: b.locked ? 16 : 0 }}>{b.title}</div>
                    <div style={{ fontSize: 12, color: "var(--booking-text-light)", lineHeight: 1.4 }}>{b.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => scroll(1)} className="genius-arrow">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
