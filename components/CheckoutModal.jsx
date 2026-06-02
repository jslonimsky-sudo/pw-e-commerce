'use client';

import { useState } from 'react';
import { formatPrice } from '../lib/formatPrice';
import { supabase } from '../lib/supabase';

export default function CheckoutModal({ cart, isOpen, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = 'El nombre es requerido';
    if (!email.trim()) errs.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email inválido';
    return errs;
  }

  async function handleConfirm(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    setApiError('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setApiError('Debés iniciar sesión para continuar.');
        setLoading(false);
        return;
      }

      const items = cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
        price: item.price,
      }));

      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, items, total: totalPrice }),
      });

      if (!orderRes.ok) {
        setApiError('Error al crear la orden. Intentá de nuevo.');
        setLoading(false);
        return;
      }

      const { order } = await orderRes.json();

      const mpItems = cart.map(item => ({
        title: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const prefRes = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: mpItems, userId: session.user.id, orderId: order.id }),
      });

      if (!prefRes.ok) {
        setApiError('Error al iniciar el pago. Intentá de nuevo.');
        setLoading(false);
        return;
      }

      const { init_point } = await prefRes.json();

      onSuccess();
      window.location.href = init_point;
    } catch {
      setApiError('Ocurrió un error inesperado. Intentá de nuevo.');
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setName('');
    setEmail('');
    setErrors({});
    setApiError('');
    onClose();
  }

  return (
    <div
      className={`checkout-overlay${isOpen ? ' active' : ''}`}
      role="presentation"
      aria-hidden={!isOpen}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="checkout-modal" role="dialog" aria-modal="true" aria-label="Finalizar compra">
        <div className="checkout-header">
          <h2 className="checkout-title">FINALIZAR COMPRA</h2>
          <button className="close-btn" onClick={handleClose} aria-label="Cerrar checkout" disabled={loading}>✕</button>
        </div>

        <div className="checkout-body">
          <div className="checkout-summary">
            <p className="checkout-section-title">RESUMEN DEL PEDIDO</p>
            <ul className="checkout-items">
              {cart.map(item => (
                <li key={item.id} className="checkout-item">
                  <span className="checkout-item-name">{item.name}</span>
                  <span className="checkout-item-qty">x{item.quantity}</span>
                  <span className="checkout-item-price">{formatPrice(item.price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="checkout-total-row">
              <span className="checkout-total-label">TOTAL</span>
              <span className="checkout-total-amount">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <form className="checkout-form" onSubmit={handleConfirm} noValidate>
            <p className="checkout-section-title">TUS DATOS</p>
            <div className="form-group">
              <label htmlFor="checkout-name">Nombre</label>
              <input
                id="checkout-name"
                type="text"
                placeholder="Juan García"
                value={name}
                onChange={(e) => { setName(e.target.value); setErrors(prev => ({ ...prev, name: '' })); }}
                className={errors.name ? 'input-error' : ''}
                disabled={loading}
              />
              <span className="form-error">{errors.name}</span>
            </div>
            <div className="form-group">
              <label htmlFor="checkout-email">Email</label>
              <input
                id="checkout-email"
                type="email"
                placeholder="juan@email.com"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                className={errors.email ? 'input-error' : ''}
                disabled={loading}
              />
              <span className="form-error">{errors.email}</span>
            </div>
            {apiError && <p className="form-error">{apiError}</p>}
            <button className="confirm-btn" type="submit" disabled={loading}>
              {loading ? 'PROCESANDO...' : 'CONFIRMAR COMPRA'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
