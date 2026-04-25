'use client';

import { useState } from 'react';
import { formatPrice } from '../lib/formatPrice';

export default function CheckoutModal({ cart, isOpen, onClose, onSuccess }) {
  const [success, setSuccess] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = 'El nombre es requerido';
    if (!email.trim()) errs.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email inválido';
    return errs;
  }

  function handleConfirm(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSuccess();
    setSuccess(true);
  }

  function handleClose() {
    setSuccess(false);
    setName('');
    setEmail('');
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
          <button className="close-btn" onClick={handleClose} aria-label="Cerrar checkout">✕</button>
        </div>

        {!success ? (
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
                />
                <span className="form-error">{errors.email}</span>
              </div>
              <button className="confirm-btn" type="submit">CONFIRMAR COMPRA</button>
            </form>
          </div>
        ) : (
          <div className="checkout-success visible">
            <div className="success-icon" aria-hidden="true">✓</div>
            <h3>¡Compra realizada con éxito!</h3>
            <p>Gracias por tu compra. Recibirás un email con los detalles.</p>
            <button className="confirm-btn" onClick={handleClose}>VOLVER A LA TIENDA</button>
          </div>
        )}
      </div>
    </div>
  );
}
