const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/authMiddleware");

const { loginLimiter, registerLimiter } = require("../middleware/rateLimiter");
const { validate, registerValidationRules, loginValidationRules } = require("../middleware/validators");

router.post("/register", registerLimiter, registerValidationRules, validate, registerUser);
router.post("/login", loginLimiter, loginValidationRules, validate, loginUser);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logoutUser);
router.get("/me", protect, getMe); // protect middleware runs first - blocks the request if the token is missing/invalid

module.exports = router;


// Replace your existing register/login lines with:
