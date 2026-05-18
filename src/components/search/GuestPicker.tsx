"use client";
import useSearchStore from "@/store/searchStore";

function Counter({ label, value, onMinus, onPlus, min = 0 }: {
  label: string; value: number; onMinus: () => void; onPlus: () => void; min?: number;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--booking-border)" }}>
      <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button className="counter-btn" onClick={onMinus} disabled={value <= min}>−</button>
        <span style={{ fontSize: 16, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{value}</span>
        <button className="counter-btn" onClick={onPlus}>+</button>
      </div>
    </div>
  );
}

export default function GuestPicker() {
  const { adults, children, childrenAges, rooms, setAdults, setChildren, setChildAge, setRooms, withPets, setWithPets, closeGuestPicker } = useSearchStore();

  return (
    <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, width: 340, background: "#fff", borderRadius: 4, boxShadow: "0 2px 16px rgba(0,0,0,0.25)", zIndex: 1000, padding: "0 16px 16px" }}>
      <Counter label="Взрослых" value={adults} min={1} onMinus={() => setAdults(adults - 1)} onPlus={() => setAdults(adults + 1)} />
      <div style={{ paddingBottom: 12, borderBottom: "1px solid var(--booking-border)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Детей</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="counter-btn" onClick={() => setChildren(children - 1)} disabled={children <= 0}>−</button>
            <span style={{ fontSize: 16, fontWeight: 600, minWidth: 20, textAlign: "center" }}>{children}</span>
            <button className="counter-btn" onClick={() => setChildren(children + 1)}>+</button>
          </div>
        </div>
        {children > 0 && (
          <div style={{ fontSize: 13, color: "var(--booking-text-light)", marginBottom: 10 }}>
            Чтобы найти подходящий вариант для вашей группы и показать корректные цены, нам нужно знать возраст ваших детей на момент отъезда.
          </div>
        )}
        {childrenAges.map((age, i) => (
          <select key={i} value={age} onChange={e => setChildAge(i, Number(e.target.value))}
            style={{ width: "100%", padding: "8px 12px", border: "1px solid var(--booking-border)", borderRadius: 4, fontSize: 14, marginBottom: 8, cursor: "pointer" }}>
            {Array.from({ length: 18 }, (_, j) => (
              <option key={j} value={j}>{j === 0 ? "До 1 года" : `${j} ${j === 1 ? "год" : j < 5 ? "года" : "лет"}`}</option>
            ))}
          </select>
        ))}
      </div>
      <Counter label="Номера" value={rooms} min={1} onMinus={() => setRooms(rooms - 1)} onPlus={() => setRooms(rooms + 1)} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0 10px" }}>
        <span style={{ fontSize: 14, fontWeight: 600 }}>Вы путешествуете с животными?</span>
        <div onClick={() => setWithPets(!withPets)}
          style={{ width: 44, height: 24, borderRadius: 12, background: withPets ? "var(--booking-blue)" : "#ccc", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 2, left: withPets ? 22 : 2, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }} />
        </div>
      </div>
      {!withPets && (
        <div style={{ fontSize: 12, color: "var(--booking-text-light)", marginBottom: 8 }}>
          Животные-помощники не считаются.{" "}
          <a href="#" style={{ color: "var(--booking-blue-light)", textDecoration: "none" }}>Подробнее о путешествиях с животными-помощниками</a>
        </div>
      )}
      <button onClick={closeGuestPicker}
        style={{ width: "100%", padding: "10px", background: "#fff", border: "1px solid var(--booking-blue)", borderRadius: 4, fontSize: 14, fontWeight: 600, color: "var(--booking-blue)", cursor: "pointer", marginTop: 4 }}>
        Готово
      </button>
    </div>
  );
}
