import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct, getRelated } from '../api/client';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    getProduct(slug)
      .then((p) => {
        setProduct(p);
        return getRelated(p.id);
      })
      .then(setRelated)
      .catch(() => setErr('Product not found'))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAdd = async () => {
    setMsg(''); setErr('');
    if (!user) { setErr('Please log in to add items to your cart.'); return; }
    try {
      await addToCart(product.id, qty);
      setMsg('Added to cart!');
    } catch (e) {
      setErr(e.response?.data?.detail || e.message || 'Failed to add');
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (err && !product) return <div className="empty-state"><h3>{err}</h3><Link to="/products">Back to shop</Link></div>;
  if (!product) return null;

  const img = product.image_url || 'https://via.placeholder.com/600';

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.5rem' }}>
        <div style={{ borderRadius: 'var(--radius)', overflow: 'hidden', background: '#f1f5f9' }}>
          <img src={img} alt={product.name} style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
        </div>
        <div>
          {product.category && <Link to={`/products?category=${product.category.slug}`} style={{ color: 'var(--color-primary)', fontSize: '0.85rem', fontWeight: 600 }}>{product.category.name}</Link>}
          <h1 style={{ fontSize: '1.9rem', fontWeight: 700, margin: '0.4rem 0 1rem' }}>{product.name}</h1>
          <div style={{ marginBottom: '1rem' }}>
            <span className="price" style={{ fontSize: '1.5rem' }}>${Number(product.price).toFixed(2)}</span>
            {product.compare_at_price && <span className="price-compare">${Number(product.compare_at_price).toFixed(2)}</span>}
          </div>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>{product.description}</p>
          <p style={{ marginBottom: '1rem' }}>
            {product.stock > 0 ? <span className="badge badge-success">In stock ({product.stock})</span> : <span className="badge badge-muted">Out of stock</span>}
          </p>
          {product.stock > 0 && (
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                <button className="btn btn-sm" style={{ border: 'none', background: 'transparent' }} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span style={{ padding: '0 0.75rem', minWidth: 32, textAlign: 'center' }}>{qty}</span>
                <button className="btn btn-sm" style={{ border: 'none', background: 'transparent' }} onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
              </div>
              <button className="btn btn-primary" onClick={handleAdd}>Add to Cart</button>
            </div>
          )}
          {msg && <p style={{ color: 'var(--color-success)', marginTop: '0.75rem' }}>{msg}</p>}
          {err && <p className="error-msg">{err}</p>}
        </div>
      </div>
      {related.length > 0 && (
        <section style={{ marginTop: '3rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '1rem' }}>Related Products</h2>
          <div className="grid-products">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
