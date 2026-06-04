import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { errorResponse } from '../utils/response.js';

const uploadDir = process.env.UPLOAD_DIR || './uploads';

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/x-m4a',
    'video/mp4', 'video/quicktime', 'video/x-msvideo',
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'text/plain',
    'application/epub+zip',
    'application/epub',
  ];
  if (allowed.includes(file.mimetype) || file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('image/') || file.mimetype.startsWith('text/')) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 50 * 1024 * 1024, // 50MB
  },
});

export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return errorResponse(res, `Upload error: ${err.message}`, 400);
  }
  if (err) {
    return errorResponse(res, err.message, 400);
  }
  next();
};
