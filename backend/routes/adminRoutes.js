const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/roleMiddleware");
const { getAllUsers } = require("../controllers/adminController");

router.get("/users", protect, authorize("admin"), getAllUsers);

module.exports = router;