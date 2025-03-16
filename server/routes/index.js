/**
 * Routes Index
 * 
 * This file exports all API routes for easy importing in the main server file.
 */

const userRoutes = require('./userRoutes');
const policyRoutes = require('./policyRoutes');
const chatRoutes = require('./chatRoutes');

module.exports = (app) => {
  // User routes for authentication and profile management
  app.use('/api/users', userRoutes);
  
  // Policy routes for document management
  app.use('/api/policies', policyRoutes);
  
  // Chat routes for AI interaction
  app.use('/api/chat', chatRoutes);
  
  // Fallback route for undefined routes
  app.use('*', (req, res) => {
    res.status(404).json({
      status: 'error',
      message: 'Route not found'
    });
  });
}; 