import { useEffect, useState } from 'react';
import { Routes, Route, Link, NavLink } from 'react-router-dom';
import {
  adminGetProducts, adminCreateProduct, adminUpdateProduct, adminDeleteProduct,
  adminGetOrders, adminUpdateOrderStatus, adminGetCategories, adminCreateCategory
} from '../api/client';

function AdminProducts() {
  const [data, setData] = useState({ items: [], total: 0 });
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', price: '', stock: 0, category_id: '', is_featured: false, image_url: '' });
  const [msg, setMsg] = useState('');

  const load = () => adminGetProducts({ page_size: 50 }).then(setData);
  useEffect(() => { load(); adminGetCategories().then(setCategories); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await adminCreateProduct({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        category_id: form.category_id ? Number(form.category_id) : null,
      });
      setShowForm(false);
      setForm({ name: '', description: '', price: '', stock: 0, category_id: '', is_featured: false, image_url: '' });
      setMsg('Product created');
      load();
    } catch (ex) {
      setMsg(ex.response?.data?.detail || 'Failed');
    }
  };

  const deactivate = async (id) => {
    if (!confirm('Deactivate this product?')) return;
    await adminDeleteProduct(id);
    load();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontWeight: 700 }}>Products ({data.total})</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add Product'}</button>
      </div>
      {msg && <p style={{ marginBottom: '0.75rem', color: 'var(--color-primary)' }}>{msg}</p>}
      {showForm && (
        <form onSubmit={create} className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
          <div className="form-group"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={3} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group"><label>Price</label><input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></div>
            <div className="form-group"><label>Stock</label><input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required /></div>
            <div className="form-group"><label>Category</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group"><label>Image URL</label><input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
            <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} /> Featured
          </label>
          <button className="btn btn-primary">Create Product</button>
        </form>
      )}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--color-border)', textAlign: 'left' }}>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Price</th>
              <th style={{ padding: 8 }}>Stock</th>
              <th style={{ padding: 8 }}>Category</th>
              <th style={{ padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((p) => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: 8 }}>{p.name}</td>
                <td style={{ padding: 8 }}>${Number(p.price).toFixed(2)}</td>
                <td style={{ padding: 8 }}>{p.stock}</td>
                <td style={{ padding: 8 }}>{p.category_name || '—'}</td>
                <td style={{ padding: 8 }}>
                  <button className="btn btn-sm btn-danger" onClick={() => deactivate(p.id)}>Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AdminOrders() {
  const [data, setData] = useState({ items: [], total: 0 });
  const load = () => adminGetOrders({ page_size: 50 }).then(setData);
  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    await adminUpdateOrderStatus(id, status);
    load();
  };

  return (
    <div>
      <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Orders ({data.total})</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {data.items.map((o) => (
          <div key={o.id} className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <strong>{o.order_number}</strong>
                <span style={{ marginLeft: 8, color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>{new Date(o.created_at).toLocaleString()}</span>
                <div style={{ fontSize: '0.9rem' }}>{o.contact_email} · ${Number(o.total).toFixed(2)}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} style={{ padding: '0.4rem', borderRadius: 6, border: '1px solid var(--color-border)' }}>
                  {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Admin() {
  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1rem' }}>Admin Dashboard</h1>
      <nav style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <NavLink to="/admin" end style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400, color: isActive ? 'var(--color-primary)' : 'inherit' })}>Products</NavLink>
        <NavLink to="/admin/orders" style={({ isActive }) => ({ fontWeight: isActive ? 700 : 400, color: isActive ? 'var(--color-primary)' : 'inherit' })}>Orders</NavLink>
      </nav>
      <Routes>
        <Route index element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
      </Routes>
    </div>
  );
}
