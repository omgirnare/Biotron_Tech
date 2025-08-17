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

export async function getMyPermissions(req, res) {
  try {
    const permissions = await Access.find({ patientId: req.user.id }).populate('doctorId', 'name email').lean();
    res.json(permissions.map((p) => ({
      _id: p._id,
      doctorId: p.doctorId._id,
      doctorName: p.doctorId.name,
      doctorEmail: p.doctorId.email,
      grantedAt: p.grantedAt,
      createdAt: p.createdAt
    })));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch permissions' });
  }
}

export async function checkAccess(req, res) {
  try {
    const { patientId } = req.params;
    if (!patientId) return res.status(400).json({ message: 'patientId required' });
    
    const access = await Access.findOne({ patientId, doctorId: req.user.id });
    if (!access) {
      return res.status(403).json({ message: 'Access denied', hasAccess: false });
    }
    
    res.json({ hasAccess: true, access });
  } catch (err) {
    res.status(500).json({ message: 'Failed to check access' });
  }
}


