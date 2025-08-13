import mongoose from 'mongoose';

const medicalRecordSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String },
    storagePath: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema);


