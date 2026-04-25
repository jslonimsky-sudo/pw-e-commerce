import { useEffect } from 'react';
import { formatPrice } from '../lib/formatPrice';

export default function ProductModal({ product, isOpen, onClose, onAddToCart }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!product) return null;

  return (
    <div
      className={`product-modal-overlay${isOpen ? ' active' : ''}`}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label={product.name}
    >
      <div className="product-modal" onClick={e => e.stopPropagation()}>
        <button className="product-modal-close close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
        <div className="product-modal-img-wrap">
          <img src={product.image} alt={`Gorra ${product.name}`} />
          {product.tag && <span className="card-tag">{product.tag}</span>}
        </div>
        <div className="product-modal-body">
          <p className="product-modal-name">{product.name}</p>
          <p className="product-modal-price">{formatPrice(product.price)}</p>
          <button
            className="add-btn product-modal-add"
            onClick={() => { onAddToCart(product.id); onClose(); }}
          >
            + AGREGAR AL CARRITO
          </button>
        </div>
      </div>
    </div>
  );
}
