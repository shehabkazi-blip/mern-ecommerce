import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/orders/${id}`)
      .then(({ data }) => setOrder(data.order))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="mx-auto max-w-3xl px-4 py-16 text-ink/50">Loading…</p>;
  if (!order) return <p className="mx-auto max-w-3xl px-4 py-16 text-ink/50">Order not found.</p>;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">Order #{order._id.slice(-8).toUpperCase()}</h1>
      <p className="mt-1 text-sm text-ink/50">Placed on {new Date(order.createdAt).toLocaleString()}</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <div className="card p-5 md:col-span-2">
          <h2 className="font-semibold">Items</h2>
          <div className="mt-4 space-y-3">
            {order.orderItems.map((item) => (
              <div key={item.product} className="flex items-center gap-3">
                <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-ink/50">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
          </div>

          <h2 className="mt-6 font-semibold">Shipping address</h2>
          <p className="mt-2 text-sm text-ink/70">
            {order.shippingAddress.fullName}
            <br />
            {order.shippingAddress.line1}
            {order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}
            <br />
            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            <br />
            {order.shippingAddress.country} · {order.shippingAddress.phone}
          </p>
        </div>

        <div className="card h-fit p-5">
          <h2 className="font-semibold">Summary</h2>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Status</span>
              <span className="capitalize">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span>Payment</span>
              <span>{order.isPaid ? 'Paid' : 'Not paid'}</span>
            </div>
            <div className="flex justify-between border-t border-ink/8 pt-2">
              <span>Subtotal</span>
              <span>${order.itemsPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax</span>
              <span>${order.taxPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 text-base font-semibold">
              <span>Total</span>
              <span>${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
