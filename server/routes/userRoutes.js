const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcryptjs');

/**
 * @route   POST /api/users/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'User with this email already exists' 
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword
    });

    // Save user to database
    await newUser.save();

    // Return success without sending back the password
    const userResponse = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      subscription: newUser.subscription,
      createdAt: newUser.createdAt
    };

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error during registration' 
    });
  }
});

/**
 * @route   POST /api/users/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid credentials' 
      });
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'Invalid credentials' 
      });
    }

    // Update last login time
    user.lastLogin = Date.now();
    await user.save();

    // Return user data without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      subscription: user.subscription,
      lastLogin: user.lastLogin
    };

    res.json({
      status: 'success',
      message: 'Login successful',
      user: userResponse
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error during login' 
    });
  }
});

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ 
        status: 'error', 
        message: 'User not found' 
      });
    }

    res.json({
      status: 'success',
      user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error fetching profile' 
    });
  }
});

module.exports = router; 