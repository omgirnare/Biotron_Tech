// Event emitter for authentication state changes
const authEventTarget = new EventTarget();

export function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
  
  // Dispatch custom event to notify components
  const event = new CustomEvent('authStateChanged', { detail: { user } });
  authEventTarget.dispatchEvent(event);
  
  // Also dispatch storage event for cross-tab synchronization
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'user',
    newValue: JSON.stringify(user)
  }));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Dispatch custom event to notify components
  const event = new CustomEvent('authStateChanged', { detail: { user: null } });
  authEventTarget.dispatchEvent(event);
  
  // Also dispatch storage event for cross-tab synchronization
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'user',
    newValue: null
  }));
}

export function getUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

export function isDoctor() {
  const u = getUser();
  return u?.role === 'doctor';
}

export function isPatient() {
  const u = getUser();
  return u?.role === 'patient';
}

// Hook for components to listen to auth state changes
export function onAuthStateChanged(callback) {
  const handler = (event) => callback(event.detail.user);
  authEventTarget.addEventListener('authStateChanged', handler);
  
  // Return cleanup function
  return () => authEventTarget.removeEventListener('authStateChanged', handler);
}


