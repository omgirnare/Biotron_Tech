import { useEffect, useState } from 'react';
import ProfileForm from '../components/ProfileForm';
import {api} from '../api';

export default function PatientProfileEdit() {
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api.get('/patients/me')
      .then(r => { if (mounted) setInitial(r.data); })
      .catch(() => { /* no profile yet, leave initial null */ })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">{initial ? 'Edit Profile' : 'Create Profile'}</h1>
      <ProfileForm initial={initial ?? {}} onSaved={() => { /* navigation handled in form */ }} />
    </div>
  );
}