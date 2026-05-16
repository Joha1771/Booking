import SearchBar from "../../Search/components/SearchBar.jsx";

export default function HeroSection() {
  return (
    <section
      className="hero-section"
      style={{
        background: "var(--booking-blue)",
        paddingTop: 40,
        paddingBottom: 24,
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
          Joha, куда дальше?
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
        <div className="hero-search-wrap">
          <SearchBar />
        </div>
      </div>
    </section>
  );
}
