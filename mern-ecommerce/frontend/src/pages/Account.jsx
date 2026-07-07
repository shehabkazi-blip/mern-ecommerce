import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../api/axios';
import useAuthStore from '../context/useAuthStore';

export default function Account() {
  const { user, fetchProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name };
      if (password) payload.password = password;
      await api.put('/auth/me', payload);
      await fetchProfile();
      setPassword('');
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-semibold">My account</h1>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-4 p-6">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/50">
            Name
          </label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/50">
            Email
          </label>
          <input value={user?.email} disabled className="input-field opacity-60" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-ink/50">
            New password (leave blank to keep current)
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>
        <button disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </form>

      <Link to="/orders" className="mt-6 inline-block text-sm font-semibold text-moss-700 hover:underline">
        View my order history →
      </Link>
    </div>
  );
}
