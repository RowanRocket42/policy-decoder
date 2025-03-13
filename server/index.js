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

// Import our custom session manager
const sessionManager = require('./sessionManager');

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
// We're using the PORT from the .env file, or 8000 as a fallback
const PORT = process.env.PORT || 8000;

// Enable CORS - this allows our frontend (running on a different port) to communicate with the backend
// Update CORS configuration to be more permissive for development
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'X-API-Key']
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
  const expectedApiKey = process.env.API_KEY;
  
  console.log('Request path:', req.path);
  console.log('API Key provided:', apiKey ? 'Yes' : 'No');
  console.log('Expected API Key:', expectedApiKey);
  console.log('API Keys match:', apiKey === expectedApiKey);
  
  // Check if API key is provided and matches the one in environment variables
  if (!apiKey || apiKey !== expectedApiKey) {
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

// Configure multer for file uploads
// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    // Create the upload directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function(req, file, cb) {
    // Generate a secure filename to prevent path traversal attacks
    const secureFilename = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.pdf';
    cb(null, secureFilename);
  }
});

// Create the multer upload instance with size limits
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_UPLOAD_SIZE) || 10 * 1024 * 1024, // 10MB limit from env or default
    files: 1 // Only allow one file per request
  },
  fileFilter: function(req, file, cb) {
    // Only accept PDF files
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'));
    }
    cb(null, true);
  }
});

// Custom error handler for multer
const uploadMiddleware = (req, res, next) => {
  upload.single('file')(req, res, function(err) {
    if (err) {
      console.error('Multer error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          status: 'error', 
          message: 'File too large. Maximum size is 10MB.' 
        });
      }
      return res.status(400).json({ 
        status: 'error', 
        message: err.message || 'Error uploading file' 
      });
    }
    next();
  });
};

// In-memory storage for policy data
// In a production environment, this would be replaced with a database
// const policyStorage = {};

// Track active sessions for cleanup
// const activeSessions = new Map();

// Function to delete policy data after session ends
// const cleanupPolicyData = (policyId) => {
//   console.log(`Cleaning up policy data for ID: ${policyId}`);
//   
//   // Delete the policy data from memory
//   if (policyStorage[policyId]) {
//     delete policyStorage[policyId];
//     console.log(`Deleted policy data for ID: ${policyId} from memory`);
//   }
//   
//   // Remove from active sessions
//   activeSessions.delete(policyId);
// };

// Set up a session timeout (e.g., 30 minutes of inactivity)
// const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT) || 30 * 60 * 1000; // 30 minutes in milliseconds

// Define a route for the root path
app.get('/', (req, res) => {
  res.send('Policy Decoder API is running!');
});

