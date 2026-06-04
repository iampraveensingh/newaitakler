import path from 'path';
import fs from 'fs';
import { db } from '../config/database.js';
import { successResponse, errorResponse } from '../utils/response.js';

export const uploadFile = async (req, res) => {
  if (!req.file) {
    return errorResponse(res, 'No file uploaded', 400);
  }

  const serverBase = process.env.BASE_URL || `${req.protocol}://${req.get('host')}`;
  const fileUrl = `${serverBase}/uploads/${req.file.filename}`;

  // Persist upload record unless caller opts out with ?track=false
  if (req.query.track !== 'false') {
    try {
      await db.query(
        `INSERT INTO file_uploads (user_id, original_name, stored_name, file_url, mime_type, file_size, created_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          req.file.originalname,
          req.file.filename,
          fileUrl,
          req.file.mimetype,
          req.file.size,
        ]
      );
    } catch (dbErr) {
      // Log but don't fail the upload — the file is already on disk
      console.error('file_uploads insert error:', dbErr);
    }
  }

  return successResponse(res, { file_url: fileUrl }, 'File uploaded successfully', 201);
};

// GET /api/uploads?type=audio   — list current user's uploads, optionally filtered by MIME prefix
export const listUserUploads = async (req, res) => {
  try {
    const { type } = req.query;
    const conditions = ['user_id = ?'];
    const values = [req.user.id];

    if (type) {
      conditions.push('mime_type LIKE ?');
      values.push(`${type}/%`);
    }

    const [rows] = await db.query(
      `SELECT id, original_name, file_url, mime_type, file_size, created_at
       FROM file_uploads WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
      values
    );
    return successResponse(res, rows);
  } catch (error) {
    console.error('listUserUploads error:', error);
    return errorResponse(res, 'Failed to list uploads', 500);
  }
};

// DELETE /api/uploads/:id   — remove upload record (and physical file) for the current user
export const deleteUserUpload = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT stored_name FROM file_uploads WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!rows.length) {
      return errorResponse(res, 'Upload not found', 404);
    }

    // Delete physical file from disk
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    const filePath = path.join(uploadDir, rows[0].stored_name);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await db.query('DELETE FROM file_uploads WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    return successResponse(res, null, 'Upload deleted');
  } catch (error) {
    console.error('deleteUserUpload error:', error);
    return errorResponse(res, 'Failed to delete upload', 500);
  }
};
