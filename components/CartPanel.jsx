'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '../lib/formatPrice';
import { useUser } from '../context/UserContext';
import { createOrder } from '../lib/api/orders';

export default function CartPanel({ cart, isOpen, onClose, onChangeQty, onCheckout }) {
  const { user } = useUser();
  const router = useRouter();
  const [ordering, setOrdering] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  async function handleCheckout() {
    if (!user) {
      router.push('/login');
      return;
    }

    setOrdering(true);
    setOrderError(null);

    const items = cart.map(item => ({
      product_id: item.id,
      quantity: item.quantity,
      price: item.price,
    }));

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const { error } = await createOrder({ userId: user.id, items, total });

    setOrdering(false);

    if (error) {
      setOrderError('Hubo un error al procesar tu orden. Intentá de nuevo.');
      return;
    }

    setOrderSuccess(true);
    setTimeout(() => {
      cart.forEach(item => onChangeQty(item.id, -item.quantity));
      setOrderSuccess(false);
      onClose();
    }, 2000);
  }

  return (
    <div
      className={`cart-overlay${isOpen ? ' active' : ''}`}
      role="presentation"
      aria-hidden={!isOpen}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="cart-panel" role="dialog" aria-modal="true" aria-label="Carrito de compras">
        <div className="cart-panel-header">
          <h2 className="cart-panel-title">CARRITO</h2>
          <button className="close-btn" onClick={onClose} aria-label="Cerrar carrito">✕</button>
        </div>
        <div className="cart-body">
          {cart.length === 0 ? (
            <p className="cart-empty">Tu carrito está vacío.</p>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <img src={item.image_url || '/img/negra.jpg'} alt={item.name} />
                <div className="cart-item-info">
                  <p className="cart-item-name">{item.name}</p>
                  <p className="cart-item-price">{formatPrice(item.price)} c/u</p>
                </div>
                <div className="cart-item-controls">
                  <button className="qty-btn" onClick={() => onChangeQty(item.id, -1)} aria-label="Quitar uno">−</button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => onChangeQty(item.id, 1)} aria-label="Agregar uno">+</button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total">
              <span className="cart-total-label">Total</span>
              <span className="cart-total-amount">{formatPrice(totalPrice)}</span>
            </div>
            {orderSuccess ? (
              <div className="order-success">✓ ¡Orden creada exitosamente!</div>
            ) : (
              <button
                className="checkout-btn"
                onClick={handleCheckout}
                disabled={ordering}
              >
                {ordering ? 'Procesando...' : 'FINALIZAR COMPRA'}
              </button>
            )}
            {orderError && <div className="order-error">{orderError}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
