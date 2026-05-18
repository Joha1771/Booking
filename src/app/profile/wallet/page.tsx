"use client";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function WalletPage() {
  const router = useRouter();
  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <Header />
      <div style={{ borderBottom: "1px solid #e7e7e7", padding: "12px 0" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px", fontSize: 13 }}>
          <span style={{ color: "#0071c2", cursor: "pointer" }} onClick={() => router.push("/profile")}>Мой аккаунт</span>
          <span style={{ margin: "0 6px", color: "#888" }}>›</span>
          <span>Вознаграждения и Кошелёк</span>
        </div>
      </div>
      <div style={{ background: "#003580", padding: "40px 0 60px", marginBottom: -30 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 16px", textAlign: "center", color: "#fff" }}>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Вознаграждения и Кошелёк</h1>
          <p style={{ fontSize: 16, opacity: 0.9 }}>Сэкономьте на следующей поездке с Booking.com</p>
        </div>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 16px 60px" }}>
        <div style={{ background: "#fff", border: "1px solid #e7e7e7", borderRadius: 8, padding: 24, marginBottom: 24, display: "grid", gridTemplateColumns: "auto 1fr", gap: 24, alignItems: "center" }}>
          <div style={{ fontSize: 48 }}>💰</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>В вашем Кошельке</div>
            <div style={{ fontSize: 13, color: "#595959", marginBottom: 12 }}>Включая все вознаграждения, которые можно потратить</div>
            <div style={{ fontSize: 32, fontWeight: 900 }}>€ 0</div>
          </div>
          <div style={{ gridColumn: "2", borderLeft: "1px solid #e7e7e7", paddingLeft: 24 }}>
            {[{ label: "Бонусы", value: "€ 0" }, { label: "Ваучеры (0)", value: "€ 0" }].map(item => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14 }}>{item.label}<Info size={14} color="#888" /></div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: 32, fontSize: 14 }}>
          Есть код купона?{" "}
          <button style={{ color: "#0071c2", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, textDecoration: "underline" }}>Добавить купон</button>
        </div>
        <div style={{ borderTop: "1px solid #e7e7e7", paddingTop: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24 }}>Что такое вознаграждения и Кошелёк?</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {[
              { icon: "🎁", title: "Бронируйте и получайте вознаграждения", desc: "Бонусы, ваучеры и многое другое! Всё это можно потратить на следующую поездку." },
              { icon: "📱", title: "Всё хранится в одном месте", desc: "В Кошельке хранятся все ваши вознаграждения и история начислений." },
              { icon: "💳", title: "Платите бонусами и экономьте", desc: "Если для бронирования можно использовать вознаграждение, вы увидите его при оплате." },
            ].map(item => (
              <div key={item.title}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{item.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{item.title}</div>
                <div style={{ fontSize: 13, color: "#595959", lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
