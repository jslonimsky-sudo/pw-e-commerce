export default function Hero({ onNavigate }) {
  return (
    <section className="hero" aria-label="Sección principal">
      <div className="hero-bg" aria-hidden="true"></div>
      <div className="hero-content">
        <span className="hero-badge"> NUEVA TEMPORADA</span>
        <h1 className="hero-title">COLECCIÓN<br />2026</h1>
        <a href="#" className="hero-cta" onClick={(e) => { e.preventDefault(); onNavigate('coleccion'); }}>VER COLECCIÓN</a>
      </div>
    </section>
  );
}
