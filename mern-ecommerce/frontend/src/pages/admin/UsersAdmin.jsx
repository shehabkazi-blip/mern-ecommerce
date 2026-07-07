import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import api from '../../api/axios';
import useAuthStore from '../../context/useAuthStore';

export default function UsersAdmin() {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get('/users')
      .then(({ data }) => setUsers(data.users))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleRoleChange = async (id, role) => {
    try {
      await api.put(`/users/${id}`, { role });
      toast.success('Role updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleToggleActive = async (id, isActive) => {
    try {
      await api.put(`/users/${id}`, { isActive: !isActive });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('User deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold">Users</h1>

      {loading ? (
        <p className="mt-6 text-ink/50">Loading…</p>
      ) : (
        <div className="mt-6 overflow-x-auto card">
          <table className="w-full text-sm">
            <thead className="border-b border-ink/8 text-left text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Active</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-ink/5 last:border-0">
                  <td className="p-4">{u.name}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      disabled={u._id === currentUser._id}
                      onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      className="input-field w-auto !py-1.5 text-xs"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="p-4">
                    <button
                      disabled={u._id === currentUser._id}
                      onClick={() => handleToggleActive(u._id, u.isActive)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        u.isActive ? 'bg-moss-100 text-moss-700' : 'bg-clay/15 text-clay'
                      }`}
                    >
                      {u.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    {u._id !== currentUser._id && (
                      <button onClick={() => handleDelete(u._id)} className="font-medium text-clay hover:underline">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
