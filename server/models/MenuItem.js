const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      // A Ghanaian restaurant menu — feel free to add more!
      enum: [
        "Local Dishes",
        "Grills",
        "Fast Food",
        "Drinks",
        "Desserts",
        "Sides",
      ],
      required: true,
    },
    image: {
      type: String, // We'll store the image URL from Cloudinary here
    },
    isAvailable: {
      type: Boolean,
      default: true, // Items are available by default
    },
    isFeatured: {
      type: Boolean,
      default: false, // Featured items show on the homepage
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("MenuItem", menuItemSchema);
