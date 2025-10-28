const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// -------------------- Register -------------------- //
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    console.log("📩 Register request received:", { username, email });

    // Check if user exists
    const existing = await User.findOne({ email });
    if (existing) {
      console.log("⚠️ Email already exists:", email);
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ username, email, password: hashedPassword });
    console.log("✅ User created successfully:", user._id);

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      user: { id: user._id, username, email, coins: user.coins },
      token
    });
  } catch (err) {
    console.error("❌ Register error:", err); // 👈 This line shows full backend error
    res.status(500).json({ message: 'Error registering user', error: err.message });
  }
};

// -------------------- Login -------------------- //
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔑 Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("🚫 No user found for email:", email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      console.log("❌ Wrong password for:", email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    console.log("✅ Login successful for:", email);
    res.json({
      user: { id: user._id, username: user.username, email: user.email, coins: user.coins },
      token
    });
  } catch (err) {
    console.error("🔥 Login failed:", err); // 👈 Add this line
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
};

// -------------------- Get current user -------------------- //
const getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    console.error("❌ getMe error:", err);
    res.status(500).json({ message: 'Failed to fetch user', error: err.message });
  }
};

// -------------------- Update profile -------------------- //
const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { username, email, password } = req.body;

    if (username) user.username = username;
    if (email) user.email = email;
    if (password) user.password = await bcrypt.hash(password, 10);

    await user.save();

    console.log("🧾 Profile updated for:", user.email);
    res.json({ user });
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
