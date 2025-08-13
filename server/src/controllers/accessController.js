import { Access } from '../models/Access.js';

export async function grantAccess(req, res) {
  try {
    const { doctorId } = req.body;
    if (!doctorId) return res.status(400).json({ message: 'doctorId required' });
    const access = await Access.findOneAndUpdate(
      { patientId: req.user.id, doctorId },
      { $setOnInsert: { patientId: req.user.id, doctorId } },
      { new: true, upsert: true }
    );
    res.status(201).json(access);
  } catch (err) {
    res.status(500).json({ message: 'Grant failed' });
  }
}

export async function revokeAccess(req, res) {
  try {
    const { doctorId } = req.body;
    if (!doctorId) return res.status(400).json({ message: 'doctorId required' });
    await Access.findOneAndDelete({ patientId: req.user.id, doctorId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Revoke failed' });
  }
}

export async function listMyPatients(req, res) {
  try {
    const list = await Access.find({ doctorId: req.user.id }).populate('patientId', 'name email').lean();
    res.json(list.map((a) => ({ patientId: a.patientId._id, name: a.patientId.name, email: a.patientId.email })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch' });
  }
}


