import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {api } from '../api';

export default function PatientProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    let mounted = true;
    Promise.all([
      api.get('/patients/me'),
      api.get('/access/my-permissions')
    ])
      .then(([profileRes, permissionsRes]) => { 
        if (mounted) {
          setProfile(profileRes.data);
          setPermissions(permissionsRes.data);
        }
      })
      .catch(e => { if (mounted) setErr(e?.response?.data?.message || 'No profile'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div>Loading profile…</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">My Profile</h1>

      {!profile && (
        <div>
          <p className="mb-4">No profile found.</p>
          <Link to="/patient/profile/edit" className="px-4 py-2 bg-blue-600 text-white rounded">Add data</Link>
        </div>
      )}

      {profile && (
        <>
          <div className="mb-4 space-y-1">
            <div><strong>Patient ID:</strong> {profile.patientId}</div>
            <div><strong>Full Name:</strong> {profile.fullName}</div>
            <div><strong>Gender:</strong> {profile.gender}</div>
            <div><strong>DOB:</strong> {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—'}</div>
            <div><strong>Age:</strong> {profile.age ?? '—'}</div>
            <div><strong>Blood Group:</strong> {profile.bloodGroup}</div>
            <div><strong>Marital Status:</strong> {profile.maritalStatus}</div>
            <div><strong>Contact:</strong> {profile.contactNumber}</div>
            <div><strong>Email:</strong> {profile.email}</div>
            <div><strong>Address:</strong> {profile.address?.street}, {profile.address?.city}, {profile.address?.state} {profile.address?.pin}</div>
            <div><strong>Emergency:</strong> {profile.emergencyContact?.name} — {profile.emergencyContact?.phone}</div>

            <div><strong>Allergies:</strong> {(profile.allergies || []).join(', ') || '—'}</div>
            <div><strong>Current Medications:</strong> {(profile.currentMedications || []).join(', ') || '—'}</div>
            <div><strong>Past Conditions:</strong> {(profile.pastConditions || []).join(', ') || '—'}</div>
            <div><strong>Past Surgeries:</strong> {(profile.pastSurgeries || []).join(', ') || '—'}</div>
            <div><strong>Chronic Diseases:</strong> {(profile.chronicDiseases || []).join(', ') || '—'}</div>
            <div><strong>Family History:</strong> {profile.familyHistory || '—'}</div>
            <div><strong>Immunizations:</strong> {(profile.immunizations || []).join(', ') || '—'}</div>
            <div><strong>Ongoing Treatments:</strong> {(profile.ongoingTreatments || []).join(', ') || '—'}</div>

            <div><strong>Smoking:</strong> {profile.smokingStatus || '—'}</div>
            <div><strong>Alcohol:</strong> {profile.alcoholConsumption || '—'}</div>
            <div><strong>Exercise Level:</strong> {profile.exerciseLevel || '—'}</div>
            <div><strong>Diet:</strong> {profile.dietPreferences || '—'}</div>

            <div><strong>Height (cm):</strong> {profile.heightCm ?? '—'}</div>
            <div><strong>Weight (kg):</strong> {profile.weightKg ?? '—'}</div>
            <div><strong>BMI:</strong> {profile.bmi ?? '—'}</div>
            <div><strong>Blood Pressure:</strong> {profile.bloodPressure?.systolic ?? '—'}/{profile.bloodPressure?.diastolic ?? '—'}</div>
            <div><strong>Heart Rate:</strong> {profile.heartRate ?? '—'}</div>
            <div><strong>Blood Sugar:</strong> {profile.bloodSugar ?? '—'}</div>

            <div><strong>Insurance:</strong> {profile.insurance?.provider ? `${profile.insurance.provider} (${profile.insurance.policyNo})` : '—'}</div>
            <div><strong>Doctor Assigned:</strong> {profile.doctorAssigned?.name ?? '—'}</div>
            <div><strong>Record Created:</strong> {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : '—'}</div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Access Permissions</h3>
            {permissions.length === 0 ? (
              <p className="text-sm text-blue-600">No doctors currently have access to your profile.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-blue-600">The following doctors can view your profile:</p>
                {permissions.map((permission) => (
                  <div key={permission._id} className="text-sm text-blue-700">
                    • {permission.doctorName} ({permission.doctorEmail}) - Granted: {new Date(permission.grantedAt).toLocaleDateString()}
                  </div>
                ))}
                <p className="text-xs text-blue-500 mt-2">
                  You can manage these permissions in the <Link to="/access" className="underline">Access Management</Link> section.
                </p>
              </div>
            )}
          </div>

          <div className="mt-4 flex gap-2">
            <Link to="/patient/profile/edit" className="px-4 py-2 bg-yellow-500 text-white rounded">Edit</Link>
            <Link to="/access" className="px-4 py-2 bg-blue-600 text-white rounded">Manage Access</Link>
          </div>
        </>
      )}

      {err && <div className="text-red-600 mt-4">{err}</div>}
    </div>
  );
}