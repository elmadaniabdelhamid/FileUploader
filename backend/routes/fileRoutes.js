const express = require('express');
const { 
  upload,
  uploadFile,
  getMyFiles,
  getFileById,
  downloadFile,
  deleteFile,
  toggleFilePublic
} = require('../controllers/fileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all routes
router.use(protect);

// File routes
router.post('/upload', upload.single('file'), uploadFile);
router.get('/', getMyFiles);
router.get('/:id', getFileById);
router.get('/:id/download', downloadFile);
router.delete('/:id', deleteFile);
router.patch('/:id/toggle-public', toggleFilePublic);

module.exports = router;