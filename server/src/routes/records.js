import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../utils/multer.js';
import { createRecord, listRecords, updateRecord, deleteRecord } from '../controllers/recordController.js';

const router = express.Router();

// Create/Upload record (patient only)
router.post('/', requireAuth, upload.single('file'), createRecord);

// List records with access control
router.get('/', requireAuth, listRecords);

// Update record (patient only, own record)
router.put('/:id', requireAuth, upload.single('file'), updateRecord);

// Delete record (patient only, own record)
router.delete('/:id', requireAuth, deleteRecord);

export default router;


