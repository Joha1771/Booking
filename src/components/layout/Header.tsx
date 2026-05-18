"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { User, Briefcase, Star, Wallet, MessageSquare, Heart, LogOut } from "lucide-react";
import useAuthStore from "@/store/authStore";

// SVG Icons inline (same as old project)
function BedIcon({ width = 16, height = 16, fill = "white" }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={fill}>
      <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9"/>
    </svg>
  );
}
function FlightIcon({ width = 16, height = 16, fill = "white" }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={fill}>
      <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"/>
    </svg>
  );
}
function CarIcon({ width = 16, height = 16, fill = "white" }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={fill}>
      <path d="M5 17H3v-5l2-5h14l2 5v5h-2M7 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0M13 17a2 2 0 1 0 4 0 2 2 0 0 0-4 0M5 12h14"/>
    </svg>
  );
}
function AttractionsIcon({ width = 16, height = 16, fill = "white" }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={fill}>
      <path d="M13.5 3a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M21 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M6 7.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M21 15a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M13.5 11.25a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M6 15a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M18 18.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0M9 18.75a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"/>
    </svg>
  );
}
function TaxiIcon({ width = 16, height = 16, fill = "white" }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill={fill}>
      <path d="M3 17h18M5 17V9l2-4h10l2 4v8M9 9h6M7 13h1M16 13h1M9 17v2M15 17v2"/>
    </svg>
  );
}
function HelpIcon({ width = 20, height = 20, fill = "white" }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke={fill} strokeWidth="1.5" strokeLinecap="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

const NAV_ITEMS = [
  { icon: BedIcon, label: "Жильё", href: "/" },
  { icon: FlightIcon, label: "Авиабилеты", href: "/flights" },
  { icon: CarIcon, label: "Аренда автомобилей", href: "/car-rental" },
  { icon: AttractionsIcon, label: "Варианты досуга", href: "/attractions" },
  { icon: TaxiIcon, label: "Такси от/до аэропорта", href: "/taxi" },
];

const DROPDOWN_ITEMS = [
  { icon: User, label: "Мой аккаунт", path: "/profile" },
  { icon: Briefcase, label: "Бронирования и поездки", path: "/profile/bookings" },
  { icon: Star, label: "Программа лояльности Genius", path: "/genius" },
  { icon: Wallet, label: "Вознаграждения и Кошелёк", path: "/profile/wallet" },
  { icon: MessageSquare, label: "Отзывы", path: "/profile" },
  { icon: Heart, label: "Сохранённое", path: "/profile/saved" },
];

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, signOut } = useAuthStore();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  const name = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Пользователь";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "J";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) setDropOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => { setDropOpen(false); await signOut(); router.push("/"); };

  return (
    <header style={{ background: "var(--booking-blue)" }}>
      <div className="site-container">
        <div className="header-top">
          {/* Logo */}
          <Link to="/" href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <span style={{ color: "#fff", fontSize: 26, fontWeight: 900, fontFamily: "Georgia, serif", letterSpacing: "-0.5px" }}>
              Booking.com
            </span>
          </Link>

          {/* Right side */}
          <div className="header-right">
            {/* Currency */}
            <button style={{ background: "transparent", border: "none", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 4 }}>
              UZS
              <img src="https://flagcdn.com/16x12/uz.png" alt="UZ" style={{ width: 20, height: 14, borderRadius: 2 }} />
            </button>

            {/* Help */}
            <button style={{ background: "transparent", border: "none", color: "#fff", cursor: "pointer", padding: 6, borderRadius: "50%", display: "flex", alignItems: "center" }}>
              <HelpIcon width={20} height={20} fill="white" />
            </button>

            {/* Register property */}
            <button style={{ background: "transparent", border: "1.5px solid #fff", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "6px 12px", borderRadius: 4, whiteSpace: "nowrap" }}>
              Зарегистрировать свой объект
            </button>

            {/* User */}
            <div ref={dropRef} style={{ position: "relative" }}>
              {user ? (
                <>
                  <div className="header-profile" onClick={() => setDropOpen(!dropOpen)} style={{ cursor: "pointer" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f5a623", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, color: "#fff" }}>
                      {initials}
                    </div>
                    <div className="header-profile-text">
                      <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>{name}</div>
                      <div style={{ color: "#febb02", fontSize: 11, fontWeight: 600 }}>Genius 1-го уровня</div>
                    </div>
                  </div>
                  {dropOpen && (
                    <div style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#fff", borderRadius: 4, boxShadow: "0 2px 16px rgba(0,0,0,0.25)", zIndex: 1000, minWidth: 240, overflow: "hidden" }}>
                      {DROPDOWN_ITEMS.map((item) => (
                        <button key={item.label} onClick={() => { setDropOpen(false); router.push(item.path); }}
                          style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 16px", background: "#fff", border: "none", borderBottom: "1px solid #f5f5f5", cursor: "pointer", textAlign: "left", fontSize: 14 }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#f5f5f5")}
                          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                        >
                          <item.icon size={18} color="#595959" />
                          {item.label}
                        </button>
                      ))}
                      <button onClick={handleSignOut}
                        style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "13px 16px", background: "#fff", border: "none", cursor: "pointer", textAlign: "left", fontSize: 14, color: "#c00", fontWeight: 600 }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#fff5f5")}
                        onMouseLeave={e => (e.currentTarget.style.background = "#fff")}
                      >
                        <LogOut size={18} color="#c00" /> Выйти
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => router.push("/register")} style={{ background: "transparent", border: "1.5px solid #fff", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "6px 12px", borderRadius: 4, whiteSpace: "nowrap" }}>
                    Регистрация
                  </button>
                  <button onClick={() => router.push("/login")} style={{ background: "#fff", border: "none", color: "var(--booking-blue)", fontSize: 14, fontWeight: 700, cursor: "pointer", padding: "6px 12px", borderRadius: 4, whiteSpace: "nowrap" }}>
                    Войти
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="header-nav">
          {NAV_ITEMS.map((item, i) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={i}
                href={item.href}
                className="header-nav-link"
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 14px", borderRadius: 24,
                  border: isActive ? "2px solid #fff" : "2px solid transparent",
                  background: "transparent", color: "#fff",
                  fontWeight: isActive ? 600 : 400, fontSize: 14,
                  textDecoration: "none", cursor: "pointer",
                  transition: "border-color 0.15s", whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.borderColor = "transparent"; }}
              >
                <Icon width={16} height={16} fill="white" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
