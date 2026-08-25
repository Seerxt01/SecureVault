const AuditLog = require("../models/AuditLog");

// Never let a logging failure break the actual request - always fire-and-forget with a catch
const logAction = async ({ action, user = null, username = null, req = null, details = null }) => {
  try {
    await AuditLog.create({
      action,
      user,
      username,
      ipAddress: req ? req.ip : null,
      details,
    });
  } catch (err) {
    console.error("Audit log write failed:", err.message);
  }
};

module.exports = logAction;