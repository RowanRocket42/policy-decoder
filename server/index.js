// Import required packages
// Express is a web application framework for Node.js that simplifies building web applications
const express = require('express');

// CORS (Cross-Origin Resource Sharing) allows web applications on one domain to make requests to another domain
const cors = require('cors');

// Multer is a middleware for handling multipart/form-data, primarily used for uploading files
const multer = require('multer');

// Path module provides utilities for working with file and directory paths
const path = require('path');

// File System module allows you to work with the file system on your computer
const fs = require('fs');

// dotenv loads environment variables from a .env file into process.env
// This allows us to store sensitive information like API keys securely
require('dotenv').config();

// Import OpenAI for making API calls to GPT models
// This library provides a simple interface to the OpenAI API
const OpenAI = require('openai');

// Create an instance of the OpenAI client with your API key from environment variables
// Environment variables help keep sensitive data like API keys out of your code
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // This reads the API key from the .env file
});

// Verify OpenAI API key is set
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
  console.error('WARNING: OpenAI API key is not properly set. Please check your .env file.');
}

// Import our custom PDF parser module
// This module will extract text from PDF files
const { parsePDF } = require('./parser');

// Create an Express application
const app = express();

// Define the port to run the server on
// We're using the PORT from the .env file, or 3002 as a fallback
const PORT = process.env.PORT || 3002;

// Enable CORS - this allows our frontend (running on a different port) to communicate with the backend
// Update CORS configuration to restrict access to specific origins
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-production-domain.com'] // Restrict to specific domains in production
    : ['http://localhost:3000', 'http://localhost:3001'], // Allow local development domains
  methods: ['GET', 'POST'], // Restrict to necessary HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Configure Express to handle larger JSON payloads
// The default limit is 100kb, which is too small for large PDF texts
app.use(express.json({ limit: '50mb' }));

// Configure Express to handle larger URL-encoded payloads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Enforce HTTPS in production
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
  console.log('HTTPS enforcement enabled for production environment');
}

// API Authentication middleware
const authenticateApiKey = (req, res, next) => {
  // Skip authentication for the root path
  if (req.path === '/') {
    return next();
  }

  const apiKey = req.header('X-API-Key');
  
  // Check if API key is provided and matches the one in environment variables
  if (!apiKey || apiKey !== process.env.API_KEY) {
    console.log('Authentication failed: Invalid or missing API key');
    return res.status(401).json({ 
      status: 'error', 
      message: 'Unauthorized: Invalid or missing API key' 
    });
  }
  
  next();
};

// Apply authentication middleware to all routes
app.use(authenticateApiKey);

