export default function PagoExitoso() {
  return (
    <div className="pago-resultado">
      <div className="pago-resultado-icon pago-exitoso-icon">✓</div>
      <h1>¡Pago aprobado!</h1>
      <p>Tu orden está siendo procesada.</p>
      <div className="pago-resultado-links">
        <a href="/" className="btn-pago-resultado">Volver a la tienda</a>
        <a href="/mis-ordenes" className="btn-pago-resultado btn-pago-secundario">Ver mis órdenes</a>
      </div>
    </div>
  );
}
