import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { cart, updateQuantity, removeItem, loading } = useCart();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="empty-state">
        <h3>Please log in</h3>
        <p>Sign in to view and manage your cart.</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: '1rem' }}>Login</Link>
      </div>
    );
  }

  if (loading) return <div className="loading">Loading cart...</div>;

  if (!cart.items?.length) {
    return (
      <div className="empty-state">
        <h3>Your cart is empty</h3>
        <p>Browse our catalog and add some products.</p>
        <Link to="/products" className="btn btn-primary" style={{ marginTop: '1rem' }}>Shop Now</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>Shopping Cart</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
        <div>
          {cart.items.map((item) => (
            <div key={item.id} className="card" style={{ display: 'flex', gap: '1rem', padding: '1rem', marginBottom: '1rem' }}>
              <img src={item.product.image_url || 'https://via.placeholder.com/100'} alt="" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} />
              <div style={{ flex: 1 }}>
                <Link to={`/products/${item.product.slug}`} style={{ fontWeight: 600 }}>{item.product.name}</Link>
                <p className="price" style={{ margin: '0.3rem 0' }}>${Number(item.product.price).toFixed(2)}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 6 }}>
                    <button className="btn btn-sm" style={{ border: 'none', background: 'transparent' }} onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}>−</button>
                    <span style={{ padding: '0 0.5rem' }}>{item.quantity}</span>
                    <button className="btn btn-sm" style={{ border: 'none', background: 'transparent' }} onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={() => removeItem(item.id)}>Remove</button>
                </div>
              </div>
              <div style={{ fontWeight: 700 }}>${Number(item.line_total).toFixed(2)}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: '1.5rem', height: 'fit-content', position: 'sticky', top: 80 }}>
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Subtotal</span>
            <span>${Number(cart.subtotal).toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '1rem 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
            <span>Total</span>
            <span className="price">${Number(cart.subtotal).toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn btn-primary" style={{ width: '100%' }}>Proceed to Checkout</Link>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.75rem', textAlign: 'center' }}>
            Cash on Delivery — demonstration only
          </p>
        </div>
      </div>
    </div>
  );
}
