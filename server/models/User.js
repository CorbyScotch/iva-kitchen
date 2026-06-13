const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// This is the "form template" for a user
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, // can't create a user without a name
      trim: true, // removes accidental spaces at start/end
    },
    email: {
      type: String,
      required: true,
      unique: true, // no two users can have the same email
      lowercase: true, // always store email in lowercase
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["customer", "admin"], // role can ONLY be one of these two
      default: "customer", // new users are customers by default
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt fields
  },
);

// Before saving a user, scramble their password
userSchema.pre("save", async function () {
  // Only scramble if the password was just changed
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// A helper method to check if a password is correct at login
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
