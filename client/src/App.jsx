import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AccessManagement from './pages/AccessManagement';
import Home from './pages/Home';
import Footer from './components/Footer';
import { getUser, clearAuth } from './auth';
import PatientProfileView from './pages/PatientProfileView.jsx';
import PatientProfileEdit from './pages/PatientProfileEdit.jsx';

function Navigation() {
  const user = getUser();
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center">
        
            <Link to="/" className="font-semibold text-slate-800 hover:text-slate-900 transition"><img src="../public/biotron.png" alt="Company Logo" className="w-32 h-32" /></Link>
            <div className="ml-auto flex items-center gap-3">
              {user ? (
            <>
              {user.role === 'patient' && (
                <Link to="/access" className="text-sm text-slate-600 hover:text-slate-900 transition">Access</Link>
              )}
              <span className="hidden sm:inline text-sm text-slate-500">Hi, {user.name} ({user.role})</span>
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition shadow-sm hover:shadow-md active:translate-y-[1px]"
                onClick={() => { clearAuth(); window.location.href = '/login'; }}
              >Logout</button>
            </>
          ) : (
            <>
              <Link className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shadow-sm hover:shadow-md active:translate-y-[1px]" to="/login">Login</Link>
              <Link className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition shadow-sm hover:shadow-md active:translate-y-[1px]" to="/register">Register</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default function App() {
  const user = getUser();
  return (
    <BrowserRouter>
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/patient" element={<PatientDashboard />} />
        <Route path="/doctor" element={<DoctorDashboard />} />
        <Route path="/access" element={<AccessManagement />} />
        <Route path="/patient/profile" element={<PatientProfileView />} />
        <Route path="/patient/profile/edit" element={<PatientProfileEdit />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
