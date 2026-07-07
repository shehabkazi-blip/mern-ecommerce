import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { PrivateRoute, AdminRoute } from './components/RouteGuards';
import useAuthStore from './context/useAuthStore';

import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import OrderHistory from './pages/OrderHistory';
import OrderDetail from './pages/OrderDetail';
import NotFound from './pages/NotFound';

import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductsAdmin from './pages/admin/ProductsAdmin';
import ProductForm from './pages/admin/ProductForm';
import OrdersAdmin from './pages/admin/OrdersAdmin';
import UsersAdmin from './pages/admin/UsersAdmin';

export default function App() {
  const { fetchProfile } = useAuthStore();

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchProfile();
    }
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<PrivateRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/account" element={<Account />} />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
          </Route>

          <Route path="/admin" element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<ProductsAdmin />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="orders" element={<OrdersAdmin />} />
              <Route path="users" element={<UsersAdmin />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
}
