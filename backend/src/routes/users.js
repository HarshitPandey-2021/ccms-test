// backend/src/routes/users.js - UPDATED WITH OTP ROUTES
const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const { protect } = require("../middlewares/authMiddleware"); // If you have auth middleware

// ============================================
// PUBLIC ROUTES (No Authentication)
// ============================================

// ✅ EXISTING: Normal Login (Email + Password)
router.post("/login", usersController.loginUser);

// ✅ EXISTING: Normal Registration (Backward Compatibility)
router.post("/register", usersController.registerUser);

// ✅ NEW: Registration with OTP - Step 1 (Send OTP)
router.post("/register/request-otp", usersController.requestRegistrationOTP);

// ✅ NEW: Registration with OTP - Step 2 (Verify & Register)
router.post("/register/verify-otp", usersController.verifyAndRegister);

// ✅ EXISTING: Refresh Token
router.post("/refresh", usersController.refreshToken);

// ============================================
// PROTECTED ROUTES (Require Authentication)
// ============================================

// ✅ Get user profile (if you have this)
router.get("/profile", protect, usersController.getProfile);

// ✅ Update user profile (if you have this)
router.put("/profile", protect, usersController.updateProfile);

// ✅ Get user stats (if you have this)
router.get("/profile/stats", protect, usersController.getUserStats);

module.exports = router;