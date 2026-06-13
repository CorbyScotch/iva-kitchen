const MenuItem = require("../models/MenuItem");

// ─── GET ALL MENU ITEMS ──────────────────────────────────
const getMenuItems = async (req, res) => {
  try {
    // req.query lets us filter — e.g. /api/menu?category=Grills
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const items = await MenuItem.find(filter);
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── GET SINGLE MENU ITEM ───────────────────────────────
const getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── CREATE MENU ITEM (admin only) ──────────────────────
const createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── UPDATE MENU ITEM (admin only) ──────────────────────
const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }, // return the updated version, not the old one
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── DELETE MENU ITEM (admin only) ──────────────────────
const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── GET FEATURED ITEMS (for homepage) ──────────────────
const getFeaturedItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ isFeatured: true });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getFeaturedItems,
};
