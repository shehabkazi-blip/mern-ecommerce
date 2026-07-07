import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../context/useCartStore';
import useAuthStore from '../context/useAuthStore';

export default function Cart() {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate(user ? '/checkout' : '/login?redirect=/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="mt-2 text-ink/60">Add something you'll actually use.</p>
        <Link to="/products" className="btn-primary mt-6 inline-flex">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold">Your cart</h1>

      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <div key={item.product} className="card flex items-center gap-4 p-4">
            <img src={item.image} alt={item.name} className="h-20 w-20 rounded-lg object-cover" />
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-ink/50">${item.price.toFixed(2)} each</p>
            </div>
            <select
              value={item.quantity}
              onChange={(e) => updateQuantity(item.product, Number(e.target.value))}
              className="input-field w-20"
            >
              {Array.from({ length: Math.min(item.countInStock, 10) }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <p className="w-20 text-right font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
            <button
              onClick={() => removeItem(item.product)}
              className="text-sm text-ink/40 hover:text-clay"
              aria-label={`Remove ${item.name}`}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="card mt-8 flex items-center justify-between p-6">
        <div>
          <p className="text-sm text-ink/60">Subtotal</p>
          <p className="text-2xl font-semibold">${subtotal().toFixed(2)}</p>
          <p className="text-xs text-ink/45">Shipping and tax calculated at checkout</p>
        </div>
        <button onClick={handleCheckout} className="btn-primary">
          Proceed to checkout
        </button>
      </div>
    </div>
  );
}
