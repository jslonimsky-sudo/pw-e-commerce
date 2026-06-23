'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import Hero from './Hero';
import ProductsSection from './ProductsSection';
import CartPanel from './CartPanel';
import ProductModal from './ProductModal';
import ProductCard from './ProductCard';
import Footer from './Footer';
import { getProducts } from '../lib/api/products.js';

export default function Store() {
  const [page, setPage] = useState('home');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch {
        setError('No se pudieron cargar los productos');
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'todas' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    document.title = totalItems > 0
      ? `(${totalItems}) JS Studios — Colección 2026`
      : 'JS Studios — Colección 2026';
  }, [totalItems]);

  function navigate(target, sectionId) {
    setPage(target);
    if (sectionId) {
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product || product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        const nextQty = Math.min(existing.quantity + 1, product.stock);
        return prev.map(item =>
          item.id === productId ? { ...item, quantity: nextQty } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function openProduct(productId) {
    const found = products.find(p => p.id === productId);
    if (found) setSelectedProduct(found);
  }

  function changeQty(productId, delta) {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id !== productId) return item;
          const product = products.find(p => p.id === productId);
          const maxQty = product ? product.stock : Infinity;
          return { ...item, quantity: Math.min(item.quantity + delta, maxQty) };
        })
        .filter(item => item.quantity > 0)
    );
  }

  return (
    <>
      <Header
        cartCount={totalItems}
        onCartOpen={() => setCartOpen(true)}
        onNavigate={navigate}
      />

      <main>
        {loading && <div className="loading">Cargando productos...</div>}
        {!loading && error && <div className="error">No se pudieron cargar los productos</div>}
        {!loading && !error && page === 'home' && (
          <div id="page-home">
            <Hero onNavigate={navigate} />
            <ProductsSection
              id="destacados"
              title="DESTACADOS"
              count="4 MODELOS"
              products={products.slice(0, 4)}
              onAddToCart={addToCart}
              onProductClick={openProduct}
              showVerTodos
              onVerTodos={() => navigate('coleccion')}
            />
            <section className="nosotros" id="nosotros" aria-labelledby="nosotros-title">
              <div className="nosotros-inner">
                <h2 id="nosotros-title">SOBRE NOSOTROS</h2>
                <p>Creamos piezas que combinan estética y precisión.<br />Cada gorra refleja una identidad.</p>
              </div>
            </section>
          </div>
        )}

        {!loading && !error && page === 'coleccion' && (
          <div id="page-coleccion">
            <section className="products-section" id="coleccion" aria-labelledby="coleccion-title">
              <div className="products-header">
                <h2 className="products-title" id="coleccion-title">COLECCIÓN</h2>
                <span className="products-count">{filteredProducts.length} MODELOS</span>
              </div>
              <div className="catalogo-filtros">
                <input
                  type="text"
                  className="filtro-search"
                  placeholder="Buscar gorras..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="filtro-categorias">
                  {['todas', 'clasicas', 'vintage', 'snapback', 'dad-hat', 'premium', 'trucker'].map(cat => (
                    <button
                      key={cat}
                      className={selectedCategory === cat ? 'filtro-btn active' : 'filtro-btn'}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat === 'todas' ? 'Todas' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              {filteredProducts.length === 0 && (
                <div className="catalogo-vacio">
                  No se encontraron productos para tu búsqueda.
                </div>
              )}
              {filteredProducts.length > 0 && (
                <ul className="products-grid" role="list">
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={addToCart}
                      onProductClick={openProduct}
                    />
                  ))}
                </ul>
              )}
            </section>
          </div>
        )}
      </main>

      <Footer onNavigate={navigate} />

      <CartPanel
        cart={cart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onChangeQty={changeQty}
      />

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
      />
    </>
  );
}
