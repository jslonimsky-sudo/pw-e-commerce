import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="pago-resultado-page">
      <div className="pago-resultado-card">
        <h1>Página no encontrada</h1>
        <p>La página que buscás no existe o fue movida.</p>
        <div className="pago-resultado-btns">
          <Link href="/" className="btn-pago">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
