export default function PagoExitoso() {
  return (
    <div className="pago-resultado-page">
      <div className="pago-resultado-card">
        <div className="pago-resultado-check">✓</div>
        <h1>¡Pago aprobado!</h1>
        <p>Tu orden está siendo procesada.</p>
        <div className="pago-resultado-btns">
          <a href="/" className="btn-pago">Volver a la tienda</a>
          <a href="/mis-ordenes" className="btn-pago btn-pago-outline">Ver mis órdenes</a>
        </div>
      </div>
    </div>
  );
}
