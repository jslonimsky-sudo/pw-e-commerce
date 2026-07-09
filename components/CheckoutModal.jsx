'use client';

import { useState } from 'react';
import { formatPrice } from '../lib/formatPrice';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase.js';

export default function CheckoutModal({ cart, isOpen, onClose, onSuccess }) {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const SHIPPING_COST = 2500;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalPrice = subtotal + SHIPPING_COST;

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = 'El nombre es requerido';
    if (!email.trim()) errs.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email inválido';
    if (!address.trim()) errs.address = 'La dirección es requerida';
    return errs;
  }

  async function handleConfirm() {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    if (!user) {
      alert('Debés iniciar sesión para comprar');
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          items: cart.map(item => ({ product_id: item.id, quantity: item.quantity, price: item.price })),
          total: totalPrice,
          shippingName: name,
          shippingEmail: email,
          shippingAddress: address,
        }),
      });

      if (orderResponse.status !== 201) {
        const errData = await orderResponse.json().catch(() => ({}));
        console.error('Error creando orden:', errData.error);
        alert('Error al crear la orden');
        setLoading(false);
        return;
      }

      const { order } = await orderResponse.json();

      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            ...cart.map(item => ({
              product_id: item.id,
              title: item.name,
              quantity: item.quantity,
              unit_price: Number(item.price),
            })),
            { title: 'Envío', quantity: 1, unit_price: SHIPPING_COST },
          ],
          userId: user.id,
          orderId: order.id,
        }),
      });

      const data = await response.json();

      if (response.status === 409 && data.error === 'stock_insuficiente') {
        const detalle = data.items
          .map(i => `${i.name}: pediste ${i.solicitado}, hay ${i.disponible} disponible${i.disponible === 1 ? '' : 's'}`)
          .join('\n');
        alert(`No hay stock suficiente para continuar:\n\n${detalle}\n\nAjustá la cantidad en el carrito e intentá de nuevo.`);
        setLoading(false);
        return;
      }

      const redirectUrl = data.sandbox_init_point || data.init_point;

      if (redirectUrl) {
        onSuccess();
        window.location.href = redirectUrl;
      } else {
        console.error('No hay URL de redirect en:', data);
        alert('Error al obtener link de pago: ' + JSON.stringify(data));
        setLoading(false);
      }
    } catch (err) {
      console.error('Error en checkout:', err);
      alert('Error: ' + err.message);
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setName('');
    setEmail('');
    setAddress('');
    setErrors({});
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
            <div className="checkout-total-row checkout-shipping-row">
              <span className="checkout-total-label">ENVÍO</span>
              <span className="checkout-total-amount">{formatPrice(SHIPPING_COST)}</span>
            </div>
            <div className="checkout-total-row">
              <span className="checkout-total-label">TOTAL</span>
              <span className="checkout-total-amount">{formatPrice(totalPrice)}</span>
            </div>
          </div>

          <div className="checkout-form">
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
            <div className="form-group">
              <label htmlFor="checkout-address">Dirección</label>
              <input
                id="checkout-address"
                type="text"
                placeholder="Av. Corrientes 1234, CABA"
                value={address}
                onChange={(e) => { setAddress(e.target.value); setErrors(prev => ({ ...prev, address: '' })); }}
                className={errors.address ? 'input-error' : ''}
                disabled={loading}
              />
              <span className="form-error">{errors.address}</span>
            </div>
            <button
              className="confirm-btn"
              type="button"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? 'PROCESANDO...' : 'CONFIRMAR COMPRA'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
