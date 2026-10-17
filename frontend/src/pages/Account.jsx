import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../api/client';

export default function Account() {
  const { user } = useAuth();
  const [orders, setOrders] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders({ page_size: 20 }).then(setOrders).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>My Account</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '2rem' }}>{user?.email}</p>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Profile</h3>
        <p><strong>Name:</strong> {user?.full_name}</p>
        <p><strong>Email:</strong> {user?.email}</p>
        {user?.phone && <p><strong>Phone:</strong> {user.phone}</p>}
      </div>

      <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem' }}>Order History</h2>
      {loading ? <div className="loading">Loading orders...</div> : orders.items.length === 0 ? (
        <div className="empty-state">
          <h3>No orders yet</h3>
          <Link to="/products" className="btn btn-primary">Start shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {orders.items.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="card" style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{o.order_number}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{new Date(o.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="price">${Number(o.total).toFixed(2)}</div>
                <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{o.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
