import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const load = () => {
    setLoading(true);
    const params = { limit: 100 };
    if (filter) params.status = filter;
    api
      .get('/orders', { params })
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false));
  };

  useEffect(load, [filter]);

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success('Order status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Orders</h1>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field w-auto">
          <option value="">All statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="mt-6 text-ink/50">Loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/8 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Paid</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id} className="border-b border-ink/5 last:border-0">
                  <td className="p-4 font-medium">#{o._id.slice(-8).toUpperCase()}</td>
                  <td className="p-4">{o.user?.name} <br /><span className="text-ink/40">{o.user?.email}</span></td>
                  <td className="p-4">${o.totalPrice.toFixed(2)}</td>
                  <td className="p-4">{o.isPaid ? 'Yes' : 'No'}</td>
                  <td className="p-4">
                    <select
                      value={o.status}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                      className="input-field w-auto !py-1.5 text-xs"
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
