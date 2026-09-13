const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'aura_spatial_cosmic_jwt_super_secret_key_2026_x89!';
const TOKEN_EXPIRY = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
};

// Helper to set auth cookie
const setAuthCookie = (res, token) => {
  res.cookie('aura_jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE
  });
};

// In-memory fallback store for development when MongoDB is not connected yet
const memoryUsers = new Map();
const bcrypt = require('bcryptjs');

/**
 * POST /api/auth/signup
 * Create a new user account (MongoDB with seamless fallback)
 */
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide name, email, and password.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const existingUser = await User.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const user = await User.create({
        name: name.trim(),
        email: cleanEmail,
        password
      });

      const token = generateToken(user);
      setAuthCookie(res, token);

      return res.status(201).json({
        status: 'success',
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      });
    } else {
      // In-memory fallback
      if (memoryUsers.has(cleanEmail)) {
        return res.status(400).json({ error: 'An account with this email already exists.' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const tempUser = {
        _id: 'usr_' + Date.now(),
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword
      };
      memoryUsers.set(cleanEmail, tempUser);

      const token = generateToken(tempUser);
      setAuthCookie(res, token);

      return res.status(201).json({
        status: 'success',
        user: {
          id: tempUser._id,
          name: tempUser.name,
          email: tempUser.email
        },
        token
      });
    }
  } catch (error) {
    console.error('Signup Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create account.' });
  }
});

/**
 * POST /api/auth/login
 * Authenticate user and issue JWT cookie
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = generateToken(user);
      setAuthCookie(res, token);

      return res.json({
        status: 'success',
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      });
    } else {
      // In-memory fallback
      const user = memoryUsers.get(cleanEmail);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const token = generateToken(user);
      setAuthCookie(res, token);

      return res.json({
        status: 'success',
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        token
      });
    }
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: error.message || 'Login failed.' });
  }
});

/**
 * GET /api/auth/me
 * Auto-login verification endpoint
 */
router.get('/me', async (req, res) => {
  try {
    let token = req.cookies?.aura_jwt;

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ status: 'unauthorized', user: null });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      res.clearCookie('aura_jwt');
      return res.status(401).json({ status: 'unauthorized', user: null, error: 'Token expired or invalid' });
    }

    if (mongoose.connection.readyState === 1) {
      let user = null;
      if (mongoose.Types.ObjectId.isValid(decoded.id)) {
        user = await User.findById(decoded.id).select('-password');
      } else if (decoded.email) {
        user = await User.findOne({ email: decoded.email }).select('-password');
      }

      if (!user) {
        res.clearCookie('aura_jwt');
        return res.status(401).json({ status: 'unauthorized', user: null });
      }
      return res.json({
        status: 'success',
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      });
    } else {
      // Return decoded session
      return res.json({
        status: 'success',
        user: {
          id: decoded.id,
          name: decoded.name,
          email: decoded.email
        }
      });
    }
  } catch (error) {
    console.error('Auth Check Error:', error);
    return res.status(500).json({ error: 'Session verification failed.' });
  }
});

/**
 * POST /api/auth/logout
 * Clear session cookie
 */
router.post('/logout', (req, res) => {
  res.clearCookie('aura_jwt', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  });
  return res.json({ status: 'success', message: 'Logged out successfully.' });
});

module.exports = router;
