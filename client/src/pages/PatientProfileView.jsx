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

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-xl text-gray-600">Loading profile…</div>
  </div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">My Medical Profile</h1>
          <Link to="/patient/profile/edit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            Edit Profile
          </Link>
        </div>

        {!profile && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-lg text-gray-600 mb-6">No profile found.</p>
            <Link to="/patient/profile/edit" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              Create Profile
            </Link>
          </div>
        )}

        {profile && (
          <div className="space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><strong className="text-gray-700">Patient ID:</strong> {profile.patientId}</div>
                <div><strong className="text-gray-700">Full Name:</strong> {profile.fullName}</div>
                <div><strong className="text-gray-700">Gender:</strong> {profile.gender}</div>
                <div><strong className="text-gray-700">Date of Birth:</strong> {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '—'}</div>
                <div><strong className="text-gray-700">Age:</strong> {profile.age ?? '—'}</div>
                <div><strong className="text-gray-700">Ethnicity:</strong> {profile.ethnicity || '—'}</div>
                <div><strong className="text-gray-700">Blood Group:</strong> {profile.bloodGroup}</div>
                <div><strong className="text-gray-700">Marital Status:</strong> {profile.maritalStatus}</div>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong className="text-gray-700">Contact Number:</strong> {profile.contactNumber || '—'}</div>
                <div><strong className="text-gray-700">Email:</strong> {profile.email || '—'}</div>
                <div className="md:col-span-2">
                  <strong className="text-gray-700">Address:</strong> {profile.address?.street}, {profile.address?.city}, {profile.address?.state} {profile.address?.pin}
                </div>
                <div><strong className="text-gray-700">Emergency Contact:</strong> {profile.emergencyContact?.name || '—'}</div>
                <div><strong className="text-gray-700">Emergency Phone:</strong> {profile.emergencyContact?.phone || '—'}</div>
              </div>
            </div>

            {/* Medical History Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Medical History</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong className="text-gray-700">Allergies:</strong> {(profile.allergies || []).join(', ') || '—'}</div>
                <div><strong className="text-gray-700">Current Medications:</strong> {(profile.currentMedications || []).join(', ') || '—'}</div>
                <div><strong className="text-gray-700">Past Medical Conditions:</strong> {(profile.pastConditions || []).join(', ') || '—'}</div>
                <div><strong className="text-gray-700">Past Surgeries:</strong> {(profile.pastSurgeries || []).join(', ') || '—'}</div>
                <div><strong className="text-gray-700">Chronic Diseases:</strong> {(profile.chronicDiseases || []).join(', ') || '—'}</div>
                <div><strong className="text-gray-700">Family History:</strong> {profile.familyHistory || '—'}</div>
                <div><strong className="text-gray-700">Immunizations:</strong> {(profile.immunizations || []).join(', ') || '—'}</div>
                <div><strong className="text-gray-700">Ongoing Treatments:</strong> {(profile.ongoingTreatments || []).join(', ') || '—'}</div>
              </div>
            </div>

            {/* Lifestyle Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Lifestyle Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong className="text-gray-700">Smoking Status:</strong> {profile.smokingStatus || '—'}</div>
                <div><strong className="text-gray-700">Alcohol Consumption:</strong> {profile.alcoholConsumption || '—'}</div>
                <div><strong className="text-gray-700">Exercise Level:</strong> {profile.exerciseLevel || '—'}</div>
                <div><strong className="text-gray-700">Diet Preferences:</strong> {profile.dietPreferences || '—'}</div>
              </div>
            </div>

            {/* Demographics & Physical Measurements Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Demographics & Physical Measurements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><strong className="text-gray-700">Height (cm):</strong> {profile.heightCm ?? '—'}</div>
                <div><strong className="text-gray-700">Weight (kg):</strong> {profile.weightKg ?? '—'}</div>
                <div><strong className="text-gray-700">BMI:</strong> {profile.bmi ?? '—'}</div>
                <div><strong className="text-gray-700">Body Surface Area (m²):</strong> {profile.bodySurfaceArea ?? '—'}</div>
              </div>
            </div>

            {/* Vital Signs Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Vital Signs</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><strong className="text-gray-700">Heart Rate (bpm):</strong> {profile.heartRate ?? '—'}</div>
                <div><strong className="text-gray-700">BP Systolic (mmHg):</strong> {profile.bloodPressure?.systolic ?? '—'}</div>
                <div><strong className="text-gray-700">BP Diastolic (mmHg):</strong> {profile.bloodPressure?.diastolic ?? '—'}</div>
                <div><strong className="text-gray-700">Respiratory Rate (breaths/min):</strong> {profile.respiratoryRate ?? '—'}</div>
                <div><strong className="text-gray-700">Oxygen Saturation (%):</strong> {profile.oxygenSaturation ?? '—'}</div>
                <div><strong className="text-gray-700">Temperature (°C):</strong> {profile.temperature ?? '—'}</div>
              </div>
            </div>

            {/* General Physical Exam Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">General Physical Exam</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><strong className="text-gray-700">Skin:</strong> {profile.skin || '—'}</div>
                <div><strong className="text-gray-700">Capillary Refill Time (seconds):</strong> {profile.capillaryRefillTime ?? '—'}</div>
                <div><strong className="text-gray-700">Edema:</strong> {profile.edema ? 'Present' : 'Absent'}</div>
                <div><strong className="text-gray-700">Hydration Status:</strong> {profile.hydrationStatus || '—'}</div>
                <div><strong className="text-gray-700">Orientation:</strong> {profile.orientation || '—'}</div>
                <div><strong className="text-gray-700">Gait:</strong> {profile.gait || '—'}</div>
                <div><strong className="text-gray-700">Muscle Tone:</strong> {profile.muscleTone || '—'}</div>
              </div>
            </div>

            {/* Cardiovascular Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Cardiovascular</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong className="text-gray-700">Heart Sounds:</strong> {profile.heartSounds || '—'}</div>
                <div><strong className="text-gray-700">Murmurs:</strong> {profile.murmurs ? 'Present' : 'Absent'}</div>
                <div><strong className="text-gray-700">Jugular Venous Pressure:</strong> {profile.jugularVenousPressure || '—'}</div>
                <div><strong className="text-gray-700">Peripheral Pulses:</strong> {profile.peripheralPulses || '—'}</div>
              </div>
            </div>

            {/* Respiratory Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Respiratory</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><strong className="text-gray-700">Breath Sounds:</strong> {profile.breathSounds || '—'}</div>
                <div><strong className="text-gray-700">Chest Expansion:</strong> {profile.chestExpansion || '—'}</div>
                <div><strong className="text-gray-700">Accessory Muscle Use:</strong> {profile.accessoryMuscleUse ? 'Present' : 'Absent'}</div>
              </div>
            </div>

            {/* Gastrointestinal Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Gastrointestinal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong className="text-gray-700">Abdomen Palpation:</strong> {profile.abdomenPalpation || '—'}</div>
                <div><strong className="text-gray-700">Bowel Sounds:</strong> {profile.bowelSounds || '—'}</div>
                <div><strong className="text-gray-700">Hepatosplenomegaly:</strong> {profile.hepatosplenomegaly ? 'Present' : 'Absent'}</div>
                <div><strong className="text-gray-700">Abdominal Mass:</strong> {profile.abdominalMass ? 'Present' : 'Absent'}</div>
              </div>
            </div>

            {/* Neurological Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Neurological</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div><strong className="text-gray-700">Cranial Nerves II-XII:</strong> {profile.cranialNerves || '—'}</div>
                <div><strong className="text-gray-700">Reflexes:</strong> {profile.reflexes || '—'}</div>
                <div><strong className="text-gray-700">Sensation:</strong> {profile.sensation || '—'}</div>
                <div><strong className="text-gray-700">Motor Strength (0-5):</strong> {profile.motorStrength ?? '—'}</div>
                <div><strong className="text-gray-700">Coordination:</strong> {profile.coordination || '—'}</div>
                <div><strong className="text-gray-700">Speech:</strong> {profile.speech || '—'}</div>
              </div>
            </div>

            {/* Musculoskeletal Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Musculoskeletal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong className="text-gray-700">Range of Motion:</strong> {profile.rangeOfMotion || '—'}</div>
                <div><strong className="text-gray-700">Deformities:</strong> {profile.deformities ? 'Present' : 'Absent'}</div>
                <div><strong className="text-gray-700">Tenderness:</strong> {profile.tenderness ? 'Present' : 'Absent'}</div>
                <div><strong className="text-gray-700">Spine Alignment:</strong> {profile.spineAlignment || '—'}</div>
              </div>
            </div>

            {/* Laboratory Values Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Laboratory Values</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div><strong className="text-gray-700">Hemoglobin (g/dL):</strong> {profile.hemoglobin ?? '—'}</div>
                <div><strong className="text-gray-700">WBC Count (/µL):</strong> {profile.wbcCount ?? '—'}</div>
                <div><strong className="text-gray-700">Platelet Count (/µL):</strong> {profile.plateletCount ?? '—'}</div>
                <div><strong className="text-gray-700">Fasting Blood Glucose (mg/dL):</strong> {profile.fastingBloodGlucose ?? '—'}</div>
                <div><strong className="text-gray-700">Serum Creatinine (mg/dL):</strong> {profile.serumCreatinine ?? '—'}</div>
                <div><strong className="text-gray-700">Blood Urea Nitrogen (mg/dL):</strong> {profile.bloodUreaNitrogen ?? '—'}</div>
                <div><strong className="text-gray-700">Serum Sodium (mEq/L):</strong> {profile.serumSodium ?? '—'}</div>
                <div><strong className="text-gray-700">Serum Potassium (mEq/L):</strong> {profile.serumPotassium ?? '—'}</div>
                <div><strong className="text-gray-700">Blood Sugar (mg/dL):</strong> {profile.bloodSugar ?? '—'}</div>
              </div>
            </div>

            {/* Insurance Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Insurance Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><strong className="text-gray-700">Insurance Provider:</strong> {profile.insurance?.provider || '—'}</div>
                <div><strong className="text-gray-700">Policy Number:</strong> {profile.insurance?.policyNo || '—'}</div>
                <div><strong className="text-gray-700">Doctor Assigned:</strong> {profile.doctorAssigned?.name ?? '—'}</div>
                <div><strong className="text-gray-700">Profile Created:</strong> {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : '—'}</div>
              </div>
            </div>

            {/* Access Permissions Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Access Permissions</h2>
              {permissions.length === 0 ? (
                <p className="text-gray-600">No doctors currently have access to your profile.</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-700">The following doctors can view your profile:</p>
                  {permissions.map((permission) => (
                    <div key={permission._id} className="text-gray-600 p-3 bg-gray-50 rounded-lg">
                      <strong>{permission.doctorName}</strong> ({permission.doctorEmail})<br />
                      <span className="text-sm text-gray-500">Granted: {new Date(permission.grantedAt).toLocaleDateString()}</span>
                    </div>
                  ))}
                  <p className="text-sm text-gray-500 mt-3">
                    You can manage these permissions in the <Link to="/access" className="text-blue-600 underline hover:text-blue-800">Access Management</Link> section.
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 pb-8">
              <Link to="/patient/profile/edit" className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 font-medium">
                Edit Profile
              </Link>
              <Link to="/access" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                Manage Access
              </Link>
            </div>
          </div>
        )}

        {err && <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 mt-6">{err}</div>}
      </div>
    </div>
  );
}