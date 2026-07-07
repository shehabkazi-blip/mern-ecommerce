import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuthStore from '../context/useAuthStore';

export function PrivateRoute() {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;
}

export function AdminRoute() {
  const { user } = useAuthStore();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}
