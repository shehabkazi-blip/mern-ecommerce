import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../context/useAuthStore';

export default function Login() {
  const { login } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await login(form);
    setSubmitting(false);
    if (result.success) {
      toast.success('Welcome back!');
      navigate(searchParams.get('redirect') || '/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-1 text-sm text-ink/60">Welcome back to Fieldstock.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="email"
          required
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="input-field"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="input-field"
        />
        <button disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        New here?{' '}
        <Link to="/register" className="font-semibold text-moss-700 underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
