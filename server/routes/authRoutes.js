const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  promoteToAdmin,
} = require("../controllers/authController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// POST /api/auth/register
router.post("/register", registerUser);

// POST /api/auth/login
router.post("/login", loginUser);

// GET /api/auth/profile  ← protected, must be logged in
router.get("/profile", protect, getProfile);

router.put("/profile", protect, updateProfile);

// promote to Admin
router.put("/promote", protect, adminOnly, promoteToAdmin);

module.exports = router;
