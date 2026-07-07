const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateTokenAndSetCookie = require('../utils/generateToken');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email and password');
  }

  const userExists = await User.findOne({ email: email.toLowerCase() });
  if (userExists) {
    res.status(400);
    throw new Error('A user with this email already exists');
  }

  const user = await User.create({ name, email, password });
  const token = generateTokenAndSetCookie(res, user._id);

  res.status(201).json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated');
  }

  const token = generateTokenAndSetCookie(res, user._id);

  res.json({
    success: true,
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

// @desc    Log out user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, message: 'Logged out successfully' });
});

// @desc    Get current user's profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// @desc    Update current user's profile (name, password, addresses)
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');

  user.name = req.body.name || user.name;
  if (req.body.email) user.email = req.body.email;
  if (req.body.password) user.password = req.body.password;
  if (req.body.addresses) user.addresses = req.body.addresses;

  const updated = await user.save();

  res.json({
    success: true,
    user: { _id: updated._id, name: updated.name, email: updated.email, role: updated.role, addresses: updated.addresses },
  });
});

module.exports = { registerUser, loginUser, logoutUser, getMe, updateMe };
