const jwt = require("jsonwebtoken");
const User = require("../models/User");

// This function runs BEFORE protected routes
const protect = async (req, res, next) => {
  try {
    // 1. Check if a token was sent in the request headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    // 2. Extract the actual token (remove the "Bearer " part)
    const token = authHeader.split(" ")[1];

    // 3. Verify the token is real and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find the user this token belongs to
    // .select('-password') means "give me everything EXCEPT the password"
    req.user = await User.findById(decoded.id).select("-password");

    // 5. Move on to the actual route
    next();
  } catch (err) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// This function checks if the logged-in user is an admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next(); // they're an admin, let them through
  } else {
    res.status(403).json({ message: "Access denied, admins only" });
  }
};

module.exports = { protect, adminOnly };
