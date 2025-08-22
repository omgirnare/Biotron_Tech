import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { getUser } from '../auth';

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patientProfile, setPatientProfile] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'profile'
  const user = getUser();

  useEffect(() => {
    if (!user || user.role !== 'doctor') navigate('/login');
    loadPatients();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPatients() {
    try {
      setLoading(true);
      const { data } = await api.get('/access/my-patients');
      setPatients(data);
    } catch (error) {
      console.error('Failed to load patients:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadPatientProfile(patientId) {
    if (!patientId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/patients/${patientId}`);
      setPatientProfile(data);
      setViewMode('profile');
    } catch (error) {
      console.error('Failed to load patient profile:', error);
      setPatientProfile(null);
    } finally {
      setLoading(false);
    }
  }

  async function loadRecords(patientId) {
    if (!patientId) return;
    try {
      const { data } = await api.get('/records', { params: { patientId } });
      setRecords(data);
    } catch (error) {
      console.error('Failed to load records:', error);
      setRecords([]);
    }
  }

  function handlePatientSelect(patientId) {
    setSelectedPatient(patientId);
    if (patientId) {
      loadPatientProfile(patientId);
      loadRecords(patientId);
    } else {
      setPatientProfile(null);
      setRecords([]);
      setViewMode('list');
    }
  }

  function backToList() {
    setViewMode('list');
    setSelectedPatient('');
    setPatientProfile(null);
    setRecords([]);
  }

  // Helper function to check if patient has profile data
  function hasProfileData(profile) {
    if (!profile) return false;
    return profile.fullName || profile.age || profile.gender || profile.bloodGroup || 
           profile.contactNumber || profile.email || profile.address || 
           profile.allergies?.length > 0 || profile.currentMedications?.length > 0;
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Doctor Dashboard</h2>
        <span className="inline-flex items-center rounded-full border border-slate-200 px-2 text-sm text-slate-600">Doctor</span>
      </div>

      {viewMode === 'list' && (
        <>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="font-medium mb-3">Your Patients</div>
            {patients.length === 0 ? (
              <div className="text-sm text-slate-500 py-4 text-center">No patients have granted you access yet.</div>
            ) : (
              <div className="max-w-md">
                <label className="block text-sm text-slate-600">Select a patient</label>
                <select className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-600 focus:ring focus:ring-blue-100" value={selectedPatient} onChange={(e) => handlePatientSelect(e.target.value)}>
                  <option value="">Choose…</option>
                  {patients.map((p) => (
                    <option key={p.patientId} value={p.patientId}>
                      {p.name} ({p.email})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {selectedPatient && patientProfile && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-center justify-between mb-3">
                <div className="font-medium">Patient Profile Summary</div>
                <button 
                  className="text-sm text-blue-600 hover:underline"
                  onClick={() => setViewMode('profile')}
                >
                  View Full Profile
                </button>
              </div>
              
              {/* Data Availability Summary */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-2">Available Information:</div>
                <div className="flex flex-wrap gap-2">
                  {hasProfileData(patientProfile) && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ Profile Data
                    </span>
                  )}
                  {records.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      📄 {records.length} Document{records.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {!hasProfileData(patientProfile) && records.length === 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      ⚠️ No data available
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-2 text-sm">
                <div><strong>Name:</strong> {patientProfile.fullName || 'Not provided'}</div>
                <div><strong>Age:</strong> {patientProfile.age || 'Not provided'}</div>
                <div><strong>Gender:</strong> {patientProfile.gender || 'Not provided'}</div>
                <div><strong>Blood Group:</strong> {patientProfile.bloodGroup || 'Not provided'}</div>
                <div><strong>Contact:</strong> {patientProfile.contactNumber || 'Not provided'}</div>
              </div>
            </div>
          )}

          {selectedPatient && (
            <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="font-medium mb-3">Medical Records & Documents</div>
              {records.length === 0 ? (
                <div className="text-sm text-slate-600">No medical records or documents uploaded by this patient.</div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {records.map((r) => (
                    <div key={r._id} className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
                      <div className="font-medium text-slate-800">{r.title}</div>
                      <div className="text-sm text-slate-600 mt-1">{r.description}</div>
                      <div className="text-xs text-slate-500 mt-2">
                        Uploaded: {new Date(r.uploadedAt || r.createdAt).toLocaleDateString()}
                      </div>
                      {r.fileUrl && (
                        <a className="text-sm text-blue-600 hover:underline" href={`http://localhost:5000${r.fileUrl}`} target="_blank" rel="noreferrer">View file</a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {viewMode === 'profile' && patientProfile && (
        <>
          {/* Patient Profile Section */}
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Patient Profile: {patientProfile.fullName}</h3>
              <button 
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                onClick={backToList}
              >
                ← Back to List
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 border-b pb-2 mb-3">Basic Information</h4>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <div><strong className="text-gray-700">Patient ID:</strong> {patientProfile.patientId}</div>
                  <div><strong className="text-gray-700">Full Name:</strong> {patientProfile.fullName}</div>
                  <div><strong className="text-gray-700">Gender:</strong> {patientProfile.gender || '—'}</div>
                  <div><strong className="text-gray-700">Date of Birth:</strong> {patientProfile.dateOfBirth ? new Date(patientProfile.dateOfBirth).toLocaleDateString() : '—'}</div>
                  <div><strong className="text-gray-700">Age:</strong> {patientProfile.age ?? '—'}</div>
                  <div><strong className="text-gray-700">Ethnicity:</strong> {patientProfile.ethnicity || '—'}</div>
                  <div><strong className="text-gray-700">Blood Group:</strong> {patientProfile.bloodGroup || '—'}</div>
                  <div><strong className="text-gray-700">Marital Status:</strong> {patientProfile.maritalStatus || '—'}</div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 border-b pb-2 mb-3">Contact Information</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div><strong className="text-gray-700">Contact Number:</strong> {patientProfile.contactNumber || '—'}</div>
                  <div><strong className="text-gray-700">Email:</strong> {patientProfile.email || '—'}</div>
                  <div className="md:col-span-2">
                    <strong className="text-gray-700">Address:</strong> {patientProfile.address?.street}, {patientProfile.address?.city}, {patientProfile.address?.state} {patientProfile.address?.pin}
                  </div>
                  <div><strong className="text-gray-700">Emergency Contact:</strong> {patientProfile.emergencyContact?.name || '—'}</div>
                  <div><strong className="text-gray-700">Emergency Phone:</strong> {patientProfile.emergencyContact?.phone || '—'}</div>
                </div>
              </div>

              {/* Medical History Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 border-b pb-2 mb-3">Medical History</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div><strong className="text-gray-700">Allergies:</strong> {(patientProfile.allergies || []).join(', ') || '—'}</div>
                  <div><strong className="text-gray-700">Current Medications:</strong> {(patientProfile.currentMedications || []).join(', ') || '—'}</div>
                  <div><strong className="text-gray-700">Past Medical Conditions:</strong> {(patientProfile.pastConditions || []).join(', ') || '—'}</div>
                  <div><strong className="text-gray-700">Past Surgeries:</strong> {(patientProfile.pastSurgeries || []).join(', ') || '—'}</div>
                  <div><strong className="text-gray-700">Chronic Diseases:</strong> {(patientProfile.chronicDiseases || []).join(', ') || '—'}</div>
                  <div><strong className="text-gray-700">Family History:</strong> {patientProfile.familyHistory || '—'}</div>
                  <div><strong className="text-gray-700">Immunizations:</strong> {(patientProfile.immunizations || []).join(', ') || '—'}</div>
                  <div><strong className="text-gray-700">Ongoing Treatments:</strong> {(patientProfile.ongoingTreatments || []).join(', ') || '—'}</div>
                </div>
              </div>

              {/* Lifestyle Information Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 border-b pb-2 mb-3">Lifestyle Information</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div><strong className="text-gray-700">Smoking Status:</strong> {patientProfile.smokingStatus || '—'}</div>
                  <div><strong className="text-gray-700">Alcohol Consumption:</strong> {patientProfile.alcoholConsumption || '—'}</div>
                  <div><strong className="text-gray-700">Exercise Level:</strong> {patientProfile.exerciseLevel || '—'}</div>
                  <div><strong className="text-gray-700">Diet Preferences:</strong> {patientProfile.dietPreferences || '—'}</div>
                </div>
              </div>

              {/* Demographics & Physical Measurements Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 border-b pb-2 mb-3">Demographics & Physical Measurements</h4>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div><strong className="text-gray-700">Height (cm):</strong> {patientProfile.heightCm ?? '—'}</div>
                  <div><strong className="text-gray-700">Weight (kg):</strong> {patientProfile.weightKg ?? '—'}</div>
                  <div><strong className="text-gray-700">BMI:</strong> {patientProfile.bmi ?? '—'}</div>
                  <div><strong className="text-gray-700">Body Surface Area (m²):</strong> {patientProfile.bodySurfaceArea ?? '—'}</div>
                </div>
              </div>

              {/* Vital Signs Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 border-b pb-2 mb-3">Vital Signs</h4>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <div><strong className="text-gray-700">Heart Rate (bpm):</strong> {patientProfile.heartRate ?? '—'}</div>
                  <div><strong className="text-gray-700">BP Systolic (mmHg):</strong> {patientProfile.bloodPressure?.systolic ?? '—'}</div>
                  <div><strong className="text-gray-700">BP Diastolic (mmHg):</strong> {patientProfile.bloodPressure?.diastolic ?? '—'}</div>
                  <div><strong className="text-gray-700">Respiratory Rate (breaths/min):</strong> {patientProfile.respiratoryRate ?? '—'}</div>
                  <div><strong className="text-gray-700">Oxygen Saturation (%):</strong> {patientProfile.oxygenSaturation ?? '—'}</div>
                  <div><strong className="text-gray-700">Temperature (°C):</strong> {patientProfile.temperature ?? '—'}</div>
                </div>
              </div>

              {/* General Physical Exam Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 border-b pb-2 mb-3">General Physical Exam</h4>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <div><strong className="text-gray-700">Skin:</strong> {patientProfile.skin || '—'}</div>
                  <div><strong className="text-gray-700">Capillary Refill Time (seconds):</strong> {patientProfile.capillaryRefillTime ?? '—'}</div>
                  <div><strong className="text-gray-700">Edema:</strong> {patientProfile.edema ? 'Present' : 'Absent'}</div>
                  <div><strong className="text-gray-700">Hydration Status:</strong> {patientProfile.hydrationStatus || '—'}</div>
                  <div><strong className="text-gray-700">Orientation:</strong> {patientProfile.orientation || '—'}</div>
                  <div><strong className="text-gray-700">Gait:</strong> {patientProfile.gait || '—'}</div>
                  <div><strong className="text-gray-700">Muscle Tone:</strong> {patientProfile.muscleTone || '—'}</div>
                </div>
              </div>

              {/* Cardiovascular Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 border-b pb-2 mb-3">Cardiovascular</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div><strong className="text-gray-700">Heart Sounds:</strong> {patientProfile.heartSounds || '—'}</div>
                  <div><strong className="text-gray-700">Murmurs:</strong> {patientProfile.murmurs ? 'Present' : 'Absent'}</div>
                  <div><strong className="text-gray-700">Jugular Venous Pressure:</strong> {patientProfile.jugularVenousPressure || '—'}</div>
                  <div><strong className="text-gray-700">Peripheral Pulses:</strong> {patientProfile.peripheralPulses || '—'}</div>
                </div>
              </div>

              {/* Respiratory Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 border-b pb-2 mb-3">Respiratory</h4>
                <div className="grid gap-3 md:grid-cols-3">
                  <div><strong className="text-gray-700">Breath Sounds:</strong> {patientProfile.breathSounds || '—'}</div>
                  <div><strong className="text-gray-700">Chest Expansion:</strong> {patientProfile.chestExpansion || '—'}</div>
                  <div><strong className="text-gray-700">Accessory Muscle Use:</strong> {patientProfile.accessoryMuscleUse ? 'Present' : 'Absent'}</div>
                </div>
              </div>

              {/* Gastrointestinal Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 border-b pb-2 mb-3">Gastrointestinal</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div><strong className="text-gray-700">Abdomen Palpation:</strong> {patientProfile.abdomenPalpation || '—'}</div>
                  <div><strong className="text-gray-700">Bowel Sounds:</strong> {patientProfile.bowelSounds || '—'}</div>
                  <div><strong className="text-gray-700">Hepatosplenomegaly:</strong> {patientProfile.hepatosplenomegaly ? 'Present' : 'Absent'}</div>
                  <div><strong className="text-gray-700">Abdominal Mass:</strong> {patientProfile.abdominalMass ? 'Present' : 'Absent'}</div>
                </div>
              </div>

              {/* Neurological Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 border-b pb-2 mb-3">Neurological</h4>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  <div><strong className="text-gray-700">Cranial Nerves II-XII:</strong> {patientProfile.cranialNerves || '—'}</div>
                  <div><strong className="text-gray-700">Reflexes:</strong> {patientProfile.reflexes || '—'}</div>
                  <div><strong className="text-gray-700">Sensation:</strong> {patientProfile.sensation || '—'}</div>
                  <div><strong className="text-gray-700">Motor Strength (0-5):</strong> {patientProfile.motorStrength ?? '—'}</div>
                  <div><strong className="text-gray-700">Coordination:</strong> {patientProfile.coordination || '—'}</div>
                  <div><strong className="text-gray-700">Speech:</strong> {patientProfile.speech || '—'}</div>
                </div>
              </div>

              {/* Musculoskeletal Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 border-b pb-2 mb-3">Musculoskeletal</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div><strong className="text-gray-700">Range of Motion:</strong> {patientProfile.rangeOfMotion || '—'}</div>
                  <div><strong className="text-gray-700">Deformities:</strong> {patientProfile.deformities ? 'Present' : 'Absent'}</div>
                  <div><strong className="text-gray-700">Tenderness:</strong> {patientProfile.tenderness ? 'Present' : 'Absent'}</div>
                  <div><strong className="text-gray-700">Spine Alignment:</strong> {patientProfile.spineAlignment || '—'}</div>
                </div>
              </div>

              {/* Laboratory Values Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 border-b pb-2 mb-3">Laboratory Values</h4>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  <div><strong className="text-gray-700">Hemoglobin (g/dL):</strong> {patientProfile.hemoglobin ?? '—'}</div>
                  <div><strong className="text-gray-700">WBC Count (/µL):</strong> {patientProfile.wbcCount ?? '—'}</div>
                  <div><strong className="text-gray-700">Platelet Count (/µL):</strong> {patientProfile.plateletCount ?? '—'}</div>
                  <div><strong className="text-gray-700">Fasting Blood Glucose (mg/dL):</strong> {patientProfile.fastingBloodGlucose ?? '—'}</div>
                  <div><strong className="text-gray-700">Serum Creatinine (mg/dL):</strong> {patientProfile.serumCreatinine ?? '—'}</div>
                  <div><strong className="text-gray-700">Blood Urea Nitrogen (mg/dL):</strong> {patientProfile.bloodUreaNitrogen ?? '—'}</div>
                  <div><strong className="text-gray-700">Serum Sodium (mEq/L):</strong> {patientProfile.serumSodium ?? '—'}</div>
                  <div><strong className="text-gray-700">Serum Potassium (mEq/L):</strong> {patientProfile.serumPotassium ?? '—'}</div>
                  <div><strong className="text-gray-700">Blood Sugar (mg/dL):</strong> {patientProfile.bloodSugar ?? '—'}</div>
                </div>
              </div>

              {/* Insurance Information Card */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-slate-800 border-b pb-2 mb-3">Insurance Information</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div><strong className="text-gray-700">Insurance Provider:</strong> {patientProfile.insurance?.provider || '—'}</div>
                  <div><strong className="text-gray-700">Policy Number:</strong> {patientProfile.insurance?.policyNo || '—'}</div>
                  <div><strong className="text-gray-700">Doctor Assigned:</strong> {patientProfile.doctorAssigned?.name ?? '—'}</div>
                  <div><strong className="text-gray-700">Profile Created:</strong> {patientProfile.createdAt ? new Date(patientProfile.createdAt).toLocaleString() : '—'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Records Section - Always visible when in profile view */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <div className="font-medium mb-3">Medical Records & Documents</div>
            {records.length === 0 ? (
              <div className="text-sm text-slate-600">No medical records or documents uploaded by this patient.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {records.map((r) => (
                  <div key={r._id} className="rounded-xl border border-slate-200 p-4 hover:shadow-md transition">
                    <div className="font-medium text-slate-800">{r.title}</div>
                    <div className="text-sm text-slate-600 mt-1">{r.description}</div>
                    <div className="text-xs text-slate-500 mt-2">
                      Uploaded: {new Date(r.uploadedAt || r.createdAt).toLocaleDateString()}
                    </div>
                    {r.fileUrl && (
                      <a 
                        className="inline-block mt-2 text-sm text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded" 
                        href={`http://localhost:5000${r.fileUrl}`} 
                        target="_blank" 
                        rel="noreferrer"
                      >
                        📄 View Document
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}


