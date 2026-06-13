const Reservation = require("../models/Reservation");

// ─── CREATE RESERVATION ──────────────────────────────────
const createReservation = async (req, res) => {
  try {
    const { name, phone, date, time, guests, specialRequests } = req.body;

    const reservation = await Reservation.create({
      user: req.user._id,
      name,
      phone,
      date,
      time,
      guests,
      specialRequests,
    });

    res.status(201).json(reservation);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── GET MY RESERVATIONS ─────────────────────────────────
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ user: req.user._id }).sort({
      date: 1,
    });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── GET ALL RESERVATIONS (admin) ────────────────────────
const getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("user", "name email")
      .sort({ date: 1 });
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── UPDATE RESERVATION STATUS (admin) ───────────────────
const updateReservationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true },
    );
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── CANCEL RESERVATION (customer) ───────────────────────
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }

    if (reservation.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    reservation.status = "Cancelled";
    await reservation.save();
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getAllReservations,
  updateReservationStatus,
  cancelReservation,
};
