import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, pages: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const page = Number(searchParams.get('page') || 1);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';

  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProducts({ page, page_size: 12, q: q || undefined, category: category || undefined, sort })
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, q, category, sort]);

  const update = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="container" style={{ padding: '2rem 0' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '1.5rem' }}>All Products</h1>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <input
          type="search"
          placeholder="Search products..."
          defaultValue={q}
          onKeyDown={(e) => e.key === 'Enter' && update('q', e.target.value)}
          style={{ padding: '0.6rem 1rem', borderRadius: 8, border: '1px solid var(--color-border)', minWidth: 200 }}
        />
        <select value={category} onChange={(e) => update('category', e.target.value)} style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid var(--color-border)' }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => update('sort', e.target.value)} style={{ padding: '0.6rem', borderRadius: 8, border: '1px solid var(--color-border)' }}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name A–Z</option>
        </select>
      </div>

      {loading ? <div className="loading">Loading...</div> : data.items.length === 0 ? (
        <div className="empty-state">
          <h3>No products found</h3>
          <p>Try adjusting your search or filters.</p>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>{data.total} products</p>
          <div className="grid-products">
            {data.items.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
          {data.pages > 1 && (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
              <button className="btn btn-sm btn-outline" disabled={page <= 1} onClick={() => update('page', String(page - 1))}>Previous</button>
              <span style={{ padding: '0.4rem 0.8rem' }}>Page {page} of {data.pages}</span>
              <button className="btn btn-sm btn-outline" disabled={page >= data.pages} onClick={() => update('page', String(page + 1))}>Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
