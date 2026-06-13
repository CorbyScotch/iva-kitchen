const Cart = require("../models/Cart");

// ─── GET USER'S CART ─────────────────────────────────────
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.json({ items: [] }); // empty cart is fine
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── ADD ITEM TO CART ────────────────────────────────────
const addToCart = async (req, res) => {
  try {
    const { menuItem, name, price, image, quantity } = req.body;

    // Find the user's existing cart, or start a fresh one
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // No cart yet — create one with this first item
      cart = new Cart({
        user: req.user._id,
        items: [{ menuItem, name, price, image, quantity }],
      });
    } else {
      // Cart exists — check if this item is already in it
      const existingItem = cart.items.find(
        (item) => item.menuItem.toString() === menuItem,
      );

      if (existingItem) {
        // Item already in cart — just increase the quantity
        existingItem.quantity += quantity;
      } else {
        // New item — push it into the cart
        cart.items.push({ menuItem, name, price, image, quantity });
      }
    }

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── UPDATE ITEM QUANTITY ────────────────────────────────
const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // req.params.itemId is the ID of the specific cart item
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── REMOVE ITEM FROM CART ───────────────────────────────
const removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Filter out the item we want to remove
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId,
    );

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── CLEAR ENTIRE CART ───────────────────────────────────
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
