// backend/src/models/OTP.js - NEW FILE
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  otp: {
    type: String,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // Auto-delete after expiry
  },
}, {
  timestamps: true,
});

otpSchema.index({ email: 1, otp: 1 });

module.exports = mongoose.model('OTP', otpSchema);