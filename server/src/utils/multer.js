import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { config } from '../config.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${base}_${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({ storage });


