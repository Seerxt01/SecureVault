const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN_SUCCESS",
        "LOGIN_FAILED",
        "REGISTER",
        "FILE_UPLOAD",
        "FILE_DOWNLOAD",
        "FILE_DELETE",
        "UNAUTHORIZED_ACCESS",
      ],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // null for failed logins where we don't know who it was yet
    },
    username: {
      type: String, // stored directly too, so logs stay readable even if the user is later deleted
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    details: {
      type: String, // short human-readable context, e.g. filename, or failure reason
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);