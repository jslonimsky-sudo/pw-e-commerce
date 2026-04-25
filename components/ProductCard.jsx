import { formatPrice } from '../lib/formatPrice';

export default function ProductCard({ product, onAddToCart, onProductClick }) {
  return (
    <li>
      <article className="card" onClick={() => onProductClick(product.id)} style={{ cursor: 'pointer' }}>
        <div className="card-img-wrap">
          <img src={product.image} alt={`Gorra ${product.name}`} loading="lazy" />
          {product.tag && <span className="card-tag">{product.tag}</span>}
        </div>
        <div className="card-body">
          <div>
            <p className="card-name">{product.name}</p>
            <p className="card-price">{formatPrice(product.price)}</p>
          </div>
          <button
            className="add-btn"
            onClick={e => { e.stopPropagation(); onAddToCart(product.id); }}
            aria-label={`Agregar ${product.name} al carrito`}
          >
            + AGREGAR
          </button>
        </div>
      </article>
    </li>
  );
}
