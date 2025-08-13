import mongoose from 'mongoose';

const accessSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    grantedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

accessSchema.index({ patientId: 1, doctorId: 1 }, { unique: true });

export const Access = mongoose.model('Access', accessSchema);


