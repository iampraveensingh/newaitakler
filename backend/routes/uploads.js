import { Router } from 'express';
import { uploadFile, listUserUploads, deleteUserUpload } from '../controllers/uploadController.js';
import { verifyToken } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';

const router = Router();

// POST /api/uploads/file  — upload a file
router.post('/file', verifyToken, upload.single('file'), handleUploadError, uploadFile);

// GET  /api/uploads        — list current user's uploads (?type=audio)
router.get('/', verifyToken, listUserUploads);

// DELETE /api/uploads/:id  — delete an upload record + physical file
router.delete('/:id', verifyToken, deleteUserUpload);

export default router;
