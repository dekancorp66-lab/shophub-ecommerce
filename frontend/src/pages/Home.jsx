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
      <section className="home-hero">
        <div className="container home-hero-content">
          <span className="eyebrow">THE EVERYDAY EDIT · 2026</span>
          <h1>Everyday,<br />thoughtfully chosen.</h1>
          <p>Considered essentials for your wardrobe, your space, and everywhere in between.</p>
          <Link to="/products" className="editorial-button">Explore the collection <span aria-hidden="true">↗</span></Link>
        </div>
        <span className="hero-caption">A little more considered. A lot more you.</span>
      </section>

      <section className="container home-featured">
        <div className="section-heading">
          <div>
            <span className="eyebrow">A GOOD PLACE TO START</span>
            <h2>The everyday edit</h2>
          </div>
          <Link to="/products" className="text-link">Shop all products <span aria-hidden="true">↗</span></Link>
        </div>
        {loading ? <div className="loading">Finding your next favorite...</div> : featured.length ? (
          <div className="grid-products home-product-grid">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : <div className="empty-state"><h3>New favorites are on the way</h3><p>Explore the collection to see everything in store.</p></div>}
      </section>
    </>
  );
}
