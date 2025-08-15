import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {api } from '../api';

export default function PatientProfileView() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let mounted = true;
    api.get('/patients/me')
      .then(r => { if (mounted) setProfile(r.data); })
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

          <Link to="/patient/profile/edit" className="px-4 py-2 bg-yellow-500 text-white rounded">Edit</Link>
        </>
      )}

      {err && <div className="text-red-600 mt-4">{err}</div>}
    </div>
  );
}