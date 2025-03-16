const express = require('express');
const router = express.Router();
const { Policy } = require('../models');
const { parsePDF } = require('../parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../temp-uploads');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'policy-' + uniqueSuffix + ext);
  }
});

// Create upload middleware
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept only PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

/**
 * @route   POST /api/policies/upload
 * @desc    Upload a new policy document
 * @access  Private
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'No file uploaded' 
      });
    }

    // Get user ID from request (this would come from authentication middleware)
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'User ID is required' 
      });
    }

    // Parse the PDF file
    const filePath = req.file.path;
    const policyText = await parsePDF(filePath);

    // Create policy name from original filename
    const originalFilename = req.file.originalname;
    const policyName = originalFilename.replace('.pdf', '');

    // Create new policy document
    const newPolicy = new Policy({
      userId,
      name: policyName,
      fullText: policyText,
      originalFilename
    });

    // Save policy to database
    await newPolicy.save();

    // Clean up the temporary file
    fs.unlinkSync(filePath);

    res.status(201).json({
      status: 'success',
      message: 'Policy uploaded successfully',
      policy: {
        id: newPolicy._id,
        name: newPolicy.name,
        uploadDate: newPolicy.uploadDate
      }
    });
  } catch (error) {
    console.error('Error uploading policy:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error during policy upload' 
    });
  }
});

/**
 * @route   GET /api/policies/:policyId
 * @desc    Get a specific policy
 * @access  Private
 */
router.get('/:policyId', async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.policyId);
    
    if (!policy) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'Policy not found' 
      });
    }

    // Update last accessed time
    policy.lastAccessed = Date.now();
    await policy.save();

    res.json({
      status: 'success',
      policyData: policy
    });
  } catch (error) {
    console.error('Error fetching policy:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error fetching policy' 
    });
  }
});

/**
 * @route   GET /api/policies/user/:userId
 * @desc    Get all policies for a user
 * @access  Private
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const policies = await Policy.find({ userId: req.params.userId })
      .select('_id name type provider uploadDate lastAccessed')
      .sort({ lastAccessed: -1 });
    
    res.json({
      status: 'success',
      policies
    });
  } catch (error) {
    console.error('Error fetching user policies:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error fetching policies' 
    });
  }
});

module.exports = router; 