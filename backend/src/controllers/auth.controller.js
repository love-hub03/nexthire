const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('REGISTER ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

   const googleAuth = async (req, res) => {
  try {
    const { name, email, googleId, avatar } = req.body;
    let user = await User.findOne({ email });
    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      user = await User.create({
        name,
        email,
        password: googleId + process.env.JWT_SECRET,
        avatar
      });
      const Profile = require('../models/profile.model');
      await Profile.create({ user: user._id });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Google login successful',
      token,
      isNewUser,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('GET ME ERROR:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const googleAuth = async (req, res) => {
  try {
    const { name, email, googleId, avatar } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        password: googleId + process.env.JWT_SECRET,
        avatar
      });
      const Profile = require('../models/profile.model');
      await Profile.create({ user: user._id });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Google login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, googleAuth };
