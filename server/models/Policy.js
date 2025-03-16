const mongoose = require('mongoose');

/**
 * Policy Schema
 * 
 * Defines the structure for insurance policy documents in the database.
 * Includes the policy content, metadata, and relationship to the user who uploaded it.
 */
const PolicySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  type: { 
    type: String,
    enum: ['health', 'car', 'home', 'life', 'travel', 'business', 'other'],
    default: 'other'
  },
  provider: {
    type: String,
    trim: true
  },
  uploadDate: { 
    type: Date, 
    default: Date.now 
  },
  lastAccessed: { 
    type: Date, 
    default: Date.now 
  },
  fullText: { 
    type: String, 
    required: true 
  },
  metadata: {
    covered: [String],
    notCovered: [String],
    limits: [String],
    excess: String,
    premium: String,
    startDate: Date,
    endDate: Date,
    contact: {
      phone: String,
      email: String,
      website: String
    }
  },
  // Store the original filename
  originalFilename: String,
  
  // Track if the policy has been processed by AI
  processed: {
    type: Boolean,
    default: false
  }
});

/**
 * Export the Policy model
 */
module.exports = mongoose.model('Policy', PolicySchema); 