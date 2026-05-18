"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Briefcase, Star, Wallet, MessageSquare, Heart, Settings, Shield, Bell, Users, HelpCircle, Scale, Home, LogOut, ChevronRight } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import useAuthStore from "@/store/authStore";

const SECTIONS = [
  { title: "Платёжная информация", items: [
    { icon: Wallet, label: "Вознаграждения и Кошелёк", path: "/profile/wallet" },
    { icon: Briefcase, label: "Способы оплаты", path: "/profile" },
  ]},
  { title: "Управление аккаунтом", items: [
    { icon: User, label: "Личные данные", path: "/profile" },
    { icon: Shield, label: "Настройки безопасности", path: "/profile" },
    { icon: Users, label: "Другие путешественники", path: "/profile" },
  ]},
  { title: "Настройки", items: [
    { icon: Settings, label: "Персональные настройки", path: "/profile" },
    { icon: Bell, label: "Настройки рассылки", path: "/profile" },
  ]},
  { title: "Мои путешествия", items: [
    { icon: Home, label: "Поездки и бронирования", path: "/profile/bookings" },
    { icon: Heart, label: "Избранное", path: "/profile/saved" },
    { icon: MessageSquare, label: "Мои отзывы", path: "/profile" },
  ]},
  { title: "Помощь", items: [
    { icon: HelpCircle, label: "Связаться со службой поддержки", path: "/" },
    { icon: Scale, label: "Разрешение споров", path: "/" },
  ]},
];

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading, signOut } = useAuthStore();

  useEffect(() => { if (!loading && !user) router.push("/login"); }, [user, loading, router]);

  if (loading || !user) return null;

  const name = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Пользователь";
  const initials = name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "J";

  const handleSignOut = async () => { await signOut(); router.push("/"); };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5" }}>
      <Header />
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 16px 48px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#e87722", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#fff" }}>{initials}</div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Здравствуйте, {name.split(" ")[0]}!</h1>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span style={{ background: "#003580", color: "#febb02", fontWeight: 900, fontSize: 13, fontStyle: "italic", padding: "2px 8px", borderRadius: 3 }}>Genius</span>
              <span style={{ fontSize: 14, color: "#595959" }}>1-го уровня</span>
            </div>
          </div>
        </div>

        {/* Genius card */}
        <div style={{ background: "#003580", borderRadius: 8, padding: 24, marginBottom: 24, color: "#fff" }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Ваши Genius-вознаграждения</div>
          <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 16 }}>Вас ждут вознаграждения и скидки по всему миру.</div>
          <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
            {[
              { icon: "🏷️", label: "Экономия 10%
на жильё" },
              { icon: "🚗", label: "Скидка 10%
на авто" },
              { icon: "🏷️", label: "Скидки 10–15%
на жильё", locked: true },
              { icon: "☕", label: "Бесплатные
завтраки", locked: true },
            ].map((b, i) => (
              <div key={i} onClick={() => router.push("/genius")} style={{ background: b.locked ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.15)", borderRadius: 6, padding: "10px 14px", cursor: "pointer", minWidth: 110, flexShrink: 0, opacity: b.locked ? 0.6 : 1, border: "1px solid rgba(255,255,255,0.15)" }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{b.icon}</div>
                <div style={{ fontSize: 11, lineHeight: 1.4, whiteSpace: "pre-line" }}>{b.label}</div>
              </div>
            ))}
          </div>
          <button onClick={() => router.push("/genius")} style={{ marginTop: 16, background: "none", border: "none", color: "#febb02", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, textDecoration: "underline" }}>
            Узнать больше о вознаграждениях
          </button>
        </div>

        {/* Sections */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24 }}>
          {SECTIONS.map((sec) => (
            <div key={sec.title} style={{ background: "#fff", borderRadius: 8, padding: 20, border: "1px solid #e7e7e7" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#595959", marginBottom: 12 }}>{sec.title}</div>
              {sec.items.map((item) => (
                <button key={item.label} onClick={() => router.push(item.path)}
                  style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "10px 0", background: "none", border: "none", cursor: "pointer", borderBottom: "1px solid #f5f5f5", textAlign: "left" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#f9f9f9")}
                  onMouseLeave={e => (e.currentTarget.style.background = "none")}
                >
                  <item.icon size={18} color="#595959" />
                  <span style={{ fontSize: 14, flex: 1 }}>{item.label}</span>
                  <ChevronRight size={16} color="#aaa" />
                </button>
              ))}
            </div>
          ))}
        </div>

        <button onClick={handleSignOut} style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 0", background: "none", border: "none", cursor: "pointer", color: "#c00", fontSize: 15, fontWeight: 600 }}>
          <LogOut size={18} /> Выйти
        </button>
      </div>
      <Footer />
    </div>
  );
}
