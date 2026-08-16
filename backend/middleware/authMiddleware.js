const jwt = require("jsonwebtoken");

// Protects a route: rejects the request unless a valid access token is present
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization; // expected format: "Bearer <token>"

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No access token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded; // { id, username, role } - available to any route after this middleware
    next();
  } catch (err) {
    // Covers both an expired token and a tampered/invalid one
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};

module.exports = { protect };