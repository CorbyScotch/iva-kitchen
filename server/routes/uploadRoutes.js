const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const cloudinary = require("../config/cloudinary");

router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // req.file.buffer holds the raw image data sitting in memory.
      // Cloudinary's upload function expects either a file path OR a special
      // "data URI" string. We convert the raw buffer into that format here.
      const base64Image = req.file.buffer.toString("base64");
      const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;

      // Now we manually upload that data straight to Cloudinary ourselves
      const result = await cloudinary.uploader.upload(dataUri, {
        folder: "zila-kitchen-menu",
        transformation: [{ width: 800, height: 800, crop: "limit" }],
      });

      // Cloudinary's response includes "secure_url" — the permanent HTTPS link
      res.json({ imageUrl: result.secure_url });
    } catch (err) {
      res.status(500).json({ message: "Upload failed", error: err.message });
    }
  },
);

module.exports = router;
