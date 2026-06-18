const Order = require("../models/Order");
const Cart = require("../models/Cart");
const axios = require("axios");

// ─── CREATE ORDER ────────────────────────────────────────
const createOrder = async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress, phone } = req.body;

    const order = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      deliveryAddress,
      phone,
    });

    // Clear the cart after placing the order
    await Cart.findOneAndDelete({ user: req.user._id });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── GET MY ORDERS (customer) ────────────────────────────
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── GET SINGLE ORDER ────────────────────────────────────
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email",
    );
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Customers can only see their own orders
    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── GET ALL ORDERS (admin only) ─────────────────────────
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── UPDATE ORDER STATUS (admin only) ───────────────────
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── UPDATE PAYMENT STATUS (verified server-side) ───────
const updatePaymentStatus = async (req, res) => {
  try {
    const { paystackReference } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Ask Paystack directly — don't trust the frontend's claim
    const verifyRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${paystackReference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      },
    );

    const paymentData = verifyRes.data.data;

    // Must actually say "success"
    if (paymentData.status !== "success") {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    // Must match the amount we expected — prevents underpayment tampering
    const expectedAmount = Math.round(order.totalAmount * 100);
    if (paymentData.amount !== expectedAmount) {
      return res.status(400).json({ message: "Payment amount mismatch" });
    }

    // Prevent marking the same order as paid twice (e.g. accidental double calls)
    if (order.paymentStatus === "Paid") {
      return res.json(order); // already paid, just return it as-is
    }

    order.paymentStatus = "Paid";
    order.paystackReference = paystackReference;
    await order.save();

    res.json(order);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Payment verification error", error: err.message });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  updatePaymentStatus,
};
