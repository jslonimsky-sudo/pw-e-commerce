'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatPrice } from '../lib/formatPrice';
import { useUser } from '../context/UserContext';
import CheckoutModal from './CheckoutModal';

export default function CartPanel({ cart, isOpen, onClose, onChangeQty }) {
  const { user } = useUser();
  const router = useRouter();
  const [showCheckout, setShowCheckout] = useState(false);

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function handleCheckoutClick() {
    if (!user) {
      router.push('/login');
      return;
    }
    setShowCheckout(true);
  }

  function clearCart() {
    cart.forEach(item => onChangeQty(item.id, -item.quantity));
  }

  return (
    <>
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
                    <button
                      className="qty-btn"
                      onClick={() => onChangeQty(item.id, 1)}
                      aria-label="Agregar uno"
                      disabled={item.quantity >= item.stock}
                    >+</button>
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
              <button className="checkout-btn" onClick={handleCheckoutClick}>
                FINALIZAR COMPRA
              </button>
            </div>
          )}
        </div>
      </div>

      <CheckoutModal
        cart={cart}
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={() => { setShowCheckout(false); clearCart(); onClose(); }}
      />
    </>
  );
}
