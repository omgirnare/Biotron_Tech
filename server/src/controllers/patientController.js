import PatientProfile from '../models/PatientProfile.js';
import { Access } from '../models/Access.js';


/**
 * Helper: pick only allowed fields and normalize simple types.
 */
function sanitizePayload(input = {}) {
  const allowed = [
    // Demographics / Administrative
    'fullName', 'gender', 'dateOfBirth', 'age', 'bmi', 'bloodGroup', 'maritalStatus',
    'contactNumber', 'email',
    'address', 'emergencyContact',
    // Insurance / assignment
    'insurance', 'doctorAssigned',
    // Medical history arrays
    'allergies', 'currentMedications', 'pastConditions', 'pastSurgeries',
    'chronicDiseases', 'familyHistory', 'immunizations', 'ongoingTreatments',
    // Lifestyle
    'smokingStatus', 'alcoholConsumption', 'exerciseLevel', 'dietPreferences',
    // Vitals
    'heightCm', 'weightKg', 'bloodPressure', 'heartRate', 'bloodSugar',
  ];

  const arrFields = new Set([
    'allergies', 'currentMedications', 'pastConditions', 'pastSurgeries',
    'chronicDiseases', 'immunizations', 'ongoingTreatments',
  ]);

  const out = {};

  for (const key of allowed) {
    if (Object.prototype.hasOwnProperty.call(input, key)) {
      let v = input[key];

      if (arrFields.has(key)) {
        if (Array.isArray(v)) {
          out[key] = v;
        } else if (typeof v === 'string') {
          out[key] = v === '' ? [] : v.split(',').map(s => s.trim()).filter(Boolean);
        } else {
          out[key] = v == null ? [] : [v];
        }
        continue;
      }

      if (key === 'address') {
        out.address = {
          street: v?.street ?? '',
          city: v?.city ?? '',
          state: v?.state ?? '',
          pin: v?.pin ?? '',
        };
        continue;
      }

      if (key === 'emergencyContact') {
        out.emergencyContact = {
          name: v?.name ?? '',
          phone: v?.phone ?? '',
        };
        continue;
      }

      if (key === 'insurance') {
        out.insurance = {
          provider: v?.provider ?? '',
          policyNo: v?.policyNo ?? '',
        };
        continue;
      }

      if (key === 'bloodPressure') {
        out.bloodPressure = {
          systolic: v?.systolic ?? null,
          diastolic: v?.diastolic ?? null,
        };
        continue;
      }

      // numeric normalization
      if (['heightCm', 'weightKg', 'heartRate', 'bloodSugar', 'bmi', 'age'].includes(key)) {
        out[key] = v == null || v === '' ? null : Number(v);
        continue;
      }

      out[key] = v;
    }
  }

  return out;
}

/**
 * Create a new patient profile (patient only).
 * Returns 409 if profile already exists.
 */
export const createProfile = async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can create a profile' });
    }

    const patientId = req.user.id;
    const existing = await PatientProfile.findOne({ patientId });
    if (existing) {
      return res.status(409).json({ message: 'Profile already exists' });
    }

    // sanitize incoming body and enforce patientId
    const payload = sanitizePayload(req.body);
    payload.patientId = patientId;

    const profile = new PatientProfile(payload);
    await profile.save();

    return res.status(201).json(profile);
  } catch (err) {
    console.error('createProfile error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Duplicate profile' });
    }
    return res.status(500).json({ message: 'Failed to create profile' });
  }
};

/**
 * Get current user's profile (patient).
 */
export const getMyProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const patientId = req.user.id;
    const profile = await PatientProfile.findOne({ patientId }).populate('doctorAssigned', 'name email');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    return res.json(profile);
  } catch (err) {
    console.error('getMyProfile error:', err);
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

/**
 * Get a profile by patient user id.
 * - Patient can fetch own profile.
 * - Doctor can fetch only if Access exists.
 * - Admin can fetch any profile.
 */
export const getProfileById = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params; // patient user id

    // If requesting own profile, allow
    if (req.user.id !== id) {
      // If doctor, check Access
      if (req.user.role === 'doctor') {
        const allowed = await Access.findOne({ patientId: id, doctorId: req.user.id });
        if (!allowed) return res.status(403).json({ message: 'Access denied' });
      } else if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied' });
      }
    }

    const profile = await PatientProfile.findOne({ patientId: id }).populate('doctorAssigned', 'name email');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    return res.json(profile);
  } catch (err) {
    console.error('getProfileById error:', err);
    return res.status(500).json({ message: 'Failed to fetch profile' });
  }
};

/**
 * Update a profile by patient user id.
 * Only the patient themselves (owner) may update their profile.
 */
export const updateProfile = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { id } = req.params; // patient user id
    if (req.user.role !== 'patient' || req.user.id !== id) {
      return res.status(403).json({ message: 'Only the patient may update their profile' });
    }

    // sanitize incoming updates and prevent changing patientId
    const updates = sanitizePayload(req.body);

    const profile = await PatientProfile.findOneAndUpdate(
      { patientId: id },
      { $set: updates },
      { new: true }
    );

    if (!profile) return res.status(404).json({ message: 'Profile not found' });

    return res.json(profile);
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};