import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import useCartStore from '../context/useCartStore';

const emptyAddress = {
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
};

export default function Checkout() {
  const { items, subtotal, clearCart } = useCartStore();
  const navigate = useNavigate();
  const [address, setAddress] = useState(emptyAddress);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [placing, setPlacing] = useState(false);

  const shipping = subtotal() >= 75 ? 0 : 5.99;
  const tax = Math.round(subtotal() * 0.08 * 100) / 100;
  const total = subtotal() + shipping + tax;

  const handleChange = (e) => setAddress({ ...address, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return;
    setPlacing(true);
    try {
      const orderItems = items.map((i) => ({ product: i.product, quantity: i.quantity }));
      const { data } = await api.post('/orders', {
        orderItems,
        shippingAddress: address,
        paymentMethod,
      });
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold">Checkout</h1>

      <div className="mt-8 grid gap-8 md:grid-cols-3">
        <form onSubmit={handleSubmit} className="card space-y-4 p-6 md:col-span-2">
          <h2 className="font-semibold">Shipping address</h2>
          <input name="fullName" required placeholder="Full name" value={address.fullName} onChange={handleChange} className="input-field" />
          <input name="line1" required placeholder="Address line 1" value={address.line1} onChange={handleChange} className="input-field" />
          <input name="line2" placeholder="Address line 2 (optional)" value={address.line2} onChange={handleChange} className="input-field" />
          <div className="grid grid-cols-2 gap-4">
            <input name="city" required placeholder="City" value={address.city} onChange={handleChange} className="input-field" />
            <input name="state" placeholder="State / province" value={address.state} onChange={handleChange} className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input name="postalCode" required placeholder="Postal code" value={address.postalCode} onChange={handleChange} className="input-field" />
            <input name="country" required placeholder="Country" value={address.country} onChange={handleChange} className="input-field" />
          </div>
          <input name="phone" required placeholder="Phone number" value={address.phone} onChange={handleChange} className="input-field" />

          <h2 className="pt-2 font-semibold">Payment method</h2>
          <div className="flex gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={paymentMethod === 'cash_on_delivery'}
                onChange={() => setPaymentMethod('cash_on_delivery')}
              />
              Cash on delivery
            </label>
            <label className="flex items-center gap-2">
              <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
              Card (test mode)
            </label>
          </div>

          <button disabled={placing || items.length === 0} className="btn-primary w-full">
            {placing ? 'Placing order…' : `Place order — $${total.toFixed(2)}`}
          </button>
        </form>

        <div className="card h-fit p-6">
          <h2 className="font-semibold">Order summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            {items.map((i) => (
              <div key={i.product} className="flex justify-between text-ink/70">
                <span>
                  {i.name} × {i.quantity}
                </span>
                <span>${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-1 border-t border-ink/8 pt-4 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
