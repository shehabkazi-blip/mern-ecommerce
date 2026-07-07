import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const statusColors = {
  pending: 'bg-sand text-ink/70',
  processing: 'bg-moss-100 text-moss-700',
  shipped: 'bg-moss-100 text-moss-700',
  delivered: 'bg-moss-500 text-white',
  cancelled: 'bg-clay/15 text-clay',
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/orders/mine')
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">My orders</h1>

      {loading ? (
        <p className="mt-8 text-ink/50">Loading…</p>
      ) : orders.length === 0 ? (
        <p className="mt-8 text-ink/50">
          You haven't placed any orders yet.{' '}
          <Link to="/products" className="underline">
            Start shopping
          </Link>
          .
        </p>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => (
            <Link key={o._id} to={`/orders/${o._id}`} className="card block p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Order #{o._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm text-ink/50">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[o.status]}`}>
                  {o.status}
                </span>
                <p className="font-semibold">${o.totalPrice.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
