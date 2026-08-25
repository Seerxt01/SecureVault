const User = require("../models/User");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-passwordHash");
    return res.status(200).json({ users });
  } catch (err) {
    console.error("getAllUsers error:", err.message);
    return res.status(500).json({ message: "Server error fetching users" });
  }
};

module.exports = { getAllUsers };