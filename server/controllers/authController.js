const User = require("../models/User");
const jwt = require("jsonwebtoken");

// Helper function — generates a token for a user
const generateToken = (id) => {
  return jwt.sign(
    { id }, // what we store inside the token
    process.env.JWT_SECRET, // the secret key to sign it with
    { expiresIn: "7d" }, // token expires after 7 days
  );
};

// ─── REGISTER ───────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    // 1. Pull the data the user sent us
    const { name, email, password, phone, role } = req.body;

    // 2. Check if someone already registered with this email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }

    // 3. Create the new user
    // Note: password gets scrambled automatically by our pre-save hook
    const user = await User.create({ name, email, password, phone, role });

    // 4. Send back the user info + a token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── LOGIN ──────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    // 1. Pull email and password from request
    const { email, password } = req.body;

    // 2. Find the user by email
    const user = await User.findOne({ email });

    // 3. Check user exists AND password matches
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 4. Send back user info + token
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── GET LOGGED IN USER'S PROFILE ───────────────────────
const getProfile = async (req, res) => {
  // req.user is set by our protect middleware
  res.json(req.user);
};

// ─── UPDATE PROFILE ──────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    // Find the user and update — req.user._id comes from the protect middleware
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only update fields that were actually sent
    if (name) user.name = name;
    if (phone) user.phone = phone;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { registerUser, loginUser, getProfile, updateProfile };
