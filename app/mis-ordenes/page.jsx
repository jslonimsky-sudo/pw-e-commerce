'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase.js';

export default function MisOrdenesPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      try {
        const res = await fetch('/api/orders', {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.status === 401) {
          router.push('/login');
          return;
        }
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError('No se pudieron cargar las órdenes. Intentá de nuevo más tarde.');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [router]);

  if (loading && orders.length === 0 && !error) {
    return <div className="mis-ordenes-loading">Verificando acceso...</div>;
  }

  return (
    <div className="mis-ordenes-page">
      <a href="/" className="mis-ordenes-back">← Volver al inicio</a>
      <div className="mis-ordenes-header">
        <h1>Mis Órdenes</h1>
        <p>Historial de tus compras</p>
      </div>

      {loading && <div className="mis-ordenes-loading">Cargando órdenes...</div>}
      {error && <div className="mis-ordenes-error">{error}</div>}

      {!loading && orders.length === 0 && (
        <div className="mis-ordenes-empty">
          <p>Todavía no realizaste ninguna compra.</p>
          <a href="/" className="btn-ver-catalogo">Ver catálogo</a>
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div className="ordenes-lista">
          {orders.map(order => (
            <div key={order.id} className="orden-card">
              <div className="orden-card-header">
                <div className="orden-info">
                  <span className="orden-id">Orden #{order.id.slice(0, 8).toUpperCase()}</span>
                  <span className="orden-fecha">
                    {new Date(order.created_at).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="orden-meta">
                  <span className={`orden-status status-${order.status}`}>
                    {order.status === 'pending' && 'Pendiente'}
                    {order.status === 'approved' && 'Aprobada'}
                    {order.status === 'rejected' && 'Rechazada'}
                    {order.status === 'failed' && 'Fallida'}
                  </span>
                  <span className="orden-total">
                    $ {Number(order.total).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {order.order_items && order.order_items.length > 0 && (
                <div className="orden-items">
                  {order.order_items.map(item => (
                    <div key={item.id} className="orden-item">
                      <span className="orden-item-qty">x{item.quantity}</span>
                      <span className="orden-item-price">
                        $ {Number(item.price).toLocaleString('es-AR')} c/u
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
