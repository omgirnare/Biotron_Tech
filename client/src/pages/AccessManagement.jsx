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

  useEffect(() => {
    if (!user || user.role !== 'patient') navigate('/login');
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    const { data } = await api.get('/users?role=doctor');
    setDoctors(data);
  }

  async function grant() {
    if (!selected) return;
    await api.post('/access/grant-access', { doctorId: selected });
  }
  async function revoke() {
    if (!selected) return;
    await api.post('/access/revoke-access', { doctorId: selected });
  }

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    return d.name.toLowerCase().includes(q) || d.email.toLowerCase().includes(q);
  });

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
          <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition shadow-sm hover:shadow-md active:translate-y-[1px]" onClick={grant}>Grant access</button>
          <button className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50 transition shadow-sm hover:shadow-md active:translate-y-[1px]" onClick={revoke}>Revoke</button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div className="text-sm text-slate-600 mb-2">Granted doctors</div>
        <div className="divide-y">
          {filtered.map((d) => (
            <div key={d._id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <div className="font-medium text-slate-800">{d.name}</div>
                <div className="text-sm text-slate-600">{d.email}</div>
              </div>
              <button className="rounded-lg border border-slate-200 px-3 py-1.5 hover:bg-slate-50 transition shadow-sm hover:shadow-md active:translate-y-[1px]" onClick={() => { setSelected(d._id); revoke(); }}>Revoke</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


