const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const Sentry = require("@sentry/node");
const { generalLimiter, authLimiter } = require("./middleware/rateLimiter");

dotenv.config();

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
});

const app = express();

app.use(
  cors({
    origin: ["http://localhost:5173", "https://iva-kitchen.vercel.app"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(generalLimiter);

// ─── Routes ─────────────────────────────────────────────

app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/auth", authLimiter, require("./routes/passwordRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/cart", require("./routes/cartRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reservations", require("./routes/reservationRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));

// ─── Test route ──────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("Iva Kitchen API is running!");
});

// Sentry error handler - must come first after all routes, before other error middleware
Sentry.setupExpressErrorHandler(app);

// ─── Start Server ────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected!");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.log("Connection failed:", err);
  }
};

startServer();
