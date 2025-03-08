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

    // Use our PDF parser to extract text from the uploaded file
    // This is an asynchronous operation, so we use await to wait for it to complete
    const extractedText = await parsePDF(req.file.path);
    
    // Log a sample of the extracted text (first 100 characters)
    console.log('Extracted text sample:', extractedText.substring(0, 100) + '...');

    // Return the extracted text in the response
    // Note: The parsePDF function already deletes the file after processing
    res.status(200).json({ 
      status: 'success', 
      text: extractedText 
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
 * This endpoint accepts a question and PDF text, then uses OpenAI's GPT-3.5-turbo
 * to generate an answer based on the PDF content.
 * 
 * Request body should contain:
 * - question: The user's question about the PDF
 * - pdfText: The text extracted from the PDF
 * 
 * Response will contain:
 * - answer: The AI-generated response to the question
 */
app.post('/chat', async (req, res) => {
  try {
    // Extract question and pdfText from the request body
    const { question, pdfText } = req.body;
    
    // Validate that both question and pdfText are provided
    if (!question || !pdfText) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Both question and pdfText are required' 
      });
    }
    
    console.log('Received question:', question);
    console.log('PDF text length:', pdfText.length, 'characters');
    
    // Create a prompt for the OpenAI API that includes both the PDF text and the question
    // This helps the AI understand the context and provide a relevant answer
    // We're limiting the text to 8000 characters (about 2000 tokens) to avoid token limits
    // and reduce the request size
    const maxPdfTextLength = 8000;
    const truncatedPdfText = pdfText.substring(0, maxPdfTextLength);
    
    const prompt = `
      I have the following text extracted from a PDF document:
      
      ${truncatedPdfText}
      
      ${pdfText.length > maxPdfTextLength ? '... [text truncated due to length] ...' : ''}
      
      Based on this document, please answer the following question:
      ${question}
      
      Please provide a concise and accurate answer based only on the information in the document.
    `;
    
    // Call the OpenAI API to generate a response
    // async/await is used here to handle the asynchronous API call
    // - async marks this as an asynchronous function that returns a Promise
    // - await pauses execution until the Promise is resolved
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Using GPT-4o as requested by the user
      messages: [
        { role: 'system', content: 'You are a helpful assistant that answers questions about PDF documents.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500, // Limit the response length
      temperature: 0.7, // Controls randomness: lower is more deterministic
    });
    
    // Extract the answer from the API response
    const answer = completion.choices[0].message.content;
    
    console.log('Generated answer:', answer.substring(0, 100) + '...');
    
    // Return the answer in the response
    res.status(200).json({ 
      status: 'success', 
      answer: answer 
    });
    
  } catch (error) {
    // Handle any errors that occur during processing
    console.error('Error generating answer:', error);
    
    // Check if it's an OpenAI API error and log detailed information
    if (error.response) {
      console.error('OpenAI API error status:', error.response.status);
      console.error('OpenAI API error data:', JSON.stringify(error.response.data, null, 2));
      console.error('OpenAI API error headers:', JSON.stringify(error.response.headers, null, 2));
    } else if (error.message) {
      console.error('Error message:', error.message);
    }
    
    // Return an error response with more details to help debugging
    res.status(500).json({ 
      status: 'error', 
      message: error.message || 'Error generating answer',
      details: error.response ? error.response.data : null
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