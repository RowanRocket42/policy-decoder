/**
 * Session Manager Module
 * 
 * This module provides session management functionality for the Policy Decoder application.
 * It handles storing, retrieving, and cleaning up policy data.
 * 
 * In production, this can be extended to use a database like Redis or MongoDB.
 */

// Import required packages
const fs = require('fs');
require('dotenv').config();

// Get session timeout from environment variables or use default (30 minutes)
const SESSION_TIMEOUT = parseInt(process.env.SESSION_TIMEOUT) || 30 * 60 * 1000;

// In-memory storage for policy data (for development)
const policyStorage = {};

// Track active sessions for cleanup
const activeSessions = new Map();

/**
 * Store policy data in the session
 * 
 * @param {string} policyId - The ID of the policy
 * @param {Object} policyData - The policy data to store
 * @returns {void}
 */
function storePolicyData(policyId, policyData) {
  // Store the policy data
  policyStorage[policyId] = policyData;
  
  // Set up a timeout for cleanup
  const timeoutId = setTimeout(() => {
    cleanupPolicyData(policyId);
  }, SESSION_TIMEOUT);
  
  // Add to active sessions
  activeSessions.set(policyId, {
    timeoutId,
    lastActivity: Date.now()
  });
  
  console.log(`Stored policy data for ID: ${policyId}`);
  console.log(`Policy data will be automatically deleted after ${SESSION_TIMEOUT / 60000} minutes of inactivity`);
}

/**
 * Get policy data from the session
 * 
 * @param {string} policyId - The ID of the policy
 * @returns {Object|null} - The policy data or null if not found
 */
function getPolicyData(policyId) {
  // Check if the policy exists
  if (!policyStorage[policyId]) {
    return null;
  }
  
  // Refresh the session timeout
  refreshSession(policyId);
  
  // Return the policy data
  return policyStorage[policyId];
}

/**
 * Refresh the session timeout for a policy
 * 
 * @param {string} policyId - The ID of the policy
 * @returns {boolean} - True if the session was refreshed, false otherwise
 */
function refreshSession(policyId) {
  // Check if the session exists
  if (!activeSessions.has(policyId)) {
    return false;
  }
  
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
  return true;
}

/**
 * Clean up policy data after session ends
 * 
 * @param {string} policyId - The ID of the policy to clean up
 * @returns {void}
 */
function cleanupPolicyData(policyId) {
  console.log(`Cleaning up policy data for ID: ${policyId}`);
  
  // Delete the policy data from memory
  if (policyStorage[policyId]) {
    delete policyStorage[policyId];
    console.log(`Deleted policy data for ID: ${policyId} from memory`);
  }
  
  // Remove from active sessions
  if (activeSessions.has(policyId)) {
    clearTimeout(activeSessions.get(policyId).timeoutId);
    activeSessions.delete(policyId);
  }
}

/**
 * Get all active sessions
 * 
 * @returns {Array} - Array of active session IDs
 */
function getActiveSessions() {
  return Array.from(activeSessions.keys());
}

/**
 * Get session statistics
 * 
 * @returns {Object} - Session statistics
 */
function getSessionStats() {
  return {
    activeSessions: activeSessions.size,
    sessionIds: Array.from(activeSessions.keys()),
    sessionDetails: Array.from(activeSessions.entries()).map(([id, session]) => ({
      id,
      lastActivity: new Date(session.lastActivity).toISOString(),
      idleTime: Math.round((Date.now() - session.lastActivity) / 1000) + ' seconds'
    }))
  };
}

// Export the functions
module.exports = {
  storePolicyData,
  getPolicyData,
  refreshSession,
  cleanupPolicyData,
  getActiveSessions,
  getSessionStats
}; 