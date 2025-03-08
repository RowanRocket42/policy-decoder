// Import required packages
// Express is a web application framework for Node.js
const express = require('express');
// CORS is a node.js package for providing a middleware that can be used to enable CORS
const cors = require('cors');
// body-parser extracts the entire body portion of an incoming request stream and exposes it on req.body
const bodyParser = require('body-parser');
// dotenv loads environment variables from a .env file into process.env
require('dotenv').config();

// Create an Express application
const app = express();

// Define the port to run the server on
// Use the PORT environment variable if it exists, otherwise use 5000
const PORT = process.env.PORT || 5000;

// Middleware setup
// Enable CORS - this allows our frontend to communicate with the backend
app.use(cors());
// Parse JSON bodies (as sent by API clients)
app.use(bodyParser.json());
// Parse URL-encoded bodies (as sent by HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
// This is a simple route that responds with a JSON object
app.get('/api/hello', (req, res) => {
  // Send a response with status 200 (OK) and a JSON object
  res.status(200).json({
    message: 'Hello from the Policy Decoder server!'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}/api/hello to test the API`);
});

// Error handling middleware
// This will catch any errors that occur in our routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
}); 