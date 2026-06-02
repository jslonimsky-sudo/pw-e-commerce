export default function PagoFallido() {
  return (
    <div className="pago-resultado">
      <div className="pago-resultado-icon pago-fallido-icon">✕</div>
      <h1>El pago no pudo procesarse.</h1>
      <p>Podés intentarlo de nuevo.</p>
      <div className="pago-resultado-links">
        <a href="/" className="btn-pago-resultado">Volver a la tienda</a>
      </div>
    </div>
  );
}
