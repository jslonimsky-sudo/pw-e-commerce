'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="pago-resultado-page">
      <div className="pago-resultado-card">
        <div className="pago-resultado-x">✕</div>
        <h1>Algo salió mal</h1>
        <p>Ocurrió un error inesperado. Podés intentar de nuevo.</p>
        <div className="pago-resultado-btns">
          <button type="button" className="btn-pago" onClick={reset}>
            Reintentar
          </button>
        </div>
      </div>
    </div>
  );
}
