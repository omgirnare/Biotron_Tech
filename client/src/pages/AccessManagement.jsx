import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { getUser } from '../auth';

export default function AccessManagement() {
  const navigate = useNavigate();
  const user = getUser();
  const [doctors, setDoctors] = useState([]);
  const [selected, setSelected] = useState('');
  const [search, setSearch] = useState('');
  const [currentPermissions, setCurrentPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || user.role !== 'patient') navigate('/login');
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    try {
      setLoading(true);
      const [doctorsRes, permissionsRes] = await Promise.all([
        api.get('/users?role=doctor'),
        api.get('/access/my-permissions')
      ]);
      setDoctors(doctorsRes.data);
      setCurrentPermissions(permissionsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function grant() {
    if (!selected) return;
    try {
      await api.post('/access/grant-access', { doctorId: selected });
      await load(); // Reload to update the list
      setSelected(''); // Reset selection
    } catch (error) {
      console.error('Failed to grant access:', error);
    }
  }

  async function revoke(doctorId) {
    try {
      await api.post('/access/revoke-access', { doctorId });
      await load(); // Reload to update the list
    } catch (error) {
      console.error('Failed to revoke access:', error);
    }
  }

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q);
  });

  // Check if a doctor has permission
  const hasPermission = (doctorId) => {
    return currentPermissions.some(p => p.doctorId === doctorId);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <h2 className="text-2xl font-semibold text-slate-800">Access Management</h2>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm text-slate-600">Search doctors</label>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring focus:ring-blue-100" placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Select doctor</label>
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring focus:ring-blue-100" value={selected} onChange={(e) => setSelected(e.target.value)}>
              <option value="">Choose…</option>
              {filtered.map((d) => (
                <option key={d._id} value={d._id}>{d.name} ({d.email})</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button 
            className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition shadow-sm hover:shadow-md active:translate-y-[1px] disabled:opacity-50 disabled:cursor-not-allowed" 
            onClick={grant}
            disabled={!selected || hasPermission(selected)}
          >
            {hasPermission(selected) ? 'Already Granted' : 'Grant Access'}
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div className="text-sm text-slate-600 mb-2">Current Permissions</div>
        {currentPermissions.length === 0 ? (
          <div className="text-sm text-slate-500 py-4 text-center">No doctors have access to your data yet.</div>
        ) : (
          <div className="divide-y">
            {currentPermissions.map((permission) => {
              const doctor = doctors.find(d => d._id === permission.doctorId);
              if (!doctor) return null;
              
              return (
                <div key={permission._id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="font-medium text-slate-800">{doctor.name}</div>
                    <div className="text-sm text-slate-600">{doctor.email}</div>
                    <div className="text-xs text-slate-500">Granted: {new Date(permission.grantedAt).toLocaleDateString()}</div>
                  </div>
                  <button 
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-red-600 hover:bg-red-50 transition shadow-sm hover:shadow-md active:translate-y-[1px]" 
                    onClick={() => revoke(permission.doctorId)}
                  >
                    Revoke Permission
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


