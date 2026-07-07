import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/products', { params: { limit: 100 } })
      .then(({ data }) => setProducts(data.products))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link to="/admin/products/new" className="btn-primary !px-4 !py-2 text-sm">
          + New product
        </Link>
      </div>

      {loading ? (
        <p className="mt-6 text-ink/50">Loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/8 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-ink/5 last:border-0">
                  <td className="flex items-center gap-3 p-4">
                    <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded object-cover" />
                    {p.name}
                  </td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4">${p.price.toFixed(2)}</td>
                  <td className="p-4">{p.countInStock}</td>
                  <td className="p-4 text-right">
                    <Link to={`/admin/products/${p._id}/edit`} className="mr-3 font-medium text-moss-700 hover:underline">
                      Edit
                    </Link>
                    <button onClick={() => handleDelete(p._id)} className="font-medium text-clay hover:underline">
                      Delete
                    </button>
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
