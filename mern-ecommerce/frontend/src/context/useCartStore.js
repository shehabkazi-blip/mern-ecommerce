import { create } from 'zustand';

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
};

const persist = (items) => localStorage.setItem('cart', JSON.stringify(items));

const useCartStore = create((set, get) => ({
  items: loadCart(),

  addItem: (product, quantity = 1) => {
    const items = [...get().items];
    const existing = items.find((i) => i.product === product._id);

    if (existing) {
      existing.quantity = Math.min(existing.quantity + quantity, product.countInStock);
    } else {
      items.push({
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: product.discountPrice || product.price,
        countInStock: product.countInStock,
        quantity: Math.min(quantity, product.countInStock),
      });
    }
    persist(items);
    set({ items });
  },

  updateQuantity: (productId, quantity) => {
    const items = get().items.map((i) => (i.product === productId ? { ...i, quantity } : i));
    persist(items);
    set({ items });
  },

  removeItem: (productId) => {
    const items = get().items.filter((i) => i.product !== productId);
    persist(items);
    set({ items });
  },

  clearCart: () => {
    persist([]);
    set({ items: [] });
  },

  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
}));

export default useCartStore;
