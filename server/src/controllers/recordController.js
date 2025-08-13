import path from 'path';
import { MedicalRecord } from '../models/MedicalRecord.js';
import { Access } from '../models/Access.js';
import { config } from '../config.js';

export async function createRecord(req, res) {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ message: 'Only patients can upload' });
    const { title, description } = req.body;
    const file = req.file || null;
    const storagePath = file ? file.path : null;
    const fileUrl = file ? path.join(config.uploadUrlPrefix, path.basename(file.path)) : null;
    const record = await MedicalRecord.create({ patientId: req.user.id, title, description, storagePath, fileUrl });
    res.status(201).json(record);
  } catch (err) {
    res.status(500).json({ message: 'Upload failed' });
  }
}

export async function listRecords(req, res) {
  try {
    const { patientId } = req.query;
    let filter = {};
    if (req.user.role === 'patient') {
      filter.patientId = req.user.id;
    } else if (req.user.role === 'doctor') {
      if (!patientId) return res.status(400).json({ message: 'patientId required' });
      const hasAccess = await Access.findOne({ patientId, doctorId: req.user.id });
      if (!hasAccess) return res.status(403).json({ message: 'Access not granted' });
      filter.patientId = patientId;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const records = await MedicalRecord.find(filter).sort({ createdAt: -1 }).lean();
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch records' });
  }
}

export async function updateRecord(req, res) {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ message: 'Forbidden' });
    const record = await MedicalRecord.findOne({ _id: req.params.id, patientId: req.user.id });
    if (!record) return res.status(404).json({ message: 'Record not found' });
    const { title, description } = req.body;
    if (title !== undefined) record.title = title;
    if (description !== undefined) record.description = description;
    if (req.file) {
      record.storagePath = req.file.path;
      record.fileUrl = path.join(config.uploadUrlPrefix, path.basename(req.file.path));
    }
    await record.save();
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: 'Update failed' });
  }
}

export async function deleteRecord(req, res) {
  try {
    if (req.user.role !== 'patient') return res.status(403).json({ message: 'Forbidden' });
    const deleted = await MedicalRecord.findOneAndDelete({ _id: req.params.id, patientId: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Record not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Delete failed' });
  }
}