// Create a temporary directory for storing uploaded files if it doesn't exist
const uploadDir = path.join(__dirname, 'temp-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
// Multer is middleware that handles file uploads
const storage = multer.diskStorage({
  // Set the destination where files will be saved
  destination: function(req, file, cb) {
    cb(null, uploadDir);
  },
  // Set the filename - here we're using the original filename
  filename: function(req, file, cb) {
    // Create a unique filename using timestamp to avoid overwriting files
    const uniqueFilename = Date.now() + '-' + file.originalname;
    cb(null, uniqueFilename);
  }
});

// Create a multer instance with our storage configuration
// This will be used as middleware for handling file uploads
const upload = multer({ 
  storage: storage,
  // File filter to only allow PDFs
  fileFilter: function(req, file, cb) {
    // Check if the file is a PDF
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'), false);
    }
    cb(null, true);
  },
  // Limit file size to 10MB
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// In-memory storage for policy data
// In a production environment, this would be replaced with a database
const policyStorage = {};

// Track active sessions for cleanup
const activeSessions = new Map();

// Function to delete policy data after session ends
const cleanupPolicyData = (policyId) => {
  console.log(`Cleaning up policy data for ID: ${policyId}`);
  
  // Delete the policy data from memory
  if (policyStorage[policyId]) {
    delete policyStorage[policyId];
    console.log(`Deleted policy data for ID: ${policyId} from memory`);
  }
  
  // Remove from active sessions
  activeSessions.delete(policyId);
};

// Set up a session timeout (e.g., 30 minutes of inactivity)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

// Define a route for the root path
app.get('/', (req, res) => {
  res.send('Policy Decoder API is running!');
});

/**
 * GET /privacy-policy endpoint
 * 
 * This endpoint returns the privacy policy for the application,
 * explaining how user data is handled.
 */
app.get('/privacy-policy', (req, res) => {
  const privacyPolicy = {
    title: "Policy Decoder Privacy Policy",
    lastUpdated: "2023-07-01",
    sections: [
      {
        title: "Data Collection",
        content: "We collect the insurance policy documents that you upload for analysis."
      },
      {
        title: "Data Processing",
        content: "Your uploaded documents are processed using OpenAI's API. The text content of your documents is sent to OpenAI for analysis. By using this service, you consent to this processing."
      },
      {
        title: "Data Storage",
        content: "Your policy data is stored temporarily in memory and is automatically deleted after 30 minutes of inactivity. We do not permanently store your documents or their content."
      },
      {
        title: "Data Security",
        content: "We implement various security measures to protect your data, including secure file handling and prompt deletion of uploaded files after processing."
      },
      {
        title: "Third-Party Services",
        content: "We use OpenAI's API to analyze your documents. Please refer to OpenAI's privacy policy for information on how they handle data."
      },
      {
        title: "Your Rights",
        content: "You have the right to withhold consent for AI processing and to request immediate deletion of your data by ending your session."
      }
    ]
  };
  
  res.status(200).json(privacyPolicy);
});

// Define the /analyze endpoint that accepts POST requests
// The 'file' parameter in upload.single() must match the field name in the FormData from the frontend
app.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    // Check if a file was provided
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    // Log information about the uploaded file (more secure logging)
    console.log('Received file upload request');
    console.log('File size:', req.file.size, 'bytes');
    // Don't log the full filename as it might contain sensitive information
    
    // Get the insurance type from the request body
    const insuranceType = req.body.insuranceType;
    if (!insuranceType) {
      return res.status(400).json({ status: 'error', message: 'Insurance type is required' });
    }
    
    // Check for user consent to process data with OpenAI
    const userConsent = req.body.userConsent === 'true';
    if (!userConsent) {
      // If there's no consent, clean up the uploaded file
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }
      
      return res.status(400).json({ 
        status: 'error', 
        message: 'User consent is required to process the document with AI' 
      });
    }

    // Use our PDF parser to extract text from the uploaded file
    const extractedText = await parsePDF(req.file.path);
    
    // Log a sanitized message about text extraction (don't log content)
    console.log('Text extraction complete. Character count:', extractedText.length);

    // Create a prompt for OpenAI to analyze the policy
    const maxPdfTextLength = 8000;
    const truncatedPdfText = extractedText.substring(0, maxPdfTextLength);
    
    const prompt = `
      I have the following text extracted from a ${insuranceType} insurance policy PDF document:
      
      ${truncatedPdfText}
      
      ${extractedText.length > maxPdfTextLength ? '... [text truncated due to length] ...' : ''}
      
      Please analyze this policy and extract the following information in JSON format:
      1. name: The name of the policy (use the filename if not found in text: ${req.file.originalname})
      2. type: The type of insurance (${insuranceType})
      3. covered: An array of 5-7 key things that are covered by this policy
      4. notCovered: An array of 5-7 key exclusions or things not covered
      5. limits: An array of 5-7 key limits, deductibles, or conditions
      6. contact: An object with phone, email, and website (if found in the document, otherwise use placeholder values)
      
      Return ONLY the JSON object without any additional text or explanation.
    `;

    console.log('Sending policy text to OpenAI for analysis...');
    
    // Call the OpenAI API to analyze the policy
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an AI assistant that specializes in analyzing insurance policies. Extract structured data from policy documents in the exact JSON format requested.' 
          },
          { role: 'user', content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.5,
      });

      // Extract the policy data from the OpenAI response
      let policyData;
      try {
        // Parse the JSON response
        const responseContent = completion.choices[0].message.content;
        policyData = JSON.parse(responseContent);
        
        // Add an ID to the policy data
        policyData.id = `${insuranceType}-${Date.now()}`;
        
        // Store the policy data in memory
        policyStorage[policyData.id] = policyData;
        
        // Store the full text for chat functionality
        policyStorage[policyData.id].fullText = extractedText;
        
        // Add to active sessions with a timeout for cleanup
        const timeoutId = setTimeout(() => {
          cleanupPolicyData(policyData.id);
        }, SESSION_TIMEOUT);
        
        activeSessions.set(policyData.id, {
          timeoutId,
          lastActivity: Date.now()
        });
        
        console.log('Successfully analyzed policy:', policyData.name);
        console.log('Policy data will be automatically deleted after inactivity');
      } catch (jsonError) {
        console.error('Error parsing OpenAI response:', jsonError);
        return res.status(500).json({ 
          status: 'error', 
          message: 'Error processing the policy data' 
        });
      }

      // Return the analyzed policy data
      res.status(200).json({ 
        status: 'success', 
        policyData: policyData,
        rawText: extractedText.substring(0, 1000) + '...' // Include a sample of the raw text for debugging
      });
    } catch (openaiError) {
      console.error('Error calling OpenAI API:', openaiError);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Error analyzing the policy with AI. Please check your OpenAI API key.' 
      });
    }

  } catch (error) {
    console.error('Error processing PDF:', error);
    
    // If there was an error, try to clean up the file if it exists
    if (req.file && req.file.path && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({ status: 'error', message: error.message });
  }
});

