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

// Import our custom PDF parser module
// This module will extract text from PDF files
const { parsePDF } = require('./parser');

// Create an Express application
const app = express();

// Define the port to run the server on
// We're using port 3002 since 3001 is already in use
const PORT = 3002;

// Enable CORS - this allows our frontend (running on a different port) to communicate with the backend
app.use(cors());

// Configure Express to handle larger JSON payloads
// The default limit is 100kb, which is too small for large PDF texts
app.use(express.json({ limit: '50mb' }));

// Configure Express to handle larger URL-encoded payloads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Define a route for the root path
app.get('/', (req, res) => {
  res.send('Policy Decoder API is running!');
});

// Define the /analyze endpoint that accepts POST requests
// The 'file' parameter in upload.single() must match the field name in the FormData from the frontend
app.post('/analyze', upload.single('file'), async (req, res) => {
  try {
    // Check if a file was provided
    if (!req.file) {
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    // Log information about the uploaded file
    console.log('Received file:', req.file.originalname);
    console.log('Saved as:', req.file.filename);
    console.log('Size:', req.file.size, 'bytes');

    // Get the insurance type from the request body
    const insuranceType = req.body.insuranceType;
    if (!insuranceType) {
      return res.status(400).json({ status: 'error', message: 'Insurance type is required' });
    }

    // Use our PDF parser to extract text from the uploaded file
    const extractedText = await parsePDF(req.file.path);
    
    // Log a sample of the extracted text
    console.log('Extracted text sample:', extractedText.substring(0, 100) + '...');

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
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
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
      
      console.log('Successfully analyzed policy:', policyData.name);
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError);
      return res.status(500).json({ 
        status: 'error', 
        message: 'Failed to parse policy data',
        rawResponse: completion.choices[0].message.content
      });
    }

    // Return the analyzed policy data
    res.status(200).json({ 
      status: 'success', 
      policyData: policyData,
      rawText: extractedText.substring(0, 1000) + '...' // Include a sample of the raw text for debugging
    });

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
    
    console.log('Received question:', question);
    console.log('Policy ID:', policyId);
    
    // Check if the policy exists in storage
    if (!policyStorage[policyId]) {
      return res.status(404).json({
        status: 'error',
        message: 'Policy not found'
      });
    }
    
    // Get the policy data
    const policyData = policyStorage[policyId];
    
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
      model: 'gpt-4o',
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