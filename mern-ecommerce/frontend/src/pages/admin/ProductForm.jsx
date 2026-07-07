import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../api/axios';

const emptyForm = {
  name: '',
  description: '',
  brand: '',
  category: '',
  images: '',
  price: '',
  discountPrice: '',
  countInStock: '',
  sku: '',
  isFeatured: false,
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    api.get(`/products/${id}`).then(({ data }) => {
      const p = data.product;
      setForm({
        name: p.name,
        description: p.description,
        brand: p.brand || '',
        category: p.category,
        images: p.images.join(', '),
        price: p.price,
        discountPrice: p.discountPrice || '',
        countInStock: p.countInStock,
        sku: p.sku || '',
        isFeatured: p.isFeatured,
      });
      setLoading(false);
    });
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        images: form.images.split(',').map((s) => s.trim()).filter(Boolean),
        price: Number(form.price),
        discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
        countInStock: Number(form.countInStock),
      };

      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated');
      } else {
        await api.post('/products', payload);
        toast.success('Product created');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-ink/50">Loading…</p>;

  return (
    <div>
      <h1 className="text-2xl font-semibold">{isEdit ? 'Edit product' : 'New product'}</h1>

      <form onSubmit={handleSubmit} className="card mt-6 max-w-2xl space-y-4 p-6">
        <input name="name" required placeholder="Product name" value={form.name} onChange={handleChange} className="input-field" />
        <textarea
          name="description"
          required
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          className="input-field h-28"
        />
        <div className="grid grid-cols-2 gap-4">
          <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} className="input-field" />
          <input name="category" required placeholder="Category" value={form.category} onChange={handleChange} className="input-field" />
        </div>
        <input
          name="images"
          required
          placeholder="Image URLs, comma separated"
          value={form.images}
          onChange={handleChange}
          className="input-field"
        />
        <div className="grid grid-cols-3 gap-4">
          <input
            name="price"
            required
            type="number"
            step="0.01"
            min="0"
            placeholder="Price"
            value={form.price}
            onChange={handleChange}
            className="input-field"
          />
          <input
            name="discountPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="Discount price (optional)"
            value={form.discountPrice}
            onChange={handleChange}
            className="input-field"
          />
          <input
            name="countInStock"
            required
            type="number"
            min="0"
            placeholder="Stock qty"
            value={form.countInStock}
            onChange={handleChange}
            className="input-field"
          />
        </div>
        <input name="sku" placeholder="SKU (optional)" value={form.sku} onChange={handleChange} className="input-field" />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} />
          Feature this product on the homepage
        </label>

        <div className="flex gap-3">
          <button disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : isEdit ? 'Update product' : 'Create product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
