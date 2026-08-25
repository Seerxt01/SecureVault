const User = require("../models/User");
const AuditLog = require("../models/AuditLog");

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    return res.status(200).json({ users });
  } catch (err) {
    console.error("getAllUsers error:", err.message);
    return res.status(500).json({ message: "Server error fetching users" });
  }
};

// GET /api/admin/logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .limit(100); // most recent 100 - keeps the response light
    return res.status(200).json({ logs });
  } catch (err) {
    console.error("getAuditLogs error:", err.message);
    return res.status(500).json({ message: "Server error fetching audit logs" });
  }
};

module.exports = { getAllUsers, getAuditLogs };