import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { getUser } from '../auth';

// Toast notification component
const Toast = ({ message, type, onClose }) => (
  <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`}>
    <div className="flex items-center justify-between">
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">×</button>
    </div>
  </div>
);

export default function ProfileForm({ initial = {}, onSaved }) {
  const navigate = useNavigate();
  const user = getUser();
  const [form, setForm] = useState({
    // Basic Information
    fullName: initial.fullName ?? '',
    gender: initial.gender ?? 'other',
    dateOfBirth: initial.dateOfBirth ? initial.dateOfBirth.split('T')[0] : '',
    age: initial.age ?? '',
    ethnicity: initial.ethnicity ?? '',
    bloodGroup: initial.bloodGroup ?? '',
    maritalStatus: initial.maritalStatus ?? '',
    contactNumber: initial.contactNumber ?? '',
    email: initial.email ?? '',
    address: {
      street: initial.address?.street ?? '',
      city: initial.address?.city ?? '',
      state: initial.address?.state ?? '',
      pin: initial.address?.pin ?? '',
    },
    emergencyContact: {
      name: initial.emergencyContact?.name ?? '',
      phone: initial.emergencyContact?.phone ?? '',
    },
    
    // Medical History
    allergies: (initial.allergies || []).join(', '),
    currentMedications: (initial.currentMedications || []).join(', '),
    pastConditions: (initial.pastConditions || []).join(', '),
    pastSurgeries: (initial.pastSurgeries || []).join(', '),
    chronicDiseases: (initial.chronicDiseases || []).join(', '),
    immunizations: (initial.immunizations || []).join(', '),
    ongoingTreatments: (initial.ongoingTreatments || []).join(', '),
    
    // Lifestyle
    smokingStatus: initial.smokingStatus ?? '',
    alcoholConsumption: initial.alcoholConsumption ?? '',
    exerciseLevel: initial.exerciseLevel ?? '',
    dietPreferences: initial.dietPreferences ?? '',
    
    // Demographics & Physical
    heightCm: initial.heightCm ?? '',
    weightKg: initial.weightKg ?? '',
    bmi: initial.bmi ?? '',
    bodySurfaceArea: initial.bodySurfaceArea ?? '',
    
    // Vital Signs
    heartRate: initial.heartRate ?? '',
    bloodPressure: {
      systolic: initial.bloodPressure?.systolic ?? '',
      diastolic: initial.bloodPressure?.diastolic ?? '',
    },
    respiratoryRate: initial.respiratoryRate ?? '',
    oxygenSaturation: initial.oxygenSaturation ?? '',
    temperature: initial.temperature ?? '',
    
    // General Physical Exam
    skin: initial.skin ?? 'Normal',
    capillaryRefillTime: initial.capillaryRefillTime ?? '',
    edema: initial.edema ?? false,
    hydrationStatus: initial.hydrationStatus ?? 'Normal',
    orientation: initial.orientation ?? 'Alert & Oriented ×3',
    gait: initial.gait ?? 'Normal',
    muscleTone: initial.muscleTone ?? 'Normal',
    
    // Cardiovascular
    heartSounds: initial.heartSounds ?? 'Normal',
    murmurs: initial.murmurs ?? false,
    jugularVenousPressure: initial.jugularVenousPressure ?? 'Normal',
    peripheralPulses: initial.peripheralPulses ?? 'Normal',
    
    // Respiratory
    breathSounds: initial.breathSounds ?? 'Clear',
    chestExpansion: initial.chestExpansion ?? 'Normal',
    accessoryMuscleUse: initial.accessoryMuscleUse ?? false,
    
    // Gastrointestinal
    abdomenPalpation: initial.abdomenPalpation ?? 'Soft',
    bowelSounds: initial.bowelSounds ?? 'Normal',
    hepatosplenomegaly: initial.hepatosplenomegaly ?? false,
    abdominalMass: initial.abdominalMass ?? false,
    
    // Neurological
    cranialNerves: initial.cranialNerves ?? 'Intact',
    reflexes: initial.reflexes ?? 'Normal 2+',
    sensation: initial.sensation ?? 'Normal',
    motorStrength: initial.motorStrength ?? '',
    coordination: initial.coordination ?? 'Normal',
    speech: initial.speech ?? 'Normal',
    
    // Musculoskeletal
    rangeOfMotion: initial.rangeOfMotion ?? 'Full',
    deformities: initial.deformities ?? false,
    tenderness: initial.tenderness ?? false,
    spineAlignment: initial.spineAlignment ?? 'Normal',
    
    // Laboratory Values
    hemoglobin: initial.hemoglobin ?? '',
    wbcCount: initial.wbcCount ?? '',
    plateletCount: initial.plateletCount ?? '',
    fastingBloodGlucose: initial.fastingBloodGlucose ?? '',
    serumCreatinine: initial.serumCreatinine ?? '',
    bloodUreaNitrogen: initial.bloodUreaNitrogen ?? '',
    serumSodium: initial.serumSodium ?? '',
    serumPotassium: initial.serumPotassium ?? '',
    
    // Insurance
    insurance: {
      provider: initial.insurance?.provider ?? '',
      policyNo: initial.insurance?.policyNo ?? '',
    },
    
    // Legacy fields
    bloodSugar: initial.bloodSugar ?? '',
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);

  // Auto-calculate BMI, BSA and age when relevant fields change
  useEffect(() => {
    // Compute BMI and BSA when height or weight changes
    const h = Number(form.heightCm);
    const w = Number(form.weightKg);
    if (h > 0 && w > 0) {
      const bmiVal = Number((w / ((h / 100) ** 2)).toFixed(1));
      // Calculate BSA using DuBois formula
      const bsaVal = Number((0.007184 * Math.pow(h, 0.725) * Math.pow(w, 0.425)).toFixed(2));
      setForm(f => ({ ...f, bmi: bmiVal, bodySurfaceArea: bsaVal }));
    } else {
      setForm(f => ({ ...f, bmi: '', bodySurfaceArea: '' }));
    }

    // Compute age when DOB changes
    if (form.dateOfBirth) {
      const dob = new Date(form.dateOfBirth);
      const age = (() => {
        const diff = Date.now() - dob.getTime();
        const a = new Date(diff);
        return Math.abs(a.getUTCFullYear() - 1970);
      })();
      setForm(f => ({ ...f, age }));
    } else {
      setForm(f => ({ ...f, age: '' }));
    }
  }, [form.heightCm, form.weightKg, form.dateOfBirth]);

  function setField(path, value) {
    if (path.includes('.')) {
      const [a, b] = path.split('.');
      setForm(f => ({ ...f, [a]: { ...f[a], [b]: value } }));
    } else {
      setForm(f => ({ ...f, [path]: value }));
    }
  }

  async function handleSubmit(e) {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      // Prepare payload (convert comma-lists to arrays for fields)
      const payload = { ...form };
      const listFields = [
        'allergies', 'currentMedications', 'pastConditions', 'pastSurgeries',
        'chronicDiseases', 'immunizations', 'ongoingTreatments'
      ];
      for (const k of listFields) {
        payload[k] = payload[k] ? payload[k].split(',').map(s => s.trim()).filter(Boolean) : [];
      }

      // Handle numeric fields - convert empty strings to null
      const numericFields = [
        'heightCm', 'weightKg', 'age', 'bmi', 'bodySurfaceArea',
        'heartRate', 'respiratoryRate', 'oxygenSaturation', 'temperature',
        'capillaryRefillTime', 'motorStrength', 'hemoglobin', 'wbcCount',
        'plateletCount', 'fastingBloodGlucose', 'serumCreatinine',
        'bloodUreaNitrogen', 'serumSodium', 'serumPotassium', 'bloodSugar'
      ];
      
      numericFields.forEach(field => {
        if (payload[field] === '') payload[field] = null;
      });
      
      if (payload.bloodPressure.systolic === '') payload.bloodPressure.systolic = null;
      if (payload.bloodPressure.diastolic === '') payload.bloodPressure.diastolic = null;

      if (initial && initial.patientId) {
        // Update existing profile
        const userId = user?.id;
        const resp = await api.put(`/patients/${userId}`, payload);
        onSaved?.(resp.data);
        setToast({ message: 'Profile updated successfully!', type: 'success' });
        setTimeout(() => navigate('/patient/profile'), 1500);
      } else {
        // Create new profile
        const resp = await api.post('/patients', payload);
        onSaved?.(resp.data);
        setToast({ message: 'Profile created successfully!', type: 'success' });
        setTimeout(() => navigate('/patient/profile'), 1500);
      }
    } catch (err) {
      console.error(err);
      const errorMessage = err?.response?.data?.message || 'Failed to save profile';
      setError(errorMessage);
      setToast({ message: errorMessage, type: 'error' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      <form onSubmit={handleSubmit} className="max-w-7xl mx-auto px-4 space-y-6">
        {error && <div className="text-red-600 p-4 bg-red-50 rounded-lg border border-red-200">{error}</div>}

        {/* Basic Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input 
                required 
                value={form.fullName} 
                onChange={e => setField('fullName', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select 
                value={form.gender} 
                onChange={e => setField('gender', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="other">Other</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input 
                type="date" 
                value={form.dateOfBirth} 
                onChange={e => setField('dateOfBirth', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input 
                value={form.age ?? ''} 
                readOnly 
                className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ethnicity</label>
              <input 
                value={form.ethnicity} 
                onChange={e => setField('ethnicity', e.target.value)} 
                maxLength={50}
                placeholder="e.g., Caucasian, Asian, African American"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
              <input 
                value={form.bloodGroup} 
                onChange={e => setField('bloodGroup', e.target.value)} 
                placeholder="e.g., A+, B-, O+"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
              <select 
                value={form.maritalStatus} 
                onChange={e => setField('maritalStatus', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select status</option>
                <option value="single">Single</option>
                <option value="married">Married</option>
                <option value="divorced">Divorced</option>
                <option value="widowed">Widowed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
              <input 
                value={form.contactNumber} 
                onChange={e => setField('contactNumber', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                value={form.email} 
                onChange={e => setField('email', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Address Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Address</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input 
                placeholder="Street address" 
                value={form.address.street} 
                onChange={e => setField('address.street', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input 
                  placeholder="City" 
                  value={form.address.city} 
                  onChange={e => setField('address.city', e.target.value)} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input 
                  placeholder="State" 
                  value={form.address.state} 
                  onChange={e => setField('address.state', e.target.value)} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code</label>
                <input 
                  placeholder="PIN Code" 
                  value={form.address.pin} 
                  onChange={e => setField('address.pin', e.target.value)} 
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Name</label>
              <input 
                placeholder="Emergency contact name" 
                value={form.emergencyContact.name} 
                onChange={e => setField('emergencyContact.name', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Contact Phone</label>
              <input 
                placeholder="Emergency contact phone" 
                value={form.emergencyContact.phone} 
                onChange={e => setField('emergencyContact.phone', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Medical History Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Medical History</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma separated)</label>
              <input 
                value={form.allergies} 
                onChange={e => setField('allergies', e.target.value)} 
                placeholder="e.g., peanuts, shellfish, penicillin"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications (comma separated)</label>
              <input 
                value={form.currentMedications} 
                onChange={e => setField('currentMedications', e.target.value)} 
                placeholder="e.g., aspirin 81mg daily, metformin 500mg"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Past Medical Conditions (comma separated)</label>
              <input 
                value={form.pastConditions} 
                onChange={e => setField('pastConditions', e.target.value)} 
                placeholder="e.g., diabetes, hypertension, asthma"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Past Surgeries (comma separated)</label>
              <input 
                value={form.pastSurgeries} 
                onChange={e => setField('pastSurgeries', e.target.value)} 
                placeholder="e.g., appendectomy 2020, knee replacement 2018"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Diseases (comma separated)</label>
              <input 
                value={form.chronicDiseases} 
                onChange={e => setField('chronicDiseases', e.target.value)} 
                placeholder="e.g., diabetes type 2, chronic kidney disease"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Immunizations (comma separated)</label>
              <input 
                value={form.immunizations} 
                onChange={e => setField('immunizations', e.target.value)} 
                placeholder="e.g., COVID-19, flu shot 2023, MMR"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ongoing Treatments (comma separated)</label>
              <input 
                value={form.ongoingTreatments} 
                onChange={e => setField('ongoingTreatments', e.target.value)} 
                placeholder="e.g., physical therapy, dialysis, chemotherapy"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Demographics & Physical Measurements Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Demographics & Physical Measurements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input 
                type="number" 
                min="50" max="250"
                value={form.heightCm} 
                onChange={e => setField('heightCm', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
              <input 
                type="number" 
                min="2" max="300"
                value={form.weightKg} 
                onChange={e => setField('weightKg', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BMI (auto-calculated)</label>
              <input 
                value={form.bmi ?? ''} 
                readOnly 
                className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Body Surface Area (m²)</label>
              <input 
                value={form.bodySurfaceArea ?? ''} 
                readOnly 
                className="w-full bg-gray-100 border border-gray-300 rounded-md px-3 py-2" 
              />
            </div>
          </div>
        </div>

        {/* Lifestyle Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Lifestyle Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Smoking Status</label>
              <select 
                value={form.smokingStatus} 
                onChange={e => setField('smokingStatus', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select status</option>
                <option value="never">Never</option>
                <option value="former">Former smoker</option>
                <option value="current">Current smoker</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alcohol Consumption</label>
              <select 
                value={form.alcoholConsumption} 
                onChange={e => setField('alcoholConsumption', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select frequency</option>
                <option value="none">None</option>
                <option value="occasional">Occasional</option>
                <option value="moderate">Moderate</option>
                <option value="frequent">Frequent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exercise Level</label>
              <select 
                value={form.exerciseLevel} 
                onChange={e => setField('exerciseLevel', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select level</option>
                <option value="sedentary">Sedentary</option>
                <option value="light">Light activity</option>
                <option value="moderate">Moderate activity</option>
                <option value="active">Very active</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Diet Preferences</label>
              <input 
                value={form.dietPreferences} 
                onChange={e => setField('dietPreferences', e.target.value)} 
                placeholder="e.g., vegetarian, vegan, diabetic"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Insurance Information Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Insurance Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider</label>
              <input 
                value={form.insurance.provider} 
                onChange={e => setField('insurance.provider', e.target.value)} 
                placeholder="e.g., Blue Cross, Aetna, Medicare"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
              <input 
                value={form.insurance.policyNo} 
                onChange={e => setField('insurance.policyNo', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Vital Signs Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Vital Signs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heart Rate (bpm)</label>
              <input 
                type="number" 
                min="40" max="180"
                value={form.heartRate} 
                onChange={e => setField('heartRate', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BP Systolic (mmHg)</label>
              <input 
                type="number" 
                min="70" max="200"
                value={form.bloodPressure.systolic} 
                onChange={e => setField('bloodPressure.systolic', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">BP Diastolic (mmHg)</label>
              <input 
                type="number" 
                min="40" max="120"
                value={form.bloodPressure.diastolic} 
                onChange={e => setField('bloodPressure.diastolic', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Respiratory Rate (breaths/min)</label>
              <input 
                type="number" 
                min="8" max="40"
                value={form.respiratoryRate} 
                onChange={e => setField('respiratoryRate', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Oxygen Saturation (%)</label>
              <input 
                type="number" 
                min="80" max="100"
                value={form.oxygenSaturation} 
                onChange={e => setField('oxygenSaturation', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
              <input 
                type="number" 
                min="34" max="42" step="0.1"
                value={form.temperature} 
                onChange={e => setField('temperature', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* General Physical Exam Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">General Physical Exam</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skin</label>
              <select 
                value={form.skin} 
                onChange={e => setField('skin', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Normal">Normal</option>
                <option value="Lesion">Lesion</option>
                <option value="Jaundice">Jaundice</option>
                <option value="Pallor">Pallor</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capillary Refill Time (seconds)</label>
              <input 
                type="number" 
                min="0" max="5" step="0.1"
                value={form.capillaryRefillTime} 
                onChange={e => setField('capillaryRefillTime', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Edema</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={form.edema} 
                    onChange={e => setField('edema', e.target.checked)} 
                    className="mr-2"
                  />
                  Present
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hydration Status</label>
              <select 
                value={form.hydrationStatus} 
                onChange={e => setField('hydrationStatus', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Normal">Normal</option>
                <option value="Dehydrated">Dehydrated</option>
                <option value="Overhydrated">Overhydrated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orientation</label>
              <select 
                value={form.orientation} 
                onChange={e => setField('orientation', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Alert & Oriented ×3">Alert & Oriented ×3</option>
                <option value="Altered">Altered</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gait</label>
              <select 
                value={form.gait} 
                onChange={e => setField('gait', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Muscle Tone</label>
              <select 
                value={form.muscleTone} 
                onChange={e => setField('muscleTone', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Normal">Normal</option>
                <option value="Increased">Increased</option>
                <option value="Decreased">Decreased</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cardiovascular Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Cardiovascular</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Heart Sounds</label>
              <select 
                value={form.heartSounds} 
                onChange={e => setField('heartSounds', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Murmurs</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={form.murmurs} 
                    onChange={e => setField('murmurs', e.target.checked)} 
                    className="mr-2"
                  />
                  Present
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jugular Venous Pressure</label>
              <select 
                value={form.jugularVenousPressure} 
                onChange={e => setField('jugularVenousPressure', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Normal">Normal</option>
                <option value="Elevated">Elevated</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peripheral Pulses</label>
              <select 
                value={form.peripheralPulses} 
                onChange={e => setField('peripheralPulses', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Normal">Normal</option>
                <option value="Absent">Absent</option>
                <option value="Weak">Weak</option>
              </select>
            </div>
          </div>
        </div>

        {/* Respiratory Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Respiratory</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Breath Sounds</label>
              <select 
                value={form.breathSounds} 
                onChange={e => setField('breathSounds', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Clear">Clear</option>
                <option value="Wheeze">Wheeze</option>
                <option value="Rales">Rales</option>
                <option value="Rhonchi">Rhonchi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chest Expansion</label>
              <select 
                value={form.chestExpansion} 
                onChange={e => setField('chestExpansion', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Normal">Normal</option>
                <option value="Reduced">Reduced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Accessory Muscle Use</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={form.accessoryMuscleUse} 
                    onChange={e => setField('accessoryMuscleUse', e.target.checked)} 
                    className="mr-2"
                  />
                  Present
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Gastrointestinal Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Gastrointestinal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Abdomen Palpation</label>
              <select 
                value={form.abdomenPalpation} 
                onChange={e => setField('abdomenPalpation', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Soft">Soft</option>
                <option value="Tender">Tender</option>
                <option value="Rigid">Rigid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bowel Sounds</label>
              <select 
                value={form.bowelSounds} 
                onChange={e => setField('bowelSounds', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Normal">Normal</option>
                <option value="Hypoactive">Hypoactive</option>
                <option value="Hyperactive">Hyperactive</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hepatosplenomegaly</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={form.hepatosplenomegaly} 
                    onChange={e => setField('hepatosplenomegaly', e.target.checked)} 
                    className="mr-2"
                  />
                  Present
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Abdominal Mass</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={form.abdominalMass} 
                    onChange={e => setField('abdominalMass', e.target.checked)} 
                    className="mr-2"
                  />
                  Present
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Neurological Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Neurological</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cranial Nerves II-XII</label>
              <select 
                value={form.cranialNerves} 
                onChange={e => setField('cranialNerves', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Intact">Intact</option>
                <option value="Deficit">Deficit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reflexes</label>
              <select 
                value={form.reflexes} 
                onChange={e => setField('reflexes', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Normal 2+">Normal 2+</option>
                <option value="Hyper">Hyper</option>
                <option value="Hypo">Hypo</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sensation</label>
              <select 
                value={form.sensation} 
                onChange={e => setField('sensation', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Normal">Normal</option>
                <option value="Reduced">Reduced</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motor Strength (0-5)</label>
              <input 
                type="number" 
                min="0" max="5"
                value={form.motorStrength} 
                onChange={e => setField('motorStrength', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coordination</label>
              <select 
                value={form.coordination} 
                onChange={e => setField('coordination', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Speech</label>
              <select 
                value={form.speech} 
                onChange={e => setField('speech', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Musculoskeletal Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Musculoskeletal</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Range of Motion</label>
              <select 
                value={form.rangeOfMotion} 
                onChange={e => setField('rangeOfMotion', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Full">Full</option>
                <option value="Restricted">Restricted</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deformities</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={form.deformities} 
                    onChange={e => setField('deformities', e.target.checked)} 
                    className="mr-2"
                  />
                  Present
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tenderness</label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={form.tenderness} 
                    onChange={e => setField('tenderness', e.target.checked)} 
                    className="mr-2"
                  />
                  Present
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spine Alignment</label>
              <select 
                value={form.spineAlignment} 
                onChange={e => setField('spineAlignment', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Laboratory Values Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">Laboratory Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hemoglobin (g/dL)</label>
              <input 
                type="number" 
                min="5" max="20" step="0.1"
                value={form.hemoglobin} 
                onChange={e => setField('hemoglobin', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WBC Count (/µL)</label>
              <input 
                type="number" 
                min="1000" max="20000"
                value={form.wbcCount} 
                onChange={e => setField('wbcCount', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Platelet Count (/µL)</label>
              <input 
                type="number" 
                min="50000" max="700000"
                value={form.plateletCount} 
                onChange={e => setField('plateletCount', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fasting Blood Glucose (mg/dL)</label>
              <input 
                type="number" 
                min="50" max="300"
                value={form.fastingBloodGlucose} 
                onChange={e => setField('fastingBloodGlucose', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serum Creatinine (mg/dL)</label>
              <input 
                type="number" 
                min="0.1" max="10" step="0.1"
                value={form.serumCreatinine} 
                onChange={e => setField('serumCreatinine', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Urea Nitrogen (mg/dL)</label>
              <input 
                type="number" 
                min="2" max="50"
                value={form.bloodUreaNitrogen} 
                onChange={e => setField('bloodUreaNitrogen', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serum Sodium (mEq/L)</label>
              <input 
                type="number" 
                min="120" max="160"
                value={form.serumSodium} 
                onChange={e => setField('serumSodium', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serum Potassium (mEq/L)</label>
              <input 
                type="number" 
                min="2" max="7" step="0.1"
                value={form.serumPotassium} 
                onChange={e => setField('serumPotassium', e.target.value)} 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-6 pb-8">
          <button 
            type="submit" 
            disabled={busy} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {busy ? 'Saving…' : (initial && initial.patientId ? 'Update Profile' : 'Create Profile')}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/patient/profile')} 
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}