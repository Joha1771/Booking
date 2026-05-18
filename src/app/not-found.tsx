import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <h1 style={{ fontSize: 48, fontWeight: 900, color: "#003580" }}>404</h1>
      <p style={{ fontSize: 18, color: "#595959" }}>Страница не найдена</p>
      <Link href="/" style={{ padding: "12px 28px", background: "#0071c2", color: "#fff", textDecoration: "none", borderRadius: 4, fontWeight: 700 }}>На главную</Link>
    </div>
  );
}
