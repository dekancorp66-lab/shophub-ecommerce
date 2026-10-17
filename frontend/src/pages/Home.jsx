import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getFeatured } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeatured().then(setFeatured).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <>
      <section style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #134e4a 100%)',
        color: 'white', padding: '5rem 0', textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Discover Quality Products
          </h1>
          <p style={{ fontSize: '1.15rem', opacity: 0.9, maxWidth: 520, margin: '0 auto 2rem' }}>
            Curated selection of electronics, fashion, home essentials, and more. Free shipping on demonstration orders.
          </p>
          <Link to="/products" className="btn" style={{ background: 'white', color: 'var(--color-primary)', fontSize: '1.05rem', padding: '0.85rem 2rem' }}>
            Shop Now
          </Link>
        </div>
      </section>

      <section className="container" style={{ padding: '3.5rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 700 }}>Featured Products</h2>
          <Link to="/products" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>View all →</Link>
        </div>
        {loading ? <div className="loading">Loading products...</div> : (
          <div className="grid-products">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      <section style={{ background: 'white', padding: '3rem 0', borderTop: '1px solid var(--color-border)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🚚</div>
            <h3 style={{ fontWeight: 600, marginBottom: 4 }}>Free Shipping</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>On all demo orders</p>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>🔒</div>
            <h3 style={{ fontWeight: 600, marginBottom: 4 }}>Secure Checkout</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Cash on Delivery available</p>
          </div>
          <div>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>↩️</div>
            <h3 style={{ fontWeight: 600, marginBottom: 4 }}>Easy Returns</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>30-day return policy</p>
          </div>
        </div>
      </section>
    </>
  );
}
