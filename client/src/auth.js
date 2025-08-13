export function setAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
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


