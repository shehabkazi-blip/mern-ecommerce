import { NavLink, Outlet } from 'react-router-dom';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/users', label: 'Users' },
];

export default function AdminLayout() {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10 sm:px-6">
      <aside className="w-48 shrink-0">
        <h2 className="mb-4 font-display text-lg font-semibold">Admin</h2>
        <nav className="flex flex-col gap-1 text-sm">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 font-medium ${
                  isActive ? 'bg-moss-600 text-white' : 'text-ink/70 hover:bg-sand'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
