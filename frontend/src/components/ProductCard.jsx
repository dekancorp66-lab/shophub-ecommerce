import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const img = product.image_url || 'https://via.placeholder.com/400x400?text=No+Image';
  return (
    <Link to={`/products/${product.slug}`} className="card" style={{ display: 'flex', flexDirection: 'column', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <div style={{ aspectRatio: '1', overflow: 'hidden', background: '#f1f5f9' }}>
        <img src={img} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
      </div>
      <div style={{ padding: '1rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {product.category_name && <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{product.category_name}</span>}
        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0.25rem 0', lineHeight: 1.3 }}>{product.name}</h3>
        <div style={{ marginTop: 'auto', paddingTop: '0.5rem' }}>
          <span className="price">${Number(product.price).toFixed(2)}</span>
          {product.compare_at_price && <span className="price-compare">${Number(product.compare_at_price).toFixed(2)}</span>}
        </div>
        {product.stock <= 0 && <span className="badge badge-muted" style={{ marginTop: 6 }}>Out of stock</span>}
        {product.stock > 0 && product.stock < 10 && <span className="badge badge-warning" style={{ marginTop: 6 }}>Only {product.stock} left</span>}
      </div>
    </Link>
  );
}
