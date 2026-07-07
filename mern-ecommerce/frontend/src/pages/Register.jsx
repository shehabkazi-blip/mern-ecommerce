import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import useAuthStore from '../context/useAuthStore';

export default function Register() {
  const { register } = useAuthStore();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const result = await register(form);
    setSubmitting(false);
    if (result.success) {
      toast.success('Account created!');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-2xl font-semibold">Create an account</h1>
      <p className="mt-1 text-sm text-ink/60">Join Fieldstock in a few seconds.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input-field"
        />
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
          minLength={8}
          placeholder="Password (min 8 characters)"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="input-field"
        />
        <button disabled={submitting} className="btn-primary w-full">
          {submitting ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink/60">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-moss-700 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
