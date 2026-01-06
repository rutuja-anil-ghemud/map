const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'nexgen_portal'
};

let db;

async function connectDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Connected to MySQL database');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// API Routes

// Get all departments
app.get('/api/departments', async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM departments');
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get department by code
app.get('/api/departments/:code', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT d.*, f.name as hod_name, f.qualifications, f.research_areas FROM departments d LEFT JOIN faculty f ON d.hod_email = f.email WHERE d.code = ?',
      [req.params.code]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }
    
    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Submit application
app.post('/api/applications', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('program').notEmpty().withMessage('Program is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, phone, program } = req.body;
    
    // Check if email already exists
    const [existing] = await db.execute('SELECT id FROM students WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Insert student
    const [result] = await db.execute(
      'INSERT INTO students (name, email, phone, program, progress_percentage) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, program, 25]
    );

    // Create application record
    await db.execute(
      'INSERT INTO applications (student_id, academic_year) VALUES (?, ?)',
      [result.insertId, '2024-25']
    );

    res.json({ 
      success: true, 
      message: 'Application submitted successfully',
      studentId: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get application status
app.get('/api/applications/:studentId', async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT s.*, a.entrance_score, a.interview_date, a.interview_score, a.final_status, a.remarks 
       FROM students s 
       LEFT JOIN applications a ON s.id = a.student_id 
       WHERE s.id = ?`,
      [req.params.studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    res.json({ success: true, data: rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Upload documents
app.post('/api/upload/:studentId', upload.array('documents', 5), async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No files uploaded' });
    }

    // Save file info to database
    for (const file of files) {
      await db.execute(
        'INSERT INTO documents (student_id, document_name, document_path, document_type) VALUES (?, ?, ?, ?)',
        [studentId, file.originalname, file.path, file.mimetype]
      );
    }

    // Update progress
    await db.execute(
      'UPDATE students SET progress_percentage = LEAST(progress_percentage + 25, 75) WHERE id = ?',
      [studentId]
    );

    res.json({ 
      success: true, 
      message: 'Documents uploaded successfully',
      files: files.map(f => ({ name: f.originalname, size: f.size }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get student documents
app.get('/api/documents/:studentId', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT document_name, document_type, upload_date FROM documents WHERE student_id = ?',
      [req.params.studentId]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get faculty by department
app.get('/api/faculty/:departmentId', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM faculty WHERE department_id = ?',
      [req.params.departmentId]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get dashboard stats
app.get('/api/stats', async (req, res) => {
  try {
    const [totalStudents] = await db.execute('SELECT COUNT(*) as count FROM students');
    const [totalDepartments] = await db.execute('SELECT COUNT(*) as count FROM departments');
    const [totalFaculty] = await db.execute('SELECT COUNT(*) as count FROM faculty');
    const [acceptedApplications] = await db.execute('SELECT COUNT(*) as count FROM applications WHERE final_status = "accepted"');

    const stats = {
      totalStudents: totalStudents[0].count,
      totalDepartments: totalDepartments[0].count,
      totalFaculty: totalFaculty[0].count,
      acceptanceRate: totalStudents[0].count > 0 ? Math.round((acceptedApplications[0].count / totalStudents[0].count) * 100) : 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Update application status (Admin endpoint)
app.put('/api/applications/:studentId/status', async (req, res) => {
  try {
    const { status, progress } = req.body;
    
    await db.execute(
      'UPDATE students SET application_status = ?, progress_percentage = ? WHERE id = ?',
      [status, progress, req.params.studentId]
    );

    res.json({ success: true, message: 'Status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Search students
app.get('/api/students/search', async (req, res) => {
  try {
    const { query } = req.query;
    const [rows] = await db.execute(
      'SELECT id, name, email, program, application_status, progress_percentage FROM students WHERE name LIKE ? OR email LIKE ?',
      [`%${query}%`, `%${query}%`]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File too large' });
    }
  }
  res.status(500).json({ success: false, error: error.message });
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();
// CET-based application submission
app.post('/api/cet-applications', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('cetScore').isInt({min: 1, max: 200}).withMessage('Valid CET score required'),
  body('cetRank').isInt({min: 1}).withMessage('Valid CET rank required'),
  body('program').notEmpty().withMessage('Program is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, cetScore, cetRank, program } = req.body;
    
    // Check eligibility based on CET cutoffs
    const [cutoffRows] = await db.execute(
      'SELECT general_rank_cutoff FROM cet_cutoffs WHERE department_code = ? AND academic_year = ?',
      [program.toUpperCase(), '2024-25']
    );
    
    const isEligible = cutoffRows.length > 0 && parseInt(cetRank) <= cutoffRows[0].general_rank_cutoff;
    
    // Check if email already exists
    const [existing] = await db.execute('SELECT id FROM students WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Insert student with CET details
    const [result] = await db.execute(
      'INSERT INTO students (name, email, cet_score, cet_rank, program, is_eligible, progress_percentage) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, cetScore, cetRank, program, isEligible, isEligible ? 25 : 0]
    );

    // Create application record
    await db.execute(
      'INSERT INTO applications (student_id, academic_year, entrance_score) VALUES (?, ?, ?)',
      [result.insertId, '2024-25', cetScore]
    );

    res.json({ 
      success: true, 
      message: isEligible ? 'CET application submitted successfully' : 'Application submitted but not eligible for selected program',
      studentId: result.insertId,
      eligible: isEligible
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get CET cutoffs
app.get('/api/cet-cutoffs/:year?', async (req, res) => {
  try {
    const year = req.params.year || '2024-25';
    const [rows] = await db.execute(
      'SELECT c.*, d.name as department_name FROM cet_cutoffs c JOIN departments d ON c.department_code = d.code WHERE c.academic_year = ?',
      [year]
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get syllabus by department
app.get('/api/syllabus/:deptCode?', async (req, res) => {
  try {
    const deptCode = req.params.deptCode;
    let query = 'SELECT * FROM syllabus';
    let params = [];
    
    if (deptCode) {
      query += ' WHERE department_code = ?';
      params.push(deptCode.toUpperCase());
    }
    
    query += ' ORDER BY department_code, semester, subject_name';
    
    const [rows] = await db.execute(query, params);
    
    // Group by department and semester
    const groupedSyllabus = {};
    rows.forEach(row => {
      if (!groupedSyllabus[row.department_code]) {
        groupedSyllabus[row.department_code] = {};
      }
      if (!groupedSyllabus[row.department_code][row.semester]) {
        groupedSyllabus[row.department_code][row.semester] = [];
      }
      groupedSyllabus[row.department_code][row.semester].push(row);
    });
    
    res.json({ success: true, data: groupedSyllabus });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Document verification endpoints
app.post('/api/verify-document/:studentId', upload.single('document'), async (req, res) => {
  try {
    const studentId = req.params.studentId;
    const { documentType } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, error: 'No document uploaded' });
    }

    // Simulate AI verification (in real app, integrate with AI service)
    const aiConfidence = Math.random() * 40 + 60; // 60-100% confidence
    const verificationStatus = aiConfidence > 80 ? 'ai_verified' : 'pending';

    // Save document info
    await db.execute(
      'INSERT INTO documents (student_id, document_name, document_path, document_type) VALUES (?, ?, ?, ?)',
      [studentId, file.originalname, file.path, documentType]
    );

    // Save verification record
    await db.execute(
      'INSERT INTO document_verification (student_id, document_type, verification_status, ai_confidence_score, verification_date) VALUES (?, ?, ?, ?, NOW())',
      [studentId, documentType, verificationStatus, aiConfidence]
    );

    // Update student progress
    await db.execute(
      'UPDATE students SET progress_percentage = LEAST(progress_percentage + 15, 90) WHERE id = ?',
      [studentId]
    );

    res.json({ 
      success: true, 
      message: 'Document uploaded and verified',
      verificationStatus,
      aiConfidence: Math.round(aiConfidence)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get verification status
app.get('/api/verification-status/:studentId', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM document_verification WHERE student_id = ? ORDER BY verification_date DESC',
      [req.params.studentId]
    );

    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get helpline contacts
app.get('/api/helpline', async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT * FROM helpline_contacts WHERE is_active = TRUE ORDER BY contact_type'
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PREC-specific stats
app.get('/api/prec-stats', async (req, res) => {
  try {
    const [totalApplications] = await db.execute('SELECT COUNT(*) as count FROM students');
    const [eligibleApplications] = await db.execute('SELECT COUNT(*) as count FROM students WHERE is_eligible = TRUE');
    const [verifiedDocuments] = await db.execute('SELECT COUNT(*) as count FROM document_verification WHERE verification_status IN ("ai_verified", "manually_verified")');
    const [totalDepartments] = await db.execute('SELECT COUNT(*) as count FROM departments');

    const stats = {
      totalApplications: totalApplications[0].count,
      eligibleApplications: eligibleApplications[0].count,
      verifiedDocuments: verifiedDocuments[0].count,
      totalDepartments: totalDepartments[0].count,
      eligibilityRate: totalApplications[0].count > 0 ? Math.round((eligibleApplications[0].count / totalApplications[0].count) * 100) : 0
    };

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Check CET eligibility
app.post('/api/check-eligibility', async (req, res) => {
  try {
    const { cetRank, program, category = 'general' } = req.body;
    
    const cutoffColumn = `${category}_rank_cutoff`;
    const [rows] = await db.execute(
      `SELECT ${cutoffColumn} as cutoff FROM cet_cutoffs WHERE department_code = ? AND academic_year = ?`,
      [program.toUpperCase(), '2024-25']
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Cutoff data not found' });
    }
    
    const isEligible = parseInt(cetRank) <= rows[0].cutoff;
    
    res.json({
      success: true,
      data: {
        eligible: isEligible,
        cutoff: rows[0].cutoff,
        rank: cetRank,
        program: program,
        category: category
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});