import mongoose from 'mongoose';

const patientProfileSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },

    // Demographics / Administrative
    fullName: { type: String, default: 'Unknown', trim: true },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    dateOfBirth: { type: Date, default: null },
    age: { type: Number, default: null }, // new
    bloodGroup: { type: String, default: 'Unknown' },
    maritalStatus: { type: String, default: 'Unknown' },
    contactNumber: { type: String, default: '' },
    email: { type: String, default: '' },
    address: {
      street: { type: String, default: '' },
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      pin: { type: String, default: '' },
    },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
    },

    // Insurance / assignment
    insurance: {
      provider: { type: String, default: '' },
      policyNo: { type: String, default: '' },
    },
    doctorAssigned: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

    // Medical history
    allergies: { type: [String], default: [] },
    currentMedications: { type: [String], default: [] },
    pastConditions: { type: [String], default: [] },
    pastSurgeries: { type: [String], default: [] },
    chronicDiseases: { type: [String], default: [] },
    familyHistory: { type: String, default: '' },
    immunizations: { type: [String], default: [] },
    ongoingTreatments: { type: [String], default: [] },

    // Lifestyle & habits
    smokingStatus: { type: String, default: '' },
    alcoholConsumption: { type: String, default: '' },
    exerciseLevel: { type: String, default: '' },
    dietPreferences: { type: String, default: '' },

    // Vitals & measurements
    heightCm: { type: Number, default: null },
    weightKg: { type: Number, default: null },
    bmi: { type: Number, default: null }, // new (stored, but computed client-side)
    bloodPressure: {
      systolic: { type: Number, default: null },
      diastolic: { type: Number, default: null },
    },
    heartRate: { type: Number, default: null },
    bloodSugar: { type: Number, default: null },
  },
  { timestamps: true }
);

// ensure index on patientId (unique)
// patientProfileSchema.index({ patientId: 1 }, { unique: true });

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);

export default PatientProfile;