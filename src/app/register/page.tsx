"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import useAuthStore from "@/store/authStore";

export default function RegisterPage() {
  const router = useRouter();
  const { signUp } = useAuthStore();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const inp = { width: "100%", padding: "12px 14px 12px 40px", border: "1px solid #ccc", borderRadius: 4, fontSize: 15, outline: "none", boxSizing: "border-box" as const };

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.password) { setError("Заполните обязательные поля"); return; }
    if (form.password.length < 6) { setError("Пароль минимум 6 символов"); return; }
    if (form.password !== form.confirm) { setError("Пароли не совпадают"); return; }
    if (!agreed) { setError("Примите условия использования"); return; }
    setLoading(true); setError("");
    try {
      await signUp(form.email, form.password, `${form.firstName} ${form.lastName}`.trim());
      setSuccess(true);
    } catch (e: any) {
      setError(e.message === "User already registered" ? "Email уже зарегистрирован" : e.message);
    } finally { setLoading(false); }
  };

  if (success) return (
    <div style={{ minHeight: "100vh", background: "#003580", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: 8, padding: 40, maxWidth: 420, width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✉️</div>
        <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 12 }}>Подтвердите email</h2>
        <p style={{ fontSize: 14, color: "#555", marginBottom: 24 }}>Мы отправили письмо на <strong>{form.email}</strong>. Перейдите по ссылке для активации.</p>
        <button onClick={() => router.push("/login")} style={{ padding: "12px 32px", background: "#0071c2", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", fontWeight: 700 }}>Перейти к входу</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#003580", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "24px 0", textAlign: "center" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{ color: "#fff", fontSize: 28, fontWeight: 900, fontFamily: "Georgia, serif" }}>Booking.com</span>
        </Link>
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px 40px" }}>
        <div style={{ background: "#fff", borderRadius: 8, padding: 32, width: "100%", maxWidth: 460 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Создать аккаунт</h1>
          <p style={{ fontSize: 14, color: "#555", marginBottom: 24 }}>Присоединяйтесь к миллионам путешественников</p>
          {error && <div style={{ background: "#fff0f0", border: "1px solid #ffcdd2", borderRadius: 4, padding: "10px 14px", fontSize: 13, color: "#c00", marginBottom: 16 }}>{error}</div>}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            {[["firstName","Имя *"], ["lastName","Фамилия"]].map(([k,l]) => (
              <div key={k}>
                <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>{l}</label>
                <div style={{ position: "relative" }}>
                  <input value={(form as any)[k]} onChange={e => upd(k, e.target.value)} placeholder={l.replace(" *","")} style={inp} />
                  <User size={15} color="#888" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Email *</label>
            <div style={{ position: "relative" }}>
              <input type="email" value={form.email} onChange={e => upd("email", e.target.value)} placeholder="name@example.com" style={inp} />
              <Mail size={15} color="#888" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Пароль *</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={form.password} onChange={e => upd("password", e.target.value)} placeholder="Минимум 6 символов" style={{ ...inp, paddingRight: 40 }} />
              <Lock size={15} color="#888" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
              <button onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}>
                {showPass ? <EyeOff size={15} color="#888" /> : <Eye size={15} color="#888" />}
              </button>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, display: "block", marginBottom: 6 }}>Подтвердите пароль *</label>
            <div style={{ position: "relative" }}>
              <input type="password" value={form.confirm} onChange={e => upd("confirm", e.target.value)} placeholder="Повторите пароль" style={inp} />
              <Lock size={15} color="#888" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
            </div>
          </div>
          <label style={{ display: "flex", gap: 10, marginBottom: 20, cursor: "pointer", fontSize: 13, color: "#555", alignItems: "flex-start" }}>
            <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2, accentColor: "#0071c2" }} />
            Я принимаю <Link href="/" style={{ color: "#0071c2" }}>Условия использования</Link> и <Link href="/" style={{ color: "#0071c2" }}>Политику конфиденциальности</Link>
          </label>
          <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: 14, background: loading ? "#ccc" : "#0071c2", color: "#fff", border: "none", borderRadius: 4, fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Создаём..." : "Создать аккаунт"}
          </button>
          <div style={{ textAlign: "center", marginTop: 20, fontSize: 14 }}>
            Уже есть аккаунт? <Link href="/login" style={{ color: "#0071c2", fontWeight: 600, textDecoration: "none" }}>Войти</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
