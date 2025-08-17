import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AccessManagement from './pages/AccessManagement';
import Home from './pages/Home';
import Footer from './components/Footer';
import { getUser, clearAuth, onAuthStateChanged } from './auth';
import PatientProfileView from './pages/PatientProfileView.jsx';
import PatientProfileEdit from './pages/PatientProfileEdit.jsx';

function Navigation() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Get initial user state
    const currentUser = getUser();
    console.log('Initial user state:', currentUser);
    setUser(currentUser);
    setLoading(false);

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged((updatedUser) => {
      console.log('Auth state changed to:', updatedUser);
      setUser(updatedUser);
      // Force a re-render
      setRefreshKey(prev => prev + 1);
    });

    // Also listen for storage events (cross-tab synchronization)
    const handleStorageChange = (e) => {
      if (e.key === 'user' || e.key === 'token') {
        console.log('Storage changed, updating user state');
        const updatedUser = getUser();
        setUser(updatedUser);
        setRefreshKey(prev => prev + 1);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Cleanup subscription
    return () => {
      unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    console.log('Logging out...');
    clearAuth();
    setUser(null);
    setRefreshKey(prev => prev + 1);
    window.location.href = '/login';
  };

  const handleRefreshAuth = () => {
    console.log('Manually refreshing auth state...');
    const currentUser = getUser();
    console.log('Current user from storage:', currentUser);
    setUser(currentUser);
    setRefreshKey(prev => prev + 1);
  };

  // Debug: Log current state
  console.log('Navigation render - user:', user, 'loading:', loading, 'refreshKey:', refreshKey);

  if (loading) {
    return (
      <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
        <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center">
          <div className="font-semibold text-slate-800">Loading...</div>
        </nav>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center">
        
            <Link to="/" className="font-semibold text-slate-800 hover:text-slate-900 transition"><img src="../public/biotron.png" alt="Company Logo" className="w-32 h-32" /></Link>
            <div className="ml-auto flex items-center gap-3">
              {/* Debug button - remove in production */}
              <button
                onClick={handleRefreshAuth}
                className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                title="Debug: Refresh auth state"
              >
                🔄
              </button>
              
              {user ? (
            <>
              {user.role === 'patient' && (
                <>
                  <Link to="/patient" className="text-sm text-slate-600 hover:text-slate-900 transition">Dashboard</Link>
                  <Link to="/patient/profile" className="text-sm text-slate-600 hover:text-slate-900 transition">Profile</Link>
                  <Link to="/access" className="text-sm text-slate-600 hover:text-slate-900 transition">Access</Link>
                </>
              )}
              {user.role === 'doctor' && (
                <>
                  <Link to="/doctor" className="text-sm text-slate-600 hover:text-slate-900 transition">Dashboard</Link>
                </>
              )}
              <span className="hidden sm:inline text-sm text-slate-500">Hi, {user.name} ({user.role})</span>
              <button
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition shadow-sm hover:shadow-md active:translate-y-[1px]"
                onClick={handleLogout}
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
