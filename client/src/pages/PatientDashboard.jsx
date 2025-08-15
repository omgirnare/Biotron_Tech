import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { getUser } from '../auth';
import FileUpload from '../components/FileUpload';

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [records, setRecords] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const user = getUser();

  useEffect(() => {
    if (!user || user.role !== 'patient') navigate('/login');
    loadRecords();
    loadDoctors();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadRecords() {
    const { data } = await api.get('/records');
    setRecords(data);
  }

  async function loadDoctors() {
    const { data } = await api.get('/users?role=doctor');
    setDoctors(data);
  }

  async function onUploadFile(file, updateProgress) {
    const form = new FormData();
    form.append('title', title);
    form.append('description', description);
    if (file) form.append('file', file);
    await api.post('/records', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (evt.total) {
          const pct = Math.round((evt.loaded * 100) / evt.total);
          updateProgress(pct);
        }
      },
    });
    setTitle('');
    setDescription('');
    await loadRecords();
  }

  async function grantAccess() {
    if (!selectedDoctor) return;
    await api.post('/access/grant-access', { doctorId: selectedDoctor });
    alert('Access granted');
  }

  async function revokeAccess() {
    if (!selectedDoctor) return;
    await api.post('/access/revoke-access', { doctorId: selectedDoctor });
    alert('Access revoked');
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Patient Dashboard</h2>
        <span className="inline-flex items-center rounded-full border border-slate-200 px-2 text-sm text-slate-600">Patient</span>
      </div>

      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="font-medium mb-3">Upload Medical Record</div>
          <div>
            <label className="block text-sm text-slate-600">Title</label>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring focus:ring-blue-100" placeholder="e.g., MRI Scan - June 2025" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="mt-3">
            <label className="block text-sm text-slate-600">Description</label>
            <textarea className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring focus:ring-blue-100" placeholder="Short description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div className="mt-3">
            <FileUpload onUpload={onUploadFile} />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
          <div className="font-medium mb-3">Grant/Revoke Access</div>
          <div>
            <label className="block text-sm text-slate-600">Select doctor</label>
            <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600" value={selectedDoctor} onChange={(e) => setSelectedDoctor(e.target.value)}>
              <option value="">Choose…</option>
              {doctors.map((d) => (
                <option key={d._id || d.id} value={d._id || d.id}>{d.name} ({d.email})</option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="rounded-lg bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition shadow-sm hover:shadow-md active:translate-y-[1px]" onClick={grantAccess}>Grant</button>
            <button className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50 transition shadow-sm hover:shadow-md active:translate-y-[1px]" onClick={revokeAccess}>Revoke</button>
            <Link to="/access" className="rounded-lg border border-slate-200 px-4 py-2 hover:bg-slate-50 transition shadow-sm hover:shadow-md active:translate-y-[1px]">Manage</Link>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div className="flex items-center justify-between">
          <div className="font-medium">Your Records</div>
          <span className="text-sm text-slate-600">{records.length} total</span>
        </div>
        <div className="mt-3">
          {records.length === 0 ? (
            <div className="text-sm text-slate-600">No records yet. Upload your first record using the form above.</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {records.map((r) => (
                <div key={r._id} className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
                  <div className="font-medium text-slate-800">{r.title}</div>
                  <div className="text-sm text-slate-600 mt-1">{r.description}</div>
                  {r.fileUrl && (
                    <a className="text-sm text-blue-600 hover:underline" href={`http://localhost:5000${r.fileUrl}`} target="_blank" rel="noreferrer">View file</a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Link to="/patient/profile" className="px-3 py-2 bg-blue-600 text-white rounded">View / Add Profile</Link>
      </div>
    </div>
  );
}


