/**
 * Models Index
 * 
 * This file exports all database models for easy importing throughout the application.
 * Instead of importing each model individually, you can import them all from this file.
 * 
 * Example:
 * const { User, Policy, Message } = require('./models');
 */

const User = require('./User');
const Policy = require('./Policy');
const Message = require('./Message');

module.exports = {
  User,
  Policy,
  Message
}; 