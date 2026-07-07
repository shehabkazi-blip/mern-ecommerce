import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import useAuthStore from '../context/useAuthStore';
import useCartStore from '../context/useCartStore';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const itemCount = useCartStore((s) => s.itemCount());
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-ink/8 bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="font-display text-2xl font-semibold tracking-tight text-ink">
          Fieldstock
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium text-ink/80 md:flex">
          <Link to="/products" className="hover:text-moss-700">Shop all</Link>
          <Link to="/products?category=Electronics" className="hover:text-moss-700">Electronics</Link>
          <Link to="/products?category=Home%20%26%20Kitchen" className="hover:text-moss-700">Home &amp; kitchen</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/cart" className="relative text-sm font-semibold text-ink">
            Cart
            {itemCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-clay text-[11px] font-bold text-white">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              {user.role === 'admin' && (
                <Link to="/admin" className="text-sm font-semibold text-moss-700 hover:underline">
                  Admin
                </Link>
              )}
              <Link to="/account" className="text-sm font-semibold text-ink/80 hover:text-ink">
                {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn-secondary !px-4 !py-1.5 text-xs">
                Log out
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary !px-4 !py-1.5 text-xs hidden md:inline-flex">
              Sign in
            </Link>
          )}

          <button
            className="text-ink md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-ink/8 bg-canvas px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm font-medium">
            <Link to="/products" onClick={() => setMenuOpen(false)}>Shop all</Link>
            {user?.role === 'admin' && (
              <Link to="/admin" onClick={() => setMenuOpen(false)}>Admin dashboard</Link>
            )}
            {user ? (
              <>
                <Link to="/account" onClick={() => setMenuOpen(false)}>My account</Link>
                <button onClick={handleLogout} className="text-left">Log out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
