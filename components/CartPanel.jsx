import { formatPrice } from '../lib/formatPrice';

export default function CartPanel({ cart, isOpen, onClose, onChangeQty, onCheckout }) {
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
                <img src={item.image} alt={item.name} />
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
            <button className="checkout-btn" onClick={onCheckout}>FINALIZAR COMPRA</button>
          </div>
        )}
      </div>
    </div>
  );
}
