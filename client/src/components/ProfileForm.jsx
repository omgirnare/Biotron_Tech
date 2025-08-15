import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { getUser } from '../auth';

export default function ProfileForm({ initial = {}, onSaved }) {
  const navigate = useNavigate();
  const user = getUser();
  const [form, setForm] = useState({
    fullName: initial.fullName ?? '',
    gender: initial.gender ?? 'other',
    dateOfBirth: initial.dateOfBirth ? initial.dateOfBirth.split('T')[0] : '',
    age: initial.age ?? '',
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
    allergies: (initial.allergies || []).join(', '),
    currentMedications: (initial.currentMedications || []).join(', '),
    pastConditions: (initial.pastConditions || []).join(', '),
    pastSurgeries: (initial.pastSurgeries || []).join(', '),
    chronicDiseases: (initial.chronicDiseases || []).join(', '),
    immunizations: (initial.immunizations || []).join(', '),
    ongoingTreatments: (initial.ongoingTreatments || []).join(', '),
    smokingStatus: initial.smokingStatus ?? '',
    alcoholConsumption: initial.alcoholConsumption ?? '',
    exerciseLevel: initial.exerciseLevel ?? '',
    dietPreferences: initial.dietPreferences ?? '',
    heightCm: initial.heightCm ?? '',
    weightKg: initial.weightKg ?? '',
    bmi: initial.bmi ?? '',
    bloodPressure: {
      systolic: initial.bloodPressure?.systolic ?? '',
      diastolic: initial.bloodPressure?.diastolic ?? '',
    },
    heartRate: initial.heartRate ?? '',
    bloodSugar: initial.bloodSugar ?? '',
    insurance: {
      provider: initial.insurance?.provider ?? '',
      policyNo: initial.insurance?.policyNo ?? '',
    },
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // Auto-calculate BMI and age when relevant fields change
  useEffect(() => {
    // Compute BMI when height or weight changes
    const h = Number(form.heightCm);
    const w = Number(form.weightKg);
    if (h > 0 && w > 0) {
      const bmiVal = Number((w / ((h / 100) ** 2)).toFixed(1));
      setForm(f => ({ ...f, bmi: bmiVal }));
    } else {
      setForm(f => ({ ...f, bmi: '' }));
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
      if (payload.heightCm === '') payload.heightCm = null;
      if (payload.weightKg === '') payload.weightKg = null;
      if (payload.age === '') payload.age = null;
      if (payload.bmi === '') payload.bmi = null;
      if (payload.heartRate === '') payload.heartRate = null;
      if (payload.bloodSugar === '') payload.bloodSugar = null;
      if (payload.bloodPressure.systolic === '') payload.bloodPressure.systolic = null;
      if (payload.bloodPressure.diastolic === '') payload.bloodPressure.diastolic = null;

      if (initial && initial.patientId) {
        // Update existing profile
        const userId = user?.id;
        const resp = await api.put(`/patients/${userId}`, payload);
        onSaved?.(resp.data);
        navigate('/patient/profile');
      } else {
        // Create new profile
        const resp = await api.post('/patients', payload);
        onSaved?.(resp.data);
        navigate('/patient/profile');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Failed to save profile');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-600 p-3 bg-red-50 rounded">{error}</div>}

      {/* Basic Information */}
      <div>
        <label className="block text-sm font-medium">Full name *</label>
        <input 
          required 
          value={form.fullName} 
          onChange={e => setField('fullName', e.target.value)} 
          className="mt-1 block w-full border rounded px-3 py-2" 
        />
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium">Gender</label>
          <select 
            value={form.gender} 
            onChange={e => setField('gender', e.target.value)} 
            className="mt-1 block w-full border rounded px-3 py-2"
          >
            <option value="other">Other</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Date of Birth</label>
          <input 
            type="date" 
            value={form.dateOfBirth} 
            onChange={e => setField('dateOfBirth', e.target.value)} 
            className="mt-1 block w-full border rounded px-3 py-2" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Age</label>
          <input 
            value={form.age ?? ''} 
            readOnly 
            className="mt-1 block w-full bg-gray-100 border rounded px-3 py-2" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Blood Group</label>
          <input 
            value={form.bloodGroup} 
            onChange={e => setField('bloodGroup', e.target.value)} 
            placeholder="e.g., A+, B-, O+"
            className="mt-1 block w-full border rounded px-3 py-2" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Marital Status</label>
        <select 
          value={form.maritalStatus} 
          onChange={e => setField('maritalStatus', e.target.value)} 
          className="mt-1 block w-full border rounded px-3 py-2"
        >
          <option value="">Select status</option>
          <option value="single">Single</option>
          <option value="married">Married</option>
          <option value="divorced">Divorced</option>
          <option value="widowed">Widowed</option>
        </select>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium">Contact Number</label>
          <input 
            value={form.contactNumber} 
            onChange={e => setField('contactNumber', e.target.value)} 
            className="mt-1 block w-full border rounded px-3 py-2" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input 
            type="email" 
            value={form.email} 
            onChange={e => setField('email', e.target.value)} 
            className="mt-1 block w-full border rounded px-3 py-2" 
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium">Address</label>
        <input 
          placeholder="Street address" 
          value={form.address.street} 
          onChange={e => setField('address.street', e.target.value)} 
          className="mt-1 block w-full border rounded px-3 py-2" 
        />
        <div className="grid grid-cols-3 gap-2 mt-2">
          <input 
            placeholder="City" 
            value={form.address.city} 
            onChange={e => setField('address.city', e.target.value)} 
            className="block w-full border rounded px-3 py-2" 
          />
          <input 
            placeholder="State" 
            value={form.address.state} 
            onChange={e => setField('address.state', e.target.value)} 
            className="block w-full border rounded px-3 py-2" 
          />
          <input 
            placeholder="PIN Code" 
            value={form.address.pin} 
            onChange={e => setField('address.pin', e.target.value)} 
            className="block w-full border rounded px-3 py-2" 
          />
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <label className="block text-sm font-medium">Emergency Contact</label>
        <div className="grid grid-cols-2 gap-2 mt-1">
          <input 
            placeholder="Emergency contact name" 
            value={form.emergencyContact.name} 
            onChange={e => setField('emergencyContact.name', e.target.value)} 
            className="block w-full border rounded px-3 py-2" 
          />
          <input 
            placeholder="Emergency contact phone" 
            value={form.emergencyContact.phone} 
            onChange={e => setField('emergencyContact.phone', e.target.value)} 
            className="block w-full border rounded px-3 py-2" 
          />
        </div>
      </div>

      {/* Medical History */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Medical Information</h3>
        
        <div>
          <label className="block text-sm font-medium">Allergies (comma separated)</label>
          <input 
            value={form.allergies} 
            onChange={e => setField('allergies', e.target.value)} 
            placeholder="e.g., peanuts, shellfish, penicillin"
            className="mt-1 block w-full border rounded px-3 py-2" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Current Medications (comma separated)</label>
          <input 
            value={form.currentMedications} 
            onChange={e => setField('currentMedications', e.target.value)} 
            placeholder="e.g., aspirin 81mg daily, metformin 500mg"
            className="mt-1 block w-full border rounded px-3 py-2" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Past Medical Conditions (comma separated)</label>
          <input 
            value={form.pastConditions} 
            onChange={e => setField('pastConditions', e.target.value)} 
            placeholder="e.g., diabetes, hypertension, asthma"
            className="mt-1 block w-full border rounded px-3 py-2" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Past Surgeries (comma separated)</label>
          <input 
            value={form.pastSurgeries} 
            onChange={e => setField('pastSurgeries', e.target.value)} 
            placeholder="e.g., appendectomy 2020, knee replacement 2018"
            className="mt-1 block w-full border rounded px-3 py-2" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Chronic Diseases (comma separated)</label>
          <input 
            value={form.chronicDiseases} 
            onChange={e => setField('chronicDiseases', e.target.value)} 
            placeholder="e.g., diabetes type 2, chronic kidney disease"
            className="mt-1 block w-full border rounded px-3 py-2" 
          />
        </div>
      </div>

      {/* Physical Measurements */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Physical Measurements</h3>
        
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-sm font-medium">Height (cm)</label>
            <input 
              type="number" 
              value={form.heightCm} 
              onChange={e => setField('heightCm', e.target.value)} 
              className="mt-1 block w-full border rounded px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Weight (kg)</label>
            <input 
              type="number" 
              value={form.weightKg} 
              onChange={e => setField('weightKg', e.target.value)} 
              className="mt-1 block w-full border rounded px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">BMI (auto-calculated)</label>
            <input 
              value={form.bmi ?? ''} 
              readOnly 
              className="mt-1 block w-full bg-gray-100 border rounded px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Heart Rate (bpm)</label>
            <input 
              type="number" 
              value={form.heartRate} 
              onChange={e => setField('heartRate', e.target.value)} 
              className="mt-1 block w-full border rounded px-3 py-2" 
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium">BP Systolic (mmHg)</label>
            <input 
              type="number" 
              value={form.bloodPressure.systolic} 
              onChange={e => setField('bloodPressure.systolic', e.target.value)} 
              className="mt-1 block w-full border rounded px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">BP Diastolic (mmHg)</label>
            <input 
              type="number" 
              value={form.bloodPressure.diastolic} 
              onChange={e => setField('bloodPressure.diastolic', e.target.value)} 
              className="mt-1 block w-full border rounded px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Blood Sugar (mg/dL)</label>
            <input 
              type="number" 
              value={form.bloodSugar} 
              onChange={e => setField('bloodSugar', e.target.value)} 
              className="mt-1 block w-full border rounded px-3 py-2" 
            />
          </div>
        </div>
      </div>

      {/* Lifestyle Information */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Lifestyle Information</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Smoking Status</label>
            <select 
              value={form.smokingStatus} 
              onChange={e => setField('smokingStatus', e.target.value)} 
              className="mt-1 block w-full border rounded px-3 py-2"
            >
              <option value="">Select status</option>
              <option value="never">Never</option>
              <option value="former">Former smoker</option>
              <option value="current">Current smoker</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Alcohol Consumption</label>
            <select 
              value={form.alcoholConsumption} 
              onChange={e => setField('alcoholConsumption', e.target.value)} 
              className="mt-1 block w-full border rounded px-3 py-2"
            >
              <option value="">Select frequency</option>
              <option value="none">None</option>
              <option value="occasional">Occasional</option>
              <option value="moderate">Moderate</option>
              <option value="frequent">Frequent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Exercise Level</label>
            <select 
              value={form.exerciseLevel} 
              onChange={e => setField('exerciseLevel', e.target.value)} 
              className="mt-1 block w-full border rounded px-3 py-2"
            >
              <option value="">Select level</option>
              <option value="sedentary">Sedentary</option>
              <option value="light">Light activity</option>
              <option value="moderate">Moderate activity</option>
              <option value="active">Very active</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Diet Preferences</label>
            <input 
              value={form.dietPreferences} 
              onChange={e => setField('dietPreferences', e.target.value)} 
              placeholder="e.g., vegetarian, vegan, diabetic"
              className="mt-1 block w-full border rounded px-3 py-2" 
            />
          </div>
        </div>
      </div>

      {/* Insurance Information */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">Insurance Information</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Insurance Provider</label>
            <input 
              value={form.insurance.provider} 
              onChange={e => setField('insurance.provider', e.target.value)} 
              placeholder="e.g., Blue Cross, Aetna, Medicare"
              className="mt-1 block w-full border rounded px-3 py-2" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Policy Number</label>
            <input 
              value={form.insurance.policyNo} 
              onChange={e => setField('insurance.policyNo', e.target.value)} 
              className="mt-1 block w-full border rounded px-3 py-2" 
            />
          </div>
        </div>
      </div>

      {/* Additional Medical Fields */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Immunizations (comma separated)</label>
          <input 
            value={form.immunizations} 
            onChange={e => setField('immunizations', e.target.value)} 
            placeholder="e.g., COVID-19, flu shot 2023, MMR"
            className="mt-1 block w-full border rounded px-3 py-2" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Ongoing Treatments (comma separated)</label>
          <input 
            value={form.ongoingTreatments} 
            onChange={e => setField('ongoingTreatments', e.target.value)} 
            placeholder="e.g., physical therapy, dialysis, chemotherapy"
            className="mt-1 block w-full border rounded px-3 py-2" 
          />
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 pt-4">
        <button 
          type="submit" 
          disabled={busy} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {busy ? 'Saving…' : (initial && initial.patientId ? 'Update Profile' : 'Create Profile')}
        </button>
        <button 
          type="button" 
          onClick={() => navigate('/patient/profile')} 
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}