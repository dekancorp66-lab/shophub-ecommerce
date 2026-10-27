import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../api/client';
import ProductCard from '../components/ProductCard';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ items: [], total: 0, pages: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('shophub-recently-viewed') || '[]');
    } catch {
      return [];
    }
  });

  const page = Number(searchParams.get('page') || 1);
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const [searchTerm, setSearchTerm] = useState(q);

  useEffect(() => setSearchTerm(q), [q]);

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
    <>
      <section className="catalog-hero">
        <div className="catalog-hero-copy">
          <span className="eyebrow">SHOPHUB · CURATED FOR EVERY DAY</span>
          <h1>Find your<br />new favorite.</h1>
          <p>Good things, chosen with care.</p>
        </div>
      </section>
      <div className="container catalog-container">
        <div className="catalog-topline">
          <div>
            <span className="eyebrow">THE COLLECTION</span>
            <h2>Shop all</h2>
          </div>
          <span className="catalog-count">{data.total} {data.total === 1 ? 'piece' : 'pieces'}</span>
        </div>
        <div className="catalog-layout">
          <aside className="catalog-sidebar" aria-label="Product filters">
            <form className="catalog-search" onSubmit={(event) => { event.preventDefault(); update('q', searchTerm.trim()); }}>
              <label htmlFor="catalog-search">Search the collection</label>
              <div className="search-control">
                <input id="catalog-search" type="search" placeholder="Try ‘headphones’" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
                <button type="submit" aria-label="Search products">↗</button>
              </div>
            </form>
            <div className="filter-section">
              <h3>Categories</h3>
              <button className={`category-filter ${!category ? 'is-active' : ''}`} onClick={() => update('category', '')}>All products</button>
              {categories.map((item) => (
                <button key={item.id} className={`category-filter ${category === item.slug ? 'is-active' : ''}`} onClick={() => update('category', item.slug)}>{item.name}</button>
              ))}
            </div>
            {(q || category) && <button className="clear-filters" onClick={() => { setSearchTerm(''); setSearchParams({}); }}>Clear all filters <span aria-hidden="true">×</span></button>}
          </aside>
          <section className="catalog-results" aria-label="Products">
            <div className="catalog-toolbar">
              <span>{q ? `Results for “${q}”` : category ? categories.find((item) => item.slug === category)?.name : 'Thoughtful finds for every day'}</span>
              <label className="sort-control">Sort by
                <select value={sort} onChange={(event) => update('sort', event.target.value)}>
                  <option value="newest">Featured</option>
                  <option value="price_asc">Price: low to high</option>
                  <option value="price_desc">Price: high to low</option>
                  <option value="name_asc">Name: A to Z</option>
                </select>
              </label>
            </div>
            {loading ? <div className="loading">Loading the collection...</div> : data.items.length === 0 ? (
              <div className="empty-state"><h3>No products found</h3><p>Try another search or browse all categories.</p></div>
            ) : (
              <>
                <div className="grid-products catalog-product-grid">
                  {data.items.map((product) => <ProductCard key={product.id} product={product} />)}
                </div>
                {data.pages > 1 && (
                  <nav className="catalog-pagination" aria-label="Product pages">
                    <button className="page-button" disabled={page <= 1} onClick={() => update('page', String(page - 1))}>← <span>Previous</span></button>
                    <span>Page {page} of {data.pages}</span>
                    <button className="page-button" disabled={page >= data.pages} onClick={() => update('page', String(page + 1))}><span>Next</span> →</button>
                  </nav>
                )}
              </>
            )}
          </section>
        </div>
      </div>
      {recentlyViewed.length > 0 && (
        <section className="recently-viewed">
          <div className="container">
            <div className="section-heading">
              <div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Recently viewed</h2></div>
            </div>
            <div className="grid-products recent-product-grid">
              {recentlyViewed.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
