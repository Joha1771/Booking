"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import useAuthStore from "@/store/authStore";

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const inp = { width: "100%", padding: "12px 14px 12px 40px", border: "1px solid #ccc", borderRadius: 4, fontSize: 15, outline: "none", boxSizing: "border-box" as const };

  const handleSubmit = async () => {
    if (!email || !password) { setError("Заполните все поля"); return; }
    setLoading(true); setError("");
    try {
      await signIn(email, password);
      router.push("/profile");
    } catch (e: any) {
      setError(e.message === "Invalid login credentials" ? "Неверный email или пароль" : e.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#003580", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px 0", textAlign: "center" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ color: "#fff", fontSize: 28, fontWeight: 900, fontFamily: "Georgia, serif" }}>Booking.com</span>
        </Link>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px 40px" }}>
        <div style={{ background: "#fff", borderRadius: 8, padding: 32, width: "100%", maxWidth: 420, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Войти в аккаунт</h1>
          <p style={{ fontSize: 14, color: "#555", marginBottom: 24 }}>Одного аккаунта достаточно для всех сервисов Booking.com</p>
          {error && <div style={{ background: "#fff0f0", border: "1px solid #ffcdd2", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#c00", marginBottom: 16 }}>{error}</div>}
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Email</label>
            <div style={{ position: "relative" }}>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" style={inp} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              <Mail size={16} color="#888" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Пароль</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Введите пароль" style={{ ...inp, paddingRight: 40 }} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
              <Lock size={16} color="#888" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                {showPass ? <EyeOff size={16} color="#888" /> : <Eye size={16} color="#888" />}
              </button>
            </div>
          </div>
          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: 14, background: loading ? "#ccc" : "#0071c2", color: "#fff", border: "none", borderRadius: 4, fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Входим..." : "Войти"}
          </button>
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: "#555" }}>
            Нет аккаунта? <Link href="/register" style={{ color: "#0071c2", fontWeight: 600, textDecoration: "none" }}>Зарегистрироваться</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
