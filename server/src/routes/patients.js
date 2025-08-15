import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createProfile,
  getMyProfile,
  getProfileById,
  updateProfile,
} from '../controllers/patientController.js';

const router = express.Router();

// Create profile (patient)
router.post('/', requireAuth, createProfile);

// Get current patient's profile
router.get('/me', requireAuth, getMyProfile);

// Get profile by patient user id (doctors/admins with checks inside controller)
router.get('/:id', requireAuth, getProfileById);

// Update profile (patient only — controller enforces)
router.put('/:id', requireAuth, updateProfile);

export default router;