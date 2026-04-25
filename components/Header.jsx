export default function Header({ cartCount, onCartOpen, onNavigate }) {
  return (
    <header>
      <div className="header-inner">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} aria-label="JS Studios - Inicio">
          JS <span>STUDIOS</span>
        </a>
        <nav aria-label="Navegación principal">
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('coleccion'); }}>Colección</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>Destacados</a></li>
            <li><a href="#nosotros" onClick={(e) => e.preventDefault()}>Nosotros</a></li>
          </ul>
        </nav>
        <button className="cart-btn" onClick={onCartOpen} aria-label="Ver carrito">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          Carrito
          <span className="cart-count" aria-live="polite">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}
