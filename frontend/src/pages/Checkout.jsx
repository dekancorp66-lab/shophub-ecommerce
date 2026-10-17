import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { checkout } from '../api/client';

export default function Checkout() {
  const { cart, refreshCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    contact_email: user?.email || '',
    contact_phone: user?.phone || '',
    shipping_full_name: user?.full_name || '',
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: 'United States',
    notes: '',
  });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  if (!cart.items?.length) {
    return (
      <div className="empty-state">
        <h3>Cart is empty</h3>
        <Link to="/products" className="btn btn-primary">Shop</Link>
      </div>
    );
  }

  const handle = async (e) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      const order = await checkout(form);
      await refreshCart();
      navigate(`/orders/${order.id}`);
    } catch (ex) {
      setErr(ex.response?.data?.detail || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const tax = (Number(cart.subtotal) * 0.08).toFixed(2);
  const total = (Number(cart.subtotal) + Number(tax)).toFixed(2);

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>Checkout</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        <strong>Cash on Delivery</strong> — This is a demonstration. No real payment is processed.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        <form onSubmit={handle} className="card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Contact & Shipping</h3>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Full name</label>
            <input value={form.shipping_full_name} onChange={(e) => setForm({ ...form, shipping_full_name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input value={form.shipping_address_line1} onChange={(e) => setForm({ ...form, shipping_address_line1: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Apartment, suite, etc. (optional)</label>
            <input value={form.shipping_address_line2} onChange={(e) => setForm({ ...form, shipping_address_line2: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div className="form-group">
              <label>City</label>
              <input value={form.shipping_city} onChange={(e) => setForm({ ...form, shipping_city: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>State</label>
              <input value={form.shipping_state} onChange={(e) => setForm({ ...form, shipping_state: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Postal code</label>
              <input value={form.shipping_postal_code} onChange={(e) => setForm({ ...form, shipping_postal_code: e.target.value })} required />
            </div>
          </div>
          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          </div>
          {err && <p className="error-msg" style={{ marginBottom: '1rem' }}>{String(err)}</p>}
          <button className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Placing order...' : 'Place Order (COD)'}
          </button>
        </form>
        <div className="card" style={{ padding: '1.5rem', height: 'fit-content' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>Summary</h3>
          {cart.items.map((i) => (
            <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: 6 }}>
              <span>{i.product.name} × {i.quantity}</span>
              <span>${Number(i.line_total).toFixed(2)}</span>
            </div>
          ))}
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Subtotal</span><span>${Number(cart.subtotal).toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Tax (8%)</span><span>${tax}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}><span>Shipping</span><span>Free</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginTop: 8 }}>
            <span>Total</span><span className="price">${total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
