import ProductCard from './ProductCard';

export default function ProductsSection({ id, title, count, products, onAddToCart, onProductClick, showVerTodos, onVerTodos }) {
  return (
    <section className="products-section" id={id} aria-labelledby={`${id}-title`}>
      <div className="products-header">
        <h2 className="products-title" id={`${id}-title`}>{title}</h2>
        <span className="products-count">{count}</span>
      </div>
      <ul className="products-grid" role="list">
        {products.map(product => (
          <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} onProductClick={onProductClick} />
        ))}
      </ul>
      {showVerTodos && (
        <div className="ver-todos-wrap">
          <button className="ver-todos-btn" onClick={onVerTodos}>VER TODOS LOS PRODUCTOS</button>
        </div>
      )}
    </section>
  );
}
