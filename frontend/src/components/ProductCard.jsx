import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  const img = product.image_url || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=600&fit=crop';
  const rememberProduct = () => {
    try {
      const viewed = JSON.parse(localStorage.getItem('shophub-recently-viewed') || '[]');
      localStorage.setItem('shophub-recently-viewed', JSON.stringify([product, ...viewed.filter((item) => item.id !== product.id)].slice(0, 5)));
    } catch {
      localStorage.setItem('shophub-recently-viewed', JSON.stringify([product]));
    }
  };

  return (
    <Link to={`/products/${product.slug}`} className="product-card" onClick={rememberProduct}>
      <div className="product-image-wrap">
        <img src={img} alt={product.name} loading="lazy" />
        {product.compare_at_price && <span className="product-tag">Special price</span>}
      </div>
      <div className="product-card-copy">
        {product.category_name && <span className="product-category">{product.category_name}</span>}
        <h3>{product.name}</h3>
        <div className="product-pricing">
          <span className="price">${Number(product.price).toFixed(2)}</span>
          {product.compare_at_price && <span className="price-compare">${Number(product.compare_at_price).toFixed(2)}</span>}
        </div>
        {product.stock <= 0 && <span className="product-stock">Out of stock</span>}
        {product.stock > 0 && product.stock < 10 && <span className="product-stock">Only {product.stock} left</span>}
      </div>
    </Link>
  );
}
