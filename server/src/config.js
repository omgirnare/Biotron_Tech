import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const ROOT_DIR = path.resolve(process.cwd());
const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const ABS_UPLOAD_DIR = path.join(ROOT_DIR, UPLOAD_DIR);

if (!fs.existsSync(ABS_UPLOAD_DIR)) {
  fs.mkdirSync(ABS_UPLOAD_DIR, { recursive: true });
}

export const config = {
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/med_records',
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwtkey',
  port: Number(process.env.PORT || 5000),
  uploadDir: ABS_UPLOAD_DIR,
  uploadUrlPrefix: `/${UPLOAD_DIR}`,
};


