import express from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { grantAccess, revokeAccess, listMyPatients } from '../controllers/accessController.js';

const router = express.Router();

// Grant access (patient only)
router.post('/grant-access', requireAuth, requireRole('patient'), grantAccess);

// Revoke access (patient only)
router.post('/revoke-access', requireAuth, requireRole('patient'), revokeAccess);

// For doctor: list patients who granted access
router.get('/my-patients', requireAuth, listMyPatients);

export default router;


