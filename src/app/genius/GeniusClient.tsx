"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ = [
  { q: "Как перейти на следующий уровень Genius", a: "Чтобы перейти на 2-й уровень, необходимо завершить 5 бронирований в течение 2 лет. Засчитываются все типы бронирований." },
  { q: "Где я могу воспользоваться Genius-скидкой?", a: "При бронировании вариантов жилья и аренды автомобилей по всему миру, участвующих в программе. Genius-варианты отмечены синим значком." },
  { q: "Как применяются Genius-вознаграждения?", a: "Автоматически при бронировании — никаких кодов вводить не нужно." },
  { q: "Почему мой уровень Genius понизился?", a: "Мы не понижаем уровни участников программы. Убедитесь, что вы вошли в правильный аккаунт." },
  { q: "Как работает программа лояльности Genius?", a: "Genius — бесплатная программа лояльности Booking.com. Создав аккаунт, вы получаете статус 1-го уровня со скидкой 10% на жильё и авто." },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid #e7e7e7", cursor: "pointer" }} onClick={() => setOpen(!open)}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0" }}>
        <span style={{ fontSize: 15, fontWeight: 600 }}>{q}</span>
        {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
      {open && <p style={{ fontSize: 14, color: "#333", lineHeight: 1.7, paddingBottom: 16 }}>{a}</p>}
    </div>
  );
}

export default function GeniusClient() {
  const router = useRouter();
  return (
    <>
      {/* Hero */}
      <div style={{ backgroundImage: "url(https://r-xx.bstatic.com/data/genius_expand/genius-page-hero-desktop.jpg)", backgroundSize: "cover", backgroundPosition: "center", minHeight: 320, display: "flex", alignItems: "center", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)" }} />
        <div style={{ position: "relative", maxWidth: 700, padding: "48px 40px", color: "#fff" }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Путешествуйте в своём стиле</div>
          <div style={{ fontSize: 64, fontWeight: 900, fontStyle: "italic", color: "#febb02", lineHeight: 1, marginBottom: 12 }}>Genius</div>
          <div style={{ fontSize: 18, opacity: 0.9 }}>Программа лояльности Booking.com</div>
        </div>
      </div>

      {/* Level card */}
      <div style={{ maxWidth: 780, margin: "-60px auto 0", padding: "0 16px", position: "relative", zIndex: 10 }}>
        <div style={{ background: "#fff", borderRadius: 8, boxShadow: "0 4px 24px rgba(0,0,0,0.12)", padding: 32, textAlign: "center" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Вы на 1-м уровне!</h2>
          <p style={{ fontSize: 14, color: "#595959", marginBottom: 24, maxWidth: 500, margin: "0 auto 24px" }}>Завершите 5 бронирований за 2 года, чтобы перейти на 2-й уровень.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 20 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ width: 48, height: 48, borderRadius: "50%", border: "2px dashed #d0d5dd", background: "#f9f9f9" }} />
            ))}
          </div>
          <button onClick={() => router.push("/search")} style={{ color: "#0071c2", background: "none", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 600, textDecoration: "underline" }}>Как перейти на уровень выше</button>
        </div>
      </div>

      {/* Levels */}
      <div style={{ maxWidth: 1150, margin: "60px auto 0", padding: "0 16px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Откройте новые уровни вознаграждений</h2>
        <p style={{ fontSize: 15, color: "#595959", marginBottom: 32 }}>В программе учитывается каждое ваше бронирование.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 60 }}>
          {[
            { level: "Genius 1-го уровня", active: true, perks: ["Скидки 10% на жильё", "Скидка 10% на аренду авто"] },
            { level: "Genius 2-го уровня", active: false, perks: ["Скидки 10–15% на жильё", "Скидки 10–15% на аренду авто", "Бесплатный завтрак", "Бесплатное повышение категории номера"] },
            { level: "Genius 3-го уровня", active: false, perks: ["Скидки 10–20% на жильё", "Скидки 10–15% на аренду авто", "Бесплатный завтрак", "Повышение категории номера", "Приоритетная поддержка"] },
          ].map((col) => (
            <div key={col.level} style={{ border: col.active ? "2px solid #0071c2" : "1px solid #e7e7e7", borderRadius: 8, padding: 20 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#0071c2", marginBottom: 12 }}>{col.level}</div>
              {col.perks.map((p, i) => <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 14 }}><span style={{ color: "#0071c2" }}>✓</span>{p}</div>)}
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Часто задаваемые вопросы</h2>
        <div style={{ maxWidth: 860, marginBottom: 60 }}>
          {FAQ.map((item, i) => <FaqItem key={i} {...item} />)}
        </div>
      </div>
    </>
  );
}
