import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import useCartStore from '../context/useCartStore';
import useAuthStore from '../context/useAuthStore';
import StarRating from '../components/StarRating';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const addItem = useCartStore((s) => s.addItem);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const loadProduct = () => {
    setLoading(true);
    api
      .get(`/products/${id}`)
      .then(({ data }) => setProduct(data.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  };

  useEffect(loadProduct, [id]);

  const handleAddToCart = () => {
    addItem(product, qty);
    toast.success(`Added ${qty} × ${product.name} to cart`);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, reviewForm);
      toast.success('Review submitted, thank you!');
      setReviewForm({ rating: 5, comment: '' });
      loadProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <p className="mx-auto max-w-6xl px-4 py-16 text-ink/50">Loading…</p>;
  if (!product) return <p className="mx-auto max-w-6xl px-4 py-16 text-ink/50">Product not found.</p>;

  const price = product.discountPrice || product.price;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-2xl bg-sand/50">
          <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-ink/45">{product.category}</p>
          <h1 className="mt-1 text-3xl font-semibold">{product.name}</h1>
          <div className="mt-2">
            <StarRating rating={product.rating} numReviews={product.numReviews} />
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-2xl font-semibold">${price.toFixed(2)}</span>
            {product.discountPrice && (
              <span className="text-ink/40 line-through">${product.price.toFixed(2)}</span>
            )}
          </div>

          <p className="mt-5 text-ink/70">{product.description}</p>

          <div className="mt-6 flex items-center gap-3">
            {product.countInStock > 0 ? (
              <>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="input-field w-20"
                >
                  {Array.from({ length: Math.min(product.countInStock, 10) }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <button onClick={handleAddToCart} className="btn-primary">
                  Add to cart
                </button>
              </>
            ) : (
              <span className="font-semibold text-clay">Out of stock</span>
            )}
          </div>
          <p className="mt-2 text-xs text-ink/45">{product.countInStock} in stock · Brand: {product.brand}</p>
        </div>
      </div>

      <div className="mt-16 max-w-2xl">
        <h2 className="text-xl font-semibold">Reviews ({product.numReviews})</h2>

        <div className="mt-6 space-y-5">
          {product.reviews.length === 0 && <p className="text-ink/50">No reviews yet.</p>}
          {product.reviews.map((r) => (
            <div key={r._id} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{r.name}</p>
                <StarRating rating={r.rating} />
              </div>
              <p className="mt-2 text-sm text-ink/70">{r.comment}</p>
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={handleReviewSubmit} className="card mt-8 space-y-3 p-5">
            <h3 className="font-semibold">Write a review</h3>
            <select
              value={reviewForm.rating}
              onChange={(e) => setReviewForm({ ...reviewForm, rating: e.target.value })}
              className="input-field w-40"
            >
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} star{n > 1 ? 's' : ''}
                </option>
              ))}
            </select>
            <textarea
              required
              placeholder="Share your thoughts on this product…"
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              className="input-field h-24"
            />
            <button disabled={submittingReview} className="btn-primary">
              {submittingReview ? 'Submitting…' : 'Submit review'}
            </button>
          </form>
        ) : (
          <p className="mt-6 text-sm text-ink/60">
            <button onClick={() => navigate('/login')} className="font-semibold text-moss-700 underline">
              Sign in
            </button>{' '}
            to write a review.
          </p>
        )}
      </div>
    </div>
  );
}
