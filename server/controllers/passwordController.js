const crypto = require("crypto");
const User = require("../models/User");
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// ─── STEP 1: Request a reset link ────────────────────────
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // SECURITY NOTE: Even if no user is found, we send the SAME success message.
    // This stops attackers from using this endpoint to check which emails are
    // registered on our site (an "email enumeration" attack).
    if (!user) {
      return res.json({
        message: "If that email exists, a reset link has been sent.",
      });
    }

    // Generate a random, secure token — like a temporary key
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save the token on the user, expiring 1 hour from now
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour in milliseconds
    await user.save();

    // Build the link the customer will click
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send the email via Resend
    await resend.emails.send({
      from: "Iva Kitchen <onboarding@resend.dev>",
      to: user.email,
      subject: "Reset Your Iva Kitchen Password",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: auto;">
          <h2 style="color: #f97316;">Iva Kitchen</h2>
          <p>Hi ${user.name.split(" ")[0]},</p>
          <p>We received a request to reset your password. Click the button below to set a new one:</p>
          <a href="${resetUrl}" style="display:inline-block; background:#f97316; color:white; padding:12px 24px; border-radius:24px; text-decoration:none; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #999; font-size: 13px;">
            This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    });

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// ─── STEP 2: Actually reset the password ─────────────────
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find a user with this exact token, AND make sure it hasn't expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // $gt means "greater than" — expiry must be in the future
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    // Set the new password — our pre-save hook will scramble it automatically
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful! You can now log in." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

module.exports = { forgotPassword, resetPassword };
