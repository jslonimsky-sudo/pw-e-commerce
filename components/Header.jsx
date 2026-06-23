'use client';

import { useState } from 'react';

export default function Header({ cartCount, onCartOpen, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);

  function handleNavClick(e, target, sectionId) {
    e.preventDefault();
    onNavigate(target, sectionId);
    setMenuOpen(false);
  }

  return (
    <header>
      <div className="header-inner">
        <a href="#" className="logo" onClick={(e) => { e.preventDefault(); onNavigate('home'); }} aria-label="JS Studios - Inicio">
          JS <span>STUDIOS</span>
        </a>
        <nav aria-label="Navegación principal" className={menuOpen ? 'nav-open' : ''}>
          <ul>
            <li><a href="#coleccion" onClick={(e) => handleNavClick(e, 'coleccion')}>Colección</a></li>
            <li><a href="#destacados" onClick={(e) => handleNavClick(e, 'home', 'destacados')}>Destacados</a></li>
            <li><a href="#nosotros" onClick={(e) => handleNavClick(e, 'home', 'nosotros')}>Nosotros</a></li>
          </ul>
        </nav>
        <div className="header-right">
          <button
            className="menu-toggle"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
          >
            <span aria-hidden="true">{menuOpen ? '✕' : '☰'}</span>
          </button>
          <button className="cart-btn" onClick={onCartOpen} aria-label="Ver carrito">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            Carrito
            <span className="cart-count" aria-live="polite">{cartCount}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
