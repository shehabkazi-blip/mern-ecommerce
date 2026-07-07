import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
      <h1 className="font-display text-6xl">404</h1>
      <p className="mt-3 text-ink/60">This page took a wrong turn.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">
        Back home
      </Link>
    </div>
  );
}
