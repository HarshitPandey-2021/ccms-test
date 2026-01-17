// backend/src/controllers/usersController.js - COMPLETE WITH OTP
const jwt = require("jsonwebtoken");
const User = require("../models/usersModel"); // ✅ Use correct path
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const emailService = require("../services/emailService");

// ============================================
// EXISTING LOGIN (NO CHANGES)
// ============================================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        type: "refresh",
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    console.log("✅ User logged in:", email, "role:", user.role);

    res.json({
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.rollNo || user.roll || null,
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ============================================
// EXISTING REFRESH TOKEN (NO CHANGES)
// ============================================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
    );

    if (decoded.type !== "refresh") {
      return res.status(401).json({ message: "Invalid refresh token type" });
    }

    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("✅ Access token refreshed for:", decoded.email);
    res.json({ token: newAccessToken });
  } catch (error) {
    console.error("❌ Refresh token error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Refresh token expired" });
    }
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
};

// ============================================
// EXISTING REGISTER (KEEP FOR BACKWARD COMPATIBILITY)
// ============================================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, roll, rollNo } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const user = new User({
      name,
      email,
      password,
      role: role || "student",
      rollNo: rollNo || roll || null,
    });

    await user.save();
    console.log("✅ User registered:", email);

    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        type: "refresh",
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        rollNo: user.rollNo,
      },
    });
  } catch (error) {
    console.error("❌ Registration error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

// ============================================
// ✅ NEW: REQUEST REGISTRATION OTP
// ============================================
exports.requestRegistrationOTP = async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ 
        message: "Email and name are required" 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email already registered. Please login instead." 
      });
    }

    // Generate 6-digit OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log(`📧 Generated OTP for ${normalizedEmail}: ${otp}`); // For testing

    // Delete old OTPs for this email
    await OTP.deleteMany({ email: normalizedEmail, verified: false });

    // Save new OTP (expires in 10 minutes)
    await OTP.create({
      email: normalizedEmail,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // Send OTP email
    await emailService.sendRegistrationOTP(normalizedEmail, otp, name);

    res.json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
      expiresIn: 600, // 10 minutes in seconds
    });

  } catch (error) {
    console.error("❌ Request OTP error:", error);
    res.status(500).json({ 
      message: "Failed to send verification code. Please try again." 
    });
  }
};

// ============================================
// ✅ NEW: VERIFY OTP & COMPLETE REGISTRATION
// ============================================
exports.verifyAndRegister = async (req, res) => {
  try {
    const { email, otp, name, password, rollNo, phone } = req.body;

    if (!email || !otp || !name || !password) {
      return res.status(400).json({ 
        message: "Email, OTP, name, and password are required" 
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find valid OTP
    const otpDoc = await OTP.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      return res.status(400).json({ 
        message: "Invalid or expired verification code" 
      });
    }

    // Check if user already exists (double check)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ 
        message: "User already exists" 
      });
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password, // Will be hashed by pre-save hook
      phone: phone?.trim() || null,
      rollNo: rollNo?.trim() || null,
      role: "student",
    });

    await user.save();
    console.log("✅ User registered with OTP:", normalizedEmail);

    // Mark OTP as verified
    otpDoc.verified = true;
    await otpDoc.save();

    // Send welcome email (non-blocking)
    emailService.sendWelcomeEmail(user).catch(err => 
      console.error("Welcome email failed:", err)
    );

    // Generate tokens
    const accessToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
        type: "refresh",
      },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful! Welcome to CCMS.",
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        rollNo: user.rollNo,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("❌ Verify and register error:", error);
    res.status(500).json({ 
      message: "Registration failed. Please try again." 
    });
  }
};

// ============================================
// ✅ EXISTING: GET PROFILE (If you have this)
// ============================================
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// ✅ EXISTING: UPDATE PROFILE (If you have this)
// ============================================
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone?.trim() || null;

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        rollNo: user.rollNo,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// ============================================
// ✅ EXISTING: GET USER STATS (If you have this)
// ============================================
exports.getUserStats = async (req, res) => {
  try {
    const Complaint = require("../models/complaintsModel");
    const userId = req.user._id;

    const complaints = await Complaint.find({ userId });

    const stats = {
      total: complaints.length,
      pending: complaints.filter((c) => c.status?.toLowerCase() === "pending").length,
      inProgress: complaints.filter(
        (c) => c.status?.toLowerCase() === "in progress" || c.status?.toLowerCase() === "in-progress"
      ).length,
      resolved: complaints.filter((c) => c.status?.toLowerCase() === "resolved").length,
      rejected: complaints.filter((c) => c.status?.toLowerCase() === "rejected").length,
    };

    res.json(stats);
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error" });
  }
};