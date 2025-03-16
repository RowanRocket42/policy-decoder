const mongoose = require('mongoose');

/**
 * Message Schema
 * 
 * Defines the structure for chat messages in the database.
 * Stores the conversation history between users and the AI about specific policies.
 */
const MessageSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  policyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Policy',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  role: { 
    type: String, 
    enum: ['user', 'assistant'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  metadata: {
    tokens: Number,
    processingTime: Number,
    aiModel: String
  }
});

// Create a compound index for efficient querying of messages by session
MessageSchema.index({ sessionId: 1, timestamp: 1 });

// Create an index for finding a user's messages across all policies
MessageSchema.index({ userId: 1, timestamp: -1 });

// Create an index for finding messages related to a specific policy
MessageSchema.index({ policyId: 1, timestamp: -1 });

/**
 * Export the Message model
 */
module.exports = mongoose.model('Message', MessageSchema); 