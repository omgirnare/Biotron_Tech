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
    age: { type: Number, min: 0, max: 120, default: null },
    ethnicity: { type: String, maxlength: 50, default: '' },
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

    // Demographics & Physical Measurements
    heightCm: { type: Number, min: 50, max: 250, default: null },
    weightKg: { type: Number, min: 2, max: 300, default: null },
    bmi: { type: Number, default: null },
    bodySurfaceArea: { type: Number, default: null },

    // Vital Signs
    heartRate: { type: Number, min: 40, max: 180, default: null }, // bpm
    bloodPressure: {
      systolic: { type: Number, min: 70, max: 200, default: null }, // mmHg
      diastolic: { type: Number, min: 40, max: 120, default: null }, // mmHg
    },
    respiratoryRate: { type: Number, min: 8, max: 40, default: null }, // breaths/min
    oxygenSaturation: { type: Number, min: 80, max: 100, default: null }, // %
    temperature: { type: Number, min: 34, max: 42, default: null }, // °C

    // General Physical Exam
    skin: { type: String, enum: ['Normal', 'Lesion', 'Jaundice', 'Pallor'], default: 'Normal' },
    capillaryRefillTime: { type: Number, min: 0, max: 5, default: null }, // seconds
    edema: { type: Boolean, default: false }, // Present/Absent
    hydrationStatus: { type: String, enum: ['Normal', 'Dehydrated', 'Overhydrated'], default: 'Normal' },
    orientation: { type: String, enum: ['Alert & Oriented ×3', 'Altered'], default: 'Alert & Oriented ×3' },
    gait: { type: String, enum: ['Normal', 'Abnormal'], default: 'Normal' },
    muscleTone: { type: String, enum: ['Normal', 'Increased', 'Decreased'], default: 'Normal' },

    // Cardiovascular
    heartSounds: { type: String, enum: ['Normal', 'Abnormal'], default: 'Normal' },
    murmurs: { type: Boolean, default: false }, // Present/Absent
    jugularVenousPressure: { type: String, enum: ['Normal', 'Elevated'], default: 'Normal' },
    peripheralPulses: { type: String, enum: ['Normal', 'Absent', 'Weak'], default: 'Normal' },

    // Respiratory
    breathSounds: { type: String, enum: ['Clear', 'Wheeze', 'Rales', 'Rhonchi'], default: 'Clear' },
    chestExpansion: { type: String, enum: ['Normal', 'Reduced'], default: 'Normal' },
    accessoryMuscleUse: { type: Boolean, default: false }, // Present/Absent

    // Gastrointestinal
    abdomenPalpation: { type: String, enum: ['Soft', 'Tender', 'Rigid'], default: 'Soft' },
    bowelSounds: { type: String, enum: ['Normal', 'Hypoactive', 'Hyperactive', 'Absent'], default: 'Normal' },
    hepatosplenomegaly: { type: Boolean, default: false }, // Present/Absent
    abdominalMass: { type: Boolean, default: false }, // Present/Absent

    // Neurological
    cranialNerves: { type: String, enum: ['Intact', 'Deficit'], default: 'Intact' }, // II-XII
    reflexes: { type: String, enum: ['Normal 2+', 'Hyper', 'Hypo', 'Absent'], default: 'Normal 2+' },
    sensation: { type: String, enum: ['Normal', 'Reduced', 'Absent'], default: 'Normal' },
    motorStrength: { type: Number, min: 0, max: 5, default: null }, // scale 0-5
    coordination: { type: String, enum: ['Normal', 'Abnormal'], default: 'Normal' },
    speech: { type: String, enum: ['Normal', 'Abnormal'], default: 'Normal' },

    // Musculoskeletal
    rangeOfMotion: { type: String, enum: ['Full', 'Restricted'], default: 'Full' },
    deformities: { type: Boolean, default: false }, // Present/Absent
    tenderness: { type: Boolean, default: false }, // Present/Absent
    spineAlignment: { type: String, enum: ['Normal', 'Abnormal'], default: 'Normal' },

    // Laboratory Values
    hemoglobin: { type: Number, min: 5, max: 20, default: null }, // g/dL
    wbcCount: { type: Number, min: 1000, max: 20000, default: null }, // /µL
    plateletCount: { type: Number, min: 50000, max: 700000, default: null }, // /µL
    fastingBloodGlucose: { type: Number, min: 50, max: 300, default: null }, // mg/dL
    serumCreatinine: { type: Number, min: 0.1, max: 10, default: null }, // mg/dL
    bloodUreaNitrogen: { type: Number, min: 2, max: 50, default: null }, // mg/dL
    serumSodium: { type: Number, min: 120, max: 160, default: null }, // mEq/L
    serumPotassium: { type: Number, min: 2, max: 7, default: null }, // mEq/L

    // Legacy fields for backward compatibility
    bloodSugar: { type: Number, default: null }, // mg/dL - keeping for backward compatibility
  },
  { timestamps: true }
);

// ensure index on patientId (unique)
// patientProfileSchema.index({ patientId: 1 }, { unique: true });

const PatientProfile = mongoose.model('PatientProfile', patientProfileSchema);

export default PatientProfile;