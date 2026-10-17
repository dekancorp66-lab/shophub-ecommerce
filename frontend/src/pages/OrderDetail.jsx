import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../api/client';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    getOrder(id).then(setOrder).catch(() => setErr('Order not found'));
  }, [id]);

  if (err) return <div className="empty-state"><h3>{err}</h3><Link to="/account">Back to account</Link></div>;
  if (!order) return <div className="loading">Loading...</div>;

  return (
    <div className="container" style={{ padding: '2rem 0', maxWidth: 720 }}>
      <Link to="/account" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>← Back to orders</Link>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '1rem 0 0.25rem' }}>Order {order.order_number}</h1>
      <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        Placed {new Date(order.created_at).toLocaleString()} · <span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{order.status}</span>
      </p>

      <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Items</h3>
        {order.items.map((i) => (
          <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid var(--color-border)' }}>
            <span>{i.product_name} × {i.quantity}</span>
            <span>${Number(i.line_total).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>${Number(order.subtotal).toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax</span><span>${Number(order.tax).toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><span>${Number(order.shipping_cost).toFixed(2)}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 8 }}><span>Total</span><span className="price">${Number(order.total).toFixed(2)}</span></div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Shipping Address</h3>
        <p>{order.shipping_full_name}</p>
        <p>{order.shipping_address_line1}</p>
        {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
        <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
        <p>{order.shipping_country}</p>
        <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Payment: {order.payment_method.replace(/_/g, ' ')} (demonstration)
        </p>
      </div>
    </div>
  );
}
