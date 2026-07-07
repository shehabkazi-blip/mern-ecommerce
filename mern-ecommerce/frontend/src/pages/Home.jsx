import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/products', { params: { limit: 8 } });
        setFeatured(data.products);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <section className="border-b border-ink/8 bg-moss-900 text-canvas">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-20 sm:px-6 md:grid-cols-2 md:items-center md:py-28">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-moss-300">
              New season stock
            </p>
            <h1 className="font-display text-4xl leading-[1.05] sm:text-5xl">
              Goods built to be <em className="not-italic text-clay">used</em>, not just owned.
            </h1>
            <p className="mt-5 max-w-md text-moss-100/90">
              Fieldstock sources durable, well-designed essentials — from the kitchen to the
              trailhead — and skips the markup that comes with a brand name.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/products" className="btn-primary bg-clay hover:bg-clay/90">
                Shop all products
              </Link>
              <Link to="/products?category=Electronics" className="btn-secondary !bg-transparent !text-canvas !border-canvas/30 hover:!border-canvas/60">
                Browse electronics
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="grid grid-cols-2 gap-4">
              <img
                className="h-56 w-full rounded-2xl object-cover"
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30"
                alt="Curated goods on a shelf"
              />
              <img
                className="mt-8 h-56 w-full rounded-2xl object-cover"
                src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519"
                alt="Well-made kitchen items"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="text-2xl font-semibold">Featured this week</h2>
          <Link to="/products" className="text-sm font-semibold text-moss-700 hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <p className="text-ink/50">Loading products…</p>
        ) : featured.length === 0 ? (
          <p className="text-ink/50">
            No products yet. If you're the store admin, add some from the{' '}
            <Link to="/admin/products/new" className="underline">
              admin dashboard
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
