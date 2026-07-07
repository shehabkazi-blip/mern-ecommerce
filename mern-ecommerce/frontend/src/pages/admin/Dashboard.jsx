import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          api.get('/products', { params: { limit: 1 } }),
          api.get('/orders', { params: { limit: 100 } }),
          api.get('/users'),
        ]);
        const revenue = ordersRes.data.orders.reduce((sum, o) => sum + (o.isPaid ? o.totalPrice : 0), 0);
        setStats({
          products: productsRes.data.total,
          orders: ordersRes.data.total,
          users: usersRes.data.users.length,
          revenue,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const cards = [
    { label: 'Total products', value: stats.products },
    { label: 'Total orders', value: stats.orders },
    { label: 'Registered users', value: stats.users },
    { label: 'Revenue (paid orders)', value: `$${stats.revenue.toFixed(2)}` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      {loading ? (
        <p className="mt-6 text-ink/50">Loading stats…</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="card p-5">
              <p className="text-xs uppercase tracking-wide text-ink/50">{c.label}</p>
              <p className="mt-2 text-2xl font-semibold">{c.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
