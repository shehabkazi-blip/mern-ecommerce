import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const keyword = searchParams.get('keyword') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = Number(searchParams.get('page')) || 1;

  useEffect(() => {
    api.get('/products/categories').then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = { page };
    if (keyword) params.keyword = keyword;
    if (category) params.category = category;
    if (sort) params.sort = sort;

    api
      .get('/products', { params })
      .then(({ data }) => {
        setProducts(data.products);
        setPages(data.pages);
      })
      .finally(() => setLoading(false));
  }, [keyword, category, sort, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold">Shop all products</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          placeholder="Search products…"
          defaultValue={keyword}
          onKeyDown={(e) => e.key === 'Enter' && updateParam('keyword', e.target.value)}
          className="input-field max-w-xs"
        />
        <select
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="input-field w-auto"
        >
          <option value="">Sort: newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="rating">Highest rated</option>
        </select>
      </div>

      {loading ? (
        <p className="mt-10 text-ink/50">Loading products…</p>
      ) : products.length === 0 ? (
        <p className="mt-10 text-ink/50">No products match your filters.</p>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-10 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    const next = new URLSearchParams(searchParams);
                    next.set('page', p);
                    setSearchParams(next);
                  }}
                  className={`h-9 w-9 rounded-full text-sm font-medium ${
                    p === page ? 'bg-moss-600 text-white' : 'bg-white text-ink/70 hover:bg-sand'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
