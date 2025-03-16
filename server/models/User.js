const mongoose = require('mongoose');

/**
 * User Schema
 * 
 * Defines the structure for user accounts in the database.
 * Includes authentication information, profile details, and subscription status.
 */
const UserSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true,
    lowercase: true
  },
  password: { 
    type: String, 
    required: true 
  },
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  lastLogin: {
    type: Date,
    default: null
  },
  subscription: {
    plan: { 
      type: String, 
      enum: ['free', 'basic', 'premium', 'enterprise'], 
      default: 'free' 
    },
    status: { 
      type: String, 
      enum: ['active', 'canceled', 'past_due'], 
      default: 'active' 
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date
});

/**
 * Export the User model
 */
module.exports = mongoose.model('User', UserSchema); 