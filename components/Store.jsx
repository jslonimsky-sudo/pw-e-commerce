'use client';

import { useState, useEffect } from 'react';
import Header from './Header';
import Hero from './Hero';
import ProductsSection from './ProductsSection';
import CartPanel from './CartPanel';
import CheckoutModal from './CheckoutModal';
import ProductModal from './ProductModal';
import Footer from './Footer';

export default function Store() {
  const [page, setPage] = useState('home');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    async function loadProducts() {
      const res = await fetch('/products.json');
      const data = await res.json();
      setProducts(data);
    }
    loadProducts();
  }, []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    document.title = totalItems > 0
      ? `(${totalItems}) JS Studios — Colección 2026`
      : 'JS Studios — Colección 2026';
  }, [totalItems]);

  function navigate(target) {
    setPage(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing) {
        return prev.map(item =>
          item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
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
        .map(item => item.id === productId ? { ...item, quantity: item.quantity + delta } : item)
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
        {page === 'home' && (
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

        {page === 'coleccion' && (
          <div id="page-coleccion">
            <ProductsSection
              id="coleccion"
              title="COLECCIÓN"
              count={`${products.length} MODELOS`}
              products={products}
              onAddToCart={addToCart}
              onProductClick={openProduct}
            />
          </div>
        )}
      </main>

      <Footer onNavigate={navigate} />

      <CartPanel
        cart={cart}
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        onChangeQty={changeQty}
        onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }}
      />

      <CheckoutModal
        cart={cart}
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => setCart([])}
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
