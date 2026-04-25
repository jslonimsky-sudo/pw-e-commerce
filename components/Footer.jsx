export default function Footer({ onNavigate }) {
  return (
    <footer>
      <div className="footer-inner">
        <div className="footer-brand">
          <p className="footer-logo">JS <span>STUDIOS</span></p>
          <p className="footer-desc">Gorras premium para quienes viven el streetwear. Calidad, estilo y actitud en cada drop.</p>
        </div>
        <div className="footer-nav">
          <p className="footer-nav-title">Navegación</p>
          <ul>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('home'); }}>Inicio</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); onNavigate('coleccion'); }}>Shop</a></li>
            <li>
              <a href="#" onClick={(e) => e.preventDefault()}>Contacto</a>
              <p className="footer-contact">+54 9 11 6248-3790</p>
            </li>
          </ul>
        </div>
        <div className="footer-social">
          <p className="footer-nav-title">Seguinos</p>
          <ul>
            <li><a href="https://instagram.com/jsstudios.ar" target="_blank" rel="noreferrer">Instagram</a> <span className="footer-handle">@jsstudios.ar</span></li>
            <li><a href="https://tiktok.com/@jsstudios.ar" target="_blank" rel="noreferrer">TikTok</a> <span className="footer-handle">@jsstudios.ar</span></li>
            <li><a href="https://x.com/jsstudios_ar" target="_blank" rel="noreferrer">X</a> <span className="footer-handle">@jsstudios_ar</span></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 JS Studios. Todos los derechos reservados.</p>
      </div>
    </footer>
  );
}
