const bcrypt = require("bcrypt");
const User = require("../models/User");

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "username, email, and password are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: "Username or email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const newUser = await User.create({ username, email, passwordHash });

    // Never return passwordHash to the client
    return res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, username: newUser.username, email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    console.error("registerUser error:", err.message);
    return res.status(500).json({ message: "Server error during registration" });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "username and password are required" });
    }

    const user = await User.findOne({ username });

    // Deliberately vague error - don't reveal whether the username exists.
    // This is a security detail worth mentioning in an interview.
    const invalidCredsMsg = { message: "Invalid username or password" };

    if (!user) {
      return res.status(401).json(invalidCredsMsg);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json(invalidCredsMsg);
    }

    // Day 2 will replace this response with an actual JWT access + refresh token pair.
    return res.status(200).json({
      message: "Login successful (JWT issuance arrives on Day 2)",
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("loginUser error:", err.message);
    return res.status(500).json({ message: "Server error during login" });
  }
};

module.exports = { registerUser, loginUser };