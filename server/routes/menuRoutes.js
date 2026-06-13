const express = require("express");
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getFeaturedItems,
} = require("../controllers/menuController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Public routes — anyone can view the menu
router.get("/", getMenuItems);
router.get("/featured", getFeaturedItems);
router.get("/:id", getMenuItem);

// Admin only routes — must be logged in AND be an admin
router.post("/", protect, adminOnly, createMenuItem);
router.put("/:id", protect, adminOnly, updateMenuItem);
router.delete("/:id", protect, adminOnly, deleteMenuItem);

module.exports = router;
