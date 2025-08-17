import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { grantAccess, revokeAccess, listMyPatients, getMyPermissions, checkAccess } from '../controllers/accessController.js';

const router = express.Router();

// Grant access (patient only)
router.post('/grant-access', requireAuth, requireRole('patient'), grantAccess);

// Revoke access (patient only)
router.post('/revoke-access', requireAuth, requireRole('patient'), revokeAccess);

// For patient: get current permissions
router.get('/my-permissions', requireAuth, requireRole('patient'), getMyPermissions);

// For doctor: list patients who granted access
router.get('/my-patients', requireAuth, listMyPatients);

// For doctor: check access to specific patient
router.get('/check-access/:patientId', requireAuth, requireRole('doctor'), checkAccess);

export default router;


