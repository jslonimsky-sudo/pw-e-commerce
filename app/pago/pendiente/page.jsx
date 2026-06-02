export default function PagoPendiente() {
  return (
    <div className="pago-resultado">
      <div className="pago-resultado-icon pago-pendiente-icon">⏳</div>
      <h1>Tu pago está pendiente de confirmación.</h1>
      <p>Te avisaremos cuando se acredite.</p>
      <div className="pago-resultado-links">
        <a href="/mis-ordenes" className="btn-pago-resultado">Ver mis órdenes</a>
      </div>
    </div>
  );
}
