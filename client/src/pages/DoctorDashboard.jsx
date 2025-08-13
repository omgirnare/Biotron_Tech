import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { getUser } from '../auth';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [records, setRecords] = useState([]);
  const user = getUser();

  useEffect(() => {
    if (!user || user.role !== 'doctor') navigate('/login');
    loadPatients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPatients() {
    const { data } = await api.get('/access/my-patients');
    setPatients(data);
  }

  async function loadRecords(patientId) {
    const { data } = await api.get('/records', { params: { patientId } });
    setRecords(data);
  }

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Doctor Dashboard</h2>
        <span className="inline-flex items-center rounded-full border border-slate-200 px-2 text-sm text-slate-600">Doctor</span>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div className="font-medium mb-3">Your Patients</div>
        <div className="max-w-md">
          <label className="block text-sm text-slate-600">Select a patient</label>
          <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring focus:ring-blue-100" value={selectedPatient} onChange={(e) => { setSelectedPatient(e.target.value); loadRecords(e.target.value); }}>
            <option value="">Choose…</option>
            {patients.map((p) => (
              <option key={p.patientId} value={p.patientId}>
                {p.name} ({p.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
        <div className="font-medium mb-3">Records</div>
        {records.length === 0 ? (
          <div className="text-sm text-slate-600">No records to show. Select a patient above.</div>
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
  );
}


