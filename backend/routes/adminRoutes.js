const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { getAllUsers, getAuditLogs } = require("../controllers/adminController");

router.get("/users", protect, authorize("admin"), getAllUsers);
router.get("/logs", protect, authorize("admin"), getAuditLogs);

module.exports = router;