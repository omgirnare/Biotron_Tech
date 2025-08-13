import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import { setAuth, getUser } from '../auth';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.token, data.user);
      const u = getUser();
      if (u?.role === 'doctor') navigate('/doctor');
      else navigate('/patient');
    } catch (err) {
      setError('Login failed');
    }
  }

  return (
    <div className="min-h-[calc(100vh-3.25rem)] grid place-items-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition">
        <h2 className="text-xl font-semibold text-slate-800">Login</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm text-slate-600">Email</label>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring focus:ring-blue-100" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Password</label>
            <input className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring focus:ring-blue-100" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 shadow-sm hover:shadow-md active:translate-y-[1px]" type="submit">Login</button>
        </form>
        <p className="mt-3 text-sm text-slate-600">No account? <Link className="text-blue-600 hover:underline" to="/register">Register</Link></p>
      </div>
    </div>
  );
}


