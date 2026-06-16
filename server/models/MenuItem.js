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
    // Instead of a single price, we now have an array of size/price options
    options: [
      {
        label: {
          type: String,
          required: true,
          trim: true, // e.g. "Small", "Regular", "Family Size"
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    category: {
      type: String,
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
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

menuItemSchema.index({ category: 1 });

module.exports = mongoose.model("MenuItem", menuItemSchema);
