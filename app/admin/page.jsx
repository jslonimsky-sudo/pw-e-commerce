'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase.js';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../../lib/api/products.js';
import { updateOrderStatus } from '../../lib/api/orders.js';

const EMPTY_FORM = { name: '', price: '', stock: '', category: '', description: '', image_url: '' };

export default function AdminPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [activeTab, setActiveTab] = useState('productos');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const [orderToast, setOrderToast] = useState(null);
  const toastTimerRef = useRef(null);

  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();
      if (profileError || !profile?.is_admin) {
        router.push('/');
        return;
      }
      setChecking(false);
      await loadData();
    }
    init();
  }, [router]);

  async function loadData() {
    setLoading(true);
    try {
      const [productsData, { data: ordersData }] = await Promise.all([
        getAllProducts(),
        supabase
          .from('orders')
          .select('*, order_items(*)')
          .order('created_at', { ascending: false }),
      ]);
      setProducts(productsData);
      setOrders(ordersData || []);
    } catch (err) {
      setError('Error al cargar los datos.');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    const { error: err } = await createProduct({
      name: createForm.name,
      price: Number(createForm.price),
      stock: Number(createForm.stock),
      category: createForm.category,
      description: createForm.description,
      image_url: createForm.image_url,
    });
    setCreateLoading(false);
    if (err) {
      setCreateError('Error al crear el producto.');
      return;
    }
    setShowCreateForm(false);
    setCreateForm(EMPTY_FORM);
    showFeedback('success', 'Producto creado exitosamente.');
    await loadData();
  }

  function startEdit(product) {
    setEditingId(product.id);
    setEditForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
    });
  }

  async function handleSave(id) {
    setEditLoading(true);
    const { error: err } = await updateProduct(id, {
      name: editForm.name,
      price: Number(editForm.price),
      stock: Number(editForm.stock),
      category: editForm.category,
    });
    setEditLoading(false);
    if (err) {
      showFeedback('error', 'Error al guardar los cambios.');
      return;
    }
    setEditingId(null);
    showFeedback('success', 'Producto actualizado.');
    await loadData();
  }

  async function handleDelete(id, name) {
    if (!window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)) return;
    const { error: err } = await deleteProduct(id);
    if (err) {
      showFeedback('error', 'Error al eliminar el producto.');
      return;
    }
    showFeedback('success', 'Producto eliminado.');
    await loadData();
  }

  async function handleToggleActive(id, currentActive) {
    const { error: err } = await updateProduct(id, { active: !currentActive });
    if (err) {
      showFeedback('error', 'Error al cambiar el estado del producto.');
      return;
    }
    showFeedback('success', currentActive ? 'Producto desactivado.' : 'Producto activado.');
    await loadData();
  }

  async function handleStatusChange(orderId, newStatus) {
    const { error: err } = await updateOrderStatus(orderId, newStatus);
    if (err) {
      showToast(orderId, 'Error al actualizar el estado.');
      return;
    }
    setOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o)
    );
    showToast(orderId, 'Estado actualizado');
  }

  function showToast(id, message) {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setOrderToast({ id, message });
    toastTimerRef.current = setTimeout(() => setOrderToast(null), 2000);
  }

  function showFeedback(type, msg) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 3000);
  }

  if (checking) {
    return <div className="admin-loading">Verificando acceso...</div>;
  }

  return (
    <div className="admin-page">
      <a href="/" className="admin-back">← Volver a la tienda</a>
      <div className="admin-header">
        <h1>Panel de Administración</h1>
      </div>

      {feedback && (
        <div className={feedback.type === 'success' ? 'admin-feedback-success' : 'admin-feedback-error'}>
          {feedback.msg}
        </div>
      )}

      <div className="admin-tabs">
        <button
          className={activeTab === 'productos' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('productos')}
        >
          Productos ({products.length})
        </button>
        <button
          className={activeTab === 'ordenes' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('ordenes')}
        >
          Órdenes ({orders.length})
        </button>
      </div>

      {loading && <div className="admin-loading">Cargando datos...</div>}
      {error && <div className="admin-error">{error}</div>}

      {!loading && activeTab === 'productos' && (
        <div className="admin-section">
          <div className="admin-section-toolbar">
            <button
              className="admin-btn-primary"
              onClick={() => { setShowCreateForm(v => !v); setCreateError(null); }}
            >
              {showCreateForm ? 'Cancelar' : '+ Nuevo Producto'}
            </button>
          </div>

          {showCreateForm && (
            <form className="admin-create-form" onSubmit={handleCreate}>
              <h3 className="admin-form-title">Nuevo Producto</h3>
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label>Nombre</label>
                  <input
                    required
                    value={createForm.name}
                    onChange={e => setCreateForm(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Precio</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={createForm.price}
                    onChange={e => setCreateForm(f => ({ ...f, price: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Stock</label>
                  <input
                    required
                    type="number"
                    min="0"
                    value={createForm.stock}
                    onChange={e => setCreateForm(f => ({ ...f, stock: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group">
                  <label>Categoría</label>
                  <input
                    required
                    value={createForm.category}
                    onChange={e => setCreateForm(f => ({ ...f, category: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group admin-form-group--full">
                  <label>Descripción</label>
                  <input
                    value={createForm.description}
                    onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                  />
                </div>
                <div className="admin-form-group admin-form-group--full">
                  <label>URL Imagen</label>
                  <input
                    value={createForm.image_url}
                    onChange={e => setCreateForm(f => ({ ...f, image_url: e.target.value }))}
                  />
                </div>
              </div>
              {createError && <div className="admin-feedback-error">{createError}</div>}
              <div className="admin-form-actions">
                <button type="submit" className="admin-btn-primary" disabled={createLoading}>
                  {createLoading ? 'Creando...' : 'Crear Producto'}
                </button>
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => { setShowCreateForm(false); setCreateForm(EMPTY_FORM); }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Categoría</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.image_url || '/img/negra.jpg'}
                      alt={product.name}
                      className="admin-product-img"
                    />
                  </td>
                  {editingId === product.id ? (
                    <>
                      <td>
                        <input
                          className="admin-inline-input"
                          value={editForm.name}
                          onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                        />
                      </td>
                      <td>
                        <input
                          className="admin-inline-input"
                          type="number"
                          min="0"
                          value={editForm.price}
                          onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                        />
                      </td>
                      <td>
                        <input
                          className="admin-inline-input"
                          type="number"
                          min="0"
                          value={editForm.stock}
                          onChange={e => setEditForm(f => ({ ...f, stock: e.target.value }))}
                        />
                      </td>
                      <td>
                        <input
                          className="admin-inline-input"
                          value={editForm.category}
                          onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))}
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{product.name}</td>
                      <td>$ {product.price.toLocaleString('es-AR')}</td>
                      <td>{product.stock}</td>
                      <td>{product.category}</td>
                    </>
                  )}
                  <td>
                    <div className="admin-active-cell">
                      <span className={product.active !== false ? 'admin-badge-active' : 'admin-badge-inactive'}>
                        {product.active !== false ? 'Activo' : 'Inactivo'}
                      </span>
                      <button
                        className={product.active !== false ? 'admin-btn-deactivate' : 'admin-btn-activate'}
                        onClick={() => handleToggleActive(product.id, product.active !== false)}
                      >
                        {product.active !== false ? 'Desactivar' : 'Activar'}
                      </button>
                    </div>
                  </td>
                  <td>
                    {editingId === product.id ? (
                      <div className="admin-action-btns">
                        <button
                          className="admin-btn-save"
                          onClick={() => handleSave(product.id)}
                          disabled={editLoading}
                        >
                          {editLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button
                          className="admin-btn-cancel"
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="admin-action-btns">
                        <button
                          className="admin-btn-edit"
                          onClick={() => startEdit(product)}
                        >
                          Editar
                        </button>
                        <button
                          className="admin-btn-delete"
                          onClick={() => handleDelete(product.id, product.name)}
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {!loading && activeTab === 'ordenes' && (
        <div className="admin-section">
          {orders.length === 0 ? (
            <p className="admin-empty">No hay órdenes registradas.</p>
          ) : (
            <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID Orden</th>
                  <th>Usuario</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Items</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td className="admin-order-id">{order.id.slice(0, 8)}...</td>
                    <td>{order.user_id.slice(0, 8)}...</td>
                    <td>$ {order.total.toLocaleString('es-AR')}</td>
                    <td>
                      <div className="admin-status-cell">
                        <select
                          className="admin-status-select"
                          value={order.status}
                          onChange={e => handleStatusChange(order.id, e.target.value)}
                        >
                          <option value="pending">Pendiente</option>
                          <option value="approved">Aprobada</option>
                          <option value="failed">Fallida</option>
                          <option value="cancelled">Cancelada</option>
                        </select>
                        {orderToast?.id === order.id && (
                          <span className="admin-status-toast">{orderToast.message}</span>
                        )}
                      </div>
                    </td>
                    <td>{new Date(order.created_at).toLocaleDateString('es-AR')}</td>
                    <td>{order.order_items?.length || 0} items</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
