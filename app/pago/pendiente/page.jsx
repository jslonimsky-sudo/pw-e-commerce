export default function PagoPendiente() {
  return (
    <div className="pago-resultado-page">
      <div className="pago-resultado-card">
        <div className="pago-resultado-clock">⏳</div>
        <h1>Pago pendiente</h1>
        <p>Tu pago está pendiente de confirmación. Te avisaremos cuando se acredite.</p>
        <div className="pago-resultado-btns">
          <a href="/mis-ordenes" className="btn-pago">Ver mis órdenes</a>
          <a href="/" className="btn-pago btn-pago-outline">Volver a la tienda</a>
        </div>
      </div>
    </div>
  );
}
