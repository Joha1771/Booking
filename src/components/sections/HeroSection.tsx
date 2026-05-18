"use client";
import SearchBar from "@/components/search/SearchBar";
import useAuthStore from "@/store/authStore";

export default function HeroSection() {
  const { profile, user } = useAuthStore();
  const name =
    profile?.full_name?.split(" ")[0] ||
    user?.user_metadata?.full_name?.split(" ")[0] ||
    "Joha";

  return (
    <section
      className="hero-section"
      style={{
        background: "var(--booking-blue)",
        paddingTop: 40,
        paddingBottom: 64,
        position: "relative",
      }}
    >
      <div style={{ maxWidth: 1150, margin: "0 auto", padding: "0 16px" }}>
        <h1
          className="hero-title"
          style={{
            color: "#fff",
            fontSize: 32,
            fontWeight: 800,
            marginBottom: 8,
            lineHeight: 1.2,
          }}
        >
          {name}, куда дальше?
        </h1>
        <p
          className="hero-subtitle"
          style={{
            color: "#fff",
            fontSize: 18,
            opacity: 0.95,
            marginBottom: 24,
          }}
        >
          Найдите эксклюзивные бонусы Genius по всему миру!
        </p>
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: -44,
          display: "flex",
          justifyContent: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1150,
            padding: "0 16px",
            pointerEvents: "auto",
          }}
        >
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