/**
 * POST /chat endpoint
 * 
 * This endpoint accepts a question and policy ID, retrieves the policy data,
 * and uses OpenAI's GPT-4o to generate an answer based on the policy content.
 * 
 * Request body should contain:
 * - question: The user's question about the policy
 * - policyId: The ID of the policy to reference
 * 
 * Response will contain:
 * - status: 'success' or 'error'
 * - answer: The AI-generated response to the question
 * - message: Error message if applicable
 */
app.post('/chat', async (req, res) => {
  try {
    // Extract question and policyId from the request body
    const { question, policyId } = req.body;
    
    // Validate that both question and policyId are provided
    if (!question || !policyId) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Both question and policyId are required' 
      });
    }
    
    // Secure logging - don't log the actual question content
    console.log('Received chat request for policy ID:', policyId);
    console.log('Question length:', question.length, 'characters');
    
    // Check if the policy exists in storage
    if (!policyStorage[policyId]) {
      return res.status(404).json({
        status: 'error',
        message: 'Policy not found'
      });
    }
    
    // Get the policy data
    const policyData = policyStorage[policyId];
    
    // Refresh the session timeout
    if (activeSessions.has(policyId)) {
      // Clear the existing timeout
      clearTimeout(activeSessions.get(policyId).timeoutId);
      
      // Set a new timeout
      const timeoutId = setTimeout(() => {
        cleanupPolicyData(policyId);
      }, SESSION_TIMEOUT);
      
      // Update the session data
      activeSessions.set(policyId, {
        timeoutId,
        lastActivity: Date.now()
      });
      
      console.log(`Refreshed session timeout for policy ID: ${policyId}`);
    }

    // Create a prompt for the OpenAI API that includes the policy data and the question
    const prompt = `
      I have the following insurance policy data:
      
      Policy Name: ${policyData.name}
      Policy Type: ${policyData.type}
      
      What's Covered:
      ${policyData.covered.map(item => `- ${item}`).join('\n')}
      
      What's Not Covered:
      ${policyData.notCovered.map(item => `- ${item}`).join('\n')}
      
      Limits & Conditions:
      ${policyData.limits.map(item => `- ${item}`).join('\n')}
      
      Contact Information:
      - Phone: ${policyData.contact.phone}
      - Email: ${policyData.contact.email}
      - Website: ${policyData.contact.website}
      
      Based on this policy information, please answer the following question:
      ${question}
      
      Please provide a concise and accurate answer based only on the information provided about this policy.
      If the information needed to answer the question is not available in the policy data, please state that clearly.
    `;
    
    console.log('Sending question to OpenAI...');
    
    // Call the OpenAI API to generate a response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful insurance assistant that answers questions about insurance policies. Provide accurate, concise answers based only on the policy information provided.' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    
    // Extract the answer from the OpenAI response
    const answer = completion.choices[0].message.content;
    
    console.log('Generated answer for question');
    
    // Return the answer
    res.status(200).json({
      status: 'success',
      answer: answer
    });
    
  } catch (error) {
    console.error('Error processing chat request:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /policy/:policyId endpoint
 * 
 * This endpoint retrieves policy data by ID from the in-memory storage.
 * In a production environment, this would fetch from a database.
 * 
 * URL parameters:
 * - policyId: The ID of the policy to retrieve
 * 
 * Response will contain:
 * - status: 'success' or 'error'
 * - policyData: The policy data if found
 * - message: Error message if applicable
 */
app.get('/policy/:policyId', (req, res) => {
  try {
    const { policyId } = req.params;
    
    // Check if the policy exists in storage
    if (policyStorage[policyId]) {
      res.status(200).json({
        status: 'success',
        policyData: policyStorage[policyId]
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Policy not found'
      });
    }
  } catch (error) {
    console.error('Error retrieving policy:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * POST /end-session endpoint
 * 
 * This endpoint allows clients to explicitly end a session and clean up policy data.
 * 
 * Request body should contain:
 * - policyId: The ID of the policy to clean up
 * 
 * Response will contain:
 * - status: 'success' or 'error'
 * - message: Success or error message
 */
app.post('/end-session', (req, res) => {
  try {
    const { policyId } = req.body;
    
    if (!policyId) {
      return res.status(400).json({
        status: 'error',
        message: 'Policy ID is required'
      });
    }
    
    // Check if the policy exists
    if (!policyStorage[policyId] && !activeSessions.has(policyId)) {
      return res.status(404).json({
        status: 'error',
        message: 'Policy not found'
      });
    }
    
    // Clean up the policy data
    cleanupPolicyData(policyId);
    
    res.status(200).json({
      status: 'success',
      message: 'Session ended and policy data deleted'
    });
  } catch (error) {
    console.error('Error ending session:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * DELETE /policy/:policyId endpoint
 * 
 * This endpoint allows users to explicitly delete their policy data.
 * 
 * URL parameters:
 * - policyId: The ID of the policy to delete
 * 
 * Response will contain:
 * - status: 'success' or 'error'
 * - message: Success or error message
 */
app.delete('/policy/:policyId', (req, res) => {
  try {
    const { policyId } = req.params;
    
    // Check if the policy exists in storage
    if (!policyStorage[policyId]) {
      return res.status(404).json({
        status: 'error',
        message: 'Policy not found'
      });
    }
    
    // Clean up the policy data
    cleanupPolicyData(policyId);
    
    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'Policy data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting policy:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Something went wrong!'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test the API`);
});

// List of npm packages required for this server:
/*
 * express - Web framework for Node.js
 * cors - Middleware to enable CORS
 * multer - Middleware for handling multipart/form-data (file uploads)
 * pdf2json - Library for parsing PDF files and extracting text
 * dotenv - Load environment variables from .env file
 * openai - Official OpenAI API client for Node.js
 * 
 * These packages can be installed using:
 * npm install express cors multer pdf2json dotenv openai
 */ 