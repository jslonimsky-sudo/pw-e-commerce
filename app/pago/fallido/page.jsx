export default function PagoFallido() {
  return (
    <div className="pago-resultado-page">
      <div className="pago-resultado-card">
        <div className="pago-resultado-x">✕</div>
        <h1>Pago rechazado</h1>
        <p>El pago no pudo procesarse. Podés intentarlo de nuevo.</p>
        <div className="pago-resultado-btns">
          <a href="/" className="btn-pago">Volver a la tienda</a>
        </div>
      </div>
    </div>
  );
}