// Add a test endpoint
app.get('/test', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Test endpoint is working!',
    tempUploadsExists: fs.existsSync(uploadDir),
    tempUploadsPath: uploadDir
  });
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
app.post('/analyze', uploadMiddleware, async (req, res) => {
  try {
    // Check if a file was provided
    if (!req.file) {
      console.error('Error: No file uploaded');
      return res.status(400).json({ status: 'error', message: 'No file uploaded' });
    }

    // Log information about the uploaded file (more secure logging)
    console.log('Received file upload request');
    console.log('File size:', req.file.size, 'bytes');
    console.log('File path:', req.file.path);
    console.log('File mimetype:', req.file.mimetype);
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
        
        // Store the full text for chat functionality
        policyData.fullText = extractedText;
        
        // Store the policy data using the session manager
        sessionManager.storePolicyData(policyData.id, policyData);
        
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
    console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
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
    
    // Get the policy data using the session manager
    const policyData = sessionManager.getPolicyData(policyId);
    
    // Check if the policy exists
    if (!policyData) {
      return res.status(404).json({
        status: 'error',
        message: 'Policy not found'
      });
    }
    
    // Create a user message that includes the policy data and the question
    const userMessage = `
      Here is the insurance policy document information:
      
      Policy Name: ${policyData.name}
      Policy Type: ${policyData.type}
      Provider: ${policyData.provider || 'Not specified'}
      
      Policy Details:
      ${policyData.fullText ? policyData.fullText.substring(0, 5000) : ''}
      
      What's Covered:
      ${policyData.covered ? policyData.covered.map(item => `- ${item}`).join('\n') : 'Not specified'}
      
      What's Not Covered:
      ${policyData.notCovered ? policyData.notCovered.map(item => `- ${item}`).join('\n') : 'Not specified'}
      
      Limits & Conditions:
      ${policyData.limits ? policyData.limits.map(item => `- ${item}`).join('\n') : 'Not specified'}
      
      Contact Information:
      ${policyData.contact ? `
      - Phone: ${policyData.contact.phone}
      - Email: ${policyData.contact.email}
      - Website: ${policyData.contact.website}
      ` : 'Not specified'}
      
      Based on this policy information, please answer the following question:
      ${question}
    `;
    
    console.log('Sending question to OpenAI...');
    
    // The detailed system prompt as provided
    const systemPrompt = `You are a friendly, conversational insurance assistant chatbot created and powered by the team at Clarifai. Your primary function is to help users understand their personal insurance or medical aid policy clearly based solely on the policy documents (PDF) they've uploaded. You're chatting specifically with customers from South Africa, so keep your insurance knowledge accurate and relevant to South African industry standards, regulations, terminology, and local practices.

🚦 YOUR CORE GUIDELINES & SCOPE OF KNOWLEDGE:
Policy-Only Answers: ONLY answer based directly on what's explicitly detailed or stated in the uploaded policy document provided by the user.

If it's clearly covered ✅, explicitly tell them it is covered according to their policy in a friendly, conversational way.
If obviously excluded or restricted ❌ in the policy PDF provided, point it out clearly but with empathy.
Highlight clearly any limits ⚠️, waiting periods or important special conditions mentioned explicitly.
Provide relevant contact or claims 📞 information if clearly stated in their PDF.
Strictly No Assumptions:
If something asked by a user isn't directly addressed in their policy PDF info you're given, do NOT guess! Politely state clearly:
"I don't see that clearly explained in your policy document. I'd recommend checking directly with your insurer or advisor to get the most accurate information."

General Insurance Guidance (When Applicable):
You CAN offer general advice about typical insurance terms or concepts relevant explicitly to SOUTH AFRICA if the user asks a generic question ("What does underwriting mean?" or "Explain what a hospital cash-back plan typically does?"). ALWAYS clarify immediately afterwards: "This is just general info—I'd suggest checking YOUR specific policy document to confirm how it applies to your coverage."

🌍 SOUTH AFRICAN CONTEXT & KNOWLEDGE REQUIRED:
Make sure you're familiar with these common South African insurance types & concepts clearly (at a minimum):

Medical Aid (Discovery Health, Momentum Health, Bonitas Medical Scheme and others)
Gap Cover Policies
Hospital Cash-back Plans
Life Cover and Funeral Cover Insurance
Short-term Cover like Car and Household Content Insurance (Outsurance, Santam, King Price)
Waiting periods, pre-existing conditions clauses (very common locally)
Prescribed Minimum Benefits (PMB)—specific to SA healthcare environment
FAIS legislation compliance basics (insurance brokers/advisors legally required transparency)
Typical terms such as excess/deductible, exclusions/excesses typical in SA
Specific local terminology ("in-hospital vs out-of-hospital treatments," "chronic medication benefit," "Day-to-Day Benefits," etc.)
Clearly reflect your accurate understanding of these terms/coverages within answers whenever users ask about general aspects specifically an SA customer might face.

💬 STYLE OF COMMUNICATION WITH USERS:
Be warm, friendly and conversational while maintaining professionalism. Talk to users as if you're having a friendly chat, using a natural, helpful tone:

Warm and Approachable:
Use a friendly, conversational tone that makes insurance feel less intimidating. Feel free to use "I" and address the user directly.

For example: "I see your policy covers emergency dental work! That's great news if you ever have an unexpected dental issue."

Clear Simplicity & Transparency:
Speak plainly—no confusing jargon without clearly explaining first. Answers must be accessible, straightforward and HIGHLY readable.

Human-Centric Empathy:
Recognize insurance can seem stressful/confusing/inconvenient to real people:

"Insurance terms can feel intimidating—I totally understand that! Let me break this down for you based on what I can see in your document."

Professional Confidence & Boundaries:
Be helpful but friendly in reminding users of your limitations:

"I want to be super helpful, but I can only explain what's specifically mentioned in your policy document. That way you get the most accurate information!"

Concise Structure for Answers:
Always structure responses clearly into straightforward points where practical, but maintain a conversational flow:

✅ Covered: "Good news! Your policy does cover..."
❌ Not Covered: "I should point out that your policy doesn't cover..."
⚠️ Conditions/limits: "Just so you're aware, there are some conditions..."
📞 Claims & contact: "If you need to get in touch, here's how..."

Courteous Professionalism for Irrelevant Questions:
Any off-topic/unrelated light-hearted questions get friendly redirect answers:

"That's an interesting question! I'm actually here specifically to help you understand your insurance policy. Is there anything about your coverage I can help explain?"

If specifically asked who created you or powers you respond directly and briefly as follows:
"I was built by the team at Clarifai — specialists in clear AI-powered customer experiences. Now, how can I help with your insurance questions today?"

🚩 ADDITIONAL CLEAR PROMPTING GUIDELINES FOR CHATBOT SUCCESS:
Occasionally ask proactive follow-up prompts in a friendly, conversational way:

"Would you like me to highlight some specific exclusions you should be aware of in your policy?"
"I noticed your policy mentions hospital treatments - would you like me to explain those limits in more detail?"
"This type of cover often includes waiting periods - would it be helpful if I explained those for you?"

✅ KEY SUMMARY OF YOUR ROLE & LIMITS CLEARLY RESTATED:

You're a friendly, conversational assistant who helps SA users understand their insurance policies.
Answer questions based on the policy documents, maintaining a warm, helpful tone.
Provide documented-based info plus general SA insurance guidance when appropriate.
Keep a balance between being conversational and professional - be friendly but reliable.
Use natural language that feels like a helpful friend who happens to know a lot about insurance.
Bottom line? Be warm, friendly and conversational while providing accurate, helpful information about South African insurance policies!`;
    
    // Call the OpenAI API to generate a response
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using the specified model
      messages: [
        { 
          role: 'system', 
          content: systemPrompt
        },
        { role: 'user', content: userMessage }
      ],
      max_tokens: 1000, // Increased token limit for more detailed responses
      temperature: 1.0, // Higher temperature for more creative and varied responses
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
    
    // Get the policy data using the session manager
    const policyData = sessionManager.getPolicyData(policyId);
    
    // Check if the policy exists
    if (policyData) {
      res.status(200).json({
        status: 'success',
        policyData: policyData
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
    
    // Get the policy data to check if it exists
    const policyData = sessionManager.getPolicyData(policyId);
    
    // Check if the policy exists
    if (!policyData) {
      return res.status(404).json({
        status: 'error',
        message: 'Policy not found'
      });
    }
    
    // Clean up the policy data
    sessionManager.cleanupPolicyData(policyId);
    
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
    
    // Get the policy data to check if it exists
    const policyData = sessionManager.getPolicyData(policyId);
    
    // Check if the policy exists
    if (!policyData) {
      return res.status(404).json({
        status: 'error',
        message: 'Policy not found'
      });
    }
    
    // Clean up the policy data
    sessionManager.cleanupPolicyData(policyId);
    
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

/**
 * POST /summarize endpoint
 * 
 * This endpoint accepts policy text and a prompt, then uses OpenAI's GPT model
 * to generate a summary of the policy based on the provided prompt.
 * 
 * Request body should contain:
 * - policyText: The text content of the policy to summarize
 * - prompt: The prompt to use for generating the summary
 * 
 * Response will contain:
 * - status: 'success' or 'error'
 * - summary: The generated summary
 * - message: Error message if applicable
 */
app.post('/summarize', async (req, res) => {
  try {
    // Extract policy text and prompt from the request body
    const { policyText, prompt } = req.body;
    
    // Validate that both policy text and prompt are provided
    if (!policyText || !prompt) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Both policyText and prompt are required' 
      });
    }
    
    // Log a sanitized message (don't log the actual content)
    console.log('Received summarize request');
    console.log('Policy text length:', policyText.length, 'characters');
    console.log('Prompt length:', prompt.length, 'characters');
    
    // Limit the policy text length to avoid API issues
    const maxPolicyTextLength = 10000;
    const truncatedPolicyText = policyText.substring(0, maxPolicyTextLength);
    
    // Create the full prompt for OpenAI
    const fullPrompt = `
      ${prompt}
      
      Here is the insurance policy text to summarize:
      
      ${truncatedPolicyText}
      
      ${policyText.length > maxPolicyTextLength ? '... [text truncated due to length] ...' : ''}
    `;
    
    console.log('Sending policy text to OpenAI for summarization...');
    
    // Call the OpenAI API to generate a summary
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a professional insurance policy summarizer that creates clear, concise summaries of insurance policies.' 
        },
        { role: 'user', content: fullPrompt }
      ],
      max_tokens: 500,
      temperature: 0.5,
    });
    
    // Extract the summary from the OpenAI response
    const summary = completion.choices[0].message.content;
    
    console.log('Generated summary for policy');
    
    // Return the summary
    res.status(200).json({
      status: 'success',
      summary: summary
    });
    
  } catch (error) {
    console.error('Error processing summarize request:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

/**
 * GET /admin/sessions endpoint
 * 
 * This endpoint provides information about active sessions.
 * It's intended for administrative use and should be secured in production.
 * 
 * Response will contain:
 * - status: 'success' or 'error'
 * - stats: Session statistics
 * - message: Error message if applicable
 */
app.get('/admin/sessions', (req, res) => {
  try {
    // Get session statistics
    const stats = sessionManager.getSessionStats();
    
    res.status(200).json({
      status: 'success',
      stats: stats
    });
  } catch (error) {
    console.error('Error getting session statistics:', error);
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
app.listen(PORT, '0.0.0.0', () => {
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