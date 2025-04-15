const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const { pool } = require('./config/db');


// Load environment variables
dotenv.config();

// Database connection
const { testConnection, initializeDatabase } = require('./config/db');

// Route imports
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const { errorHandler } = require('./middleware/errorMiddleware');

// Create Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Create uploads directory if it doesn't exist
const uploadsDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize database
(async () => {
  await testConnection();
  await initializeDatabase();
})();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

// Then the test route will work:
app.get('/api/test-db', async (req, res) => {
    try {
      const [rows] = await pool.execute('SELECT 1 as test');
      res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Database test error:', error);
      res.status(500).json({ success: false, error: error.message });
    }
});

// Error handling middleware
app.use(errorHandler);

module.exports = app;