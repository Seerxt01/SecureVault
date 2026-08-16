const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateAccessToken, generateRefreshToken } = require("../utils/generateTokens");

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12;

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true, // JavaScript in the browser can never read this cookie - blocks XSS token theft
  secure: false, // set to true once deployed behind HTTPS
  sameSite: "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches the refresh token's own expiry
};

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
    const invalidCredsMsg = { message: "Invalid username or password" };

    if (!user) {
      return res.status(401).json(invalidCredsMsg);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json(invalidCredsMsg);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Refresh token: httpOnly cookie, invisible to JS - the browser sends it automatically
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    // Access token: sent in the response body - the frontend stores this in memory (not localStorage)
    return res.status(200).json({
      message: "Login successful",
      accessToken,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    console.error("loginUser error:", err.message);
    return res.status(500).json({ message: "Server error during login" });
  }
};

// POST /api/auth/refresh
// Called by the frontend when the access token expires, to get a new one without re-logging in
const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    const newAccessToken = generateAccessToken(user);

    return res.status(200).json({
      accessToken: newAccessToken,
      user: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

// POST /api/auth/logout
const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);
  return res.status(200).json({ message: "Logged out successfully" });
};

// GET /api/auth/me - a protected route, only reachable with a valid access token
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ user });
  } catch (err) {
    console.error("getMe error:", err.message);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser, getMe };