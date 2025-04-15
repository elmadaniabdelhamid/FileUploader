const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { pool } = require('../config/db');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || './uploads';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Accept all file types for now
  // You may want to restrict file types for security
  cb(null, true);
};

// Initialize upload
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760 // Default 10MB
  }
});

// Upload file
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    // Save file info to database
    const [result] = await pool.execute(
      'INSERT INTO files (filename, original_name, file_path, file_size, mime_type, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.file.filename,
        req.file.originalname,
        req.file.path,
        req.file.size,
        req.file.mimetype,
        req.user.id
      ]
    );

    if (result.affectedRows === 1) {
      const [files] = await pool.execute(
        'SELECT * FROM files WHERE id = ?',
        [result.insertId]
      );

      res.status(201).json(files[0]);
    } else {
      // Delete uploaded file if database insertion fails
      fs.unlinkSync(req.file.path);
      res.status(500).json({ message: 'Failed to save file information' });
    }
  } catch (error) {
    console.error(error);
    // Delete uploaded file if an error occurs
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all files for current user
const getMyFiles = async (req, res) => {
  try {
    const [files] = await pool.execute(
      'SELECT * FROM files WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get file by ID
const getFileById = async (req, res) => {
  try {
    const [files] = await pool.execute(
      'SELECT * FROM files WHERE id = ?',
      [req.params.id]
    );

    if (files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];

    // Check if user owns the file or file is public
    if (file.user_id !== req.user.id && !file.is_public) {
      return res.status(403).json({ message: 'Not authorized to access this file' });
    }

    res.json(file);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Download file
const downloadFile = async (req, res) => {
  try {
    const [files] = await pool.execute(
      'SELECT * FROM files WHERE id = ?',
      [req.params.id]
    );

    if (files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];

    // Check if user owns the file or file is public
    if (file.user_id !== req.user.id && !file.is_public) {
      return res.status(403).json({ message: 'Not authorized to access this file' });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ message: 'File not found on server' });
    }

    // Set headers and send file
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.setHeader('Content-Type', file.mime_type);
    
    const fileStream = fs.createReadStream(file.file_path);
    fileStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const [files] = await pool.execute(
      'SELECT * FROM files WHERE id = ?',
      [req.params.id]
    );

    if (files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];

    // Check if user owns the file
    if (file.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this file' });
    }

    // Delete file from database
    await pool.execute(
      'DELETE FROM files WHERE id = ?',
      [req.params.id]
    );

    // Delete file from disk
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Toggle file public/private status
const toggleFilePublic = async (req, res) => {
  try {
    const [files] = await pool.execute(
      'SELECT * FROM files WHERE id = ?',
      [req.params.id]
    );

    if (files.length === 0) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];

    // Check if user owns the file
    if (file.user_id !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to modify this file' });
    }

    // Toggle is_public status
    const newStatus = !file.is_public;
    
    await pool.execute(
      'UPDATE files SET is_public = ? WHERE id = ?',
      [newStatus, req.params.id]
    );

    res.json({ 
      id: file.id,
      is_public: newStatus,
      message: `File is now ${newStatus ? 'public' : 'private'}`
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  upload,
  uploadFile,
  getMyFiles,
  getFileById,
  downloadFile,
  deleteFile,
  toggleFilePublic
};