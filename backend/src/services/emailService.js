// backend/src/services/emailService.js - NEW FILE
const { Resend } = require('resend');
const { registrationOTPTemplate, welcomeEmailTemplate } = require('../templates/emailTemplates');

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.FROM_EMAIL || 'CCMS <onboarding@resend.dev>';

// ✅ Send Registration OTP
async function sendRegistrationOTP(email, otp, name = '') {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: '🔐 Verify Your Email - CCMS Registration',
      html: registrationOTPTemplate(name, otp),
    });

    console.log('✅ Registration OTP sent to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ OTP email failed:', error);
    throw error;
  }
}

// ✅ Send Welcome Email
async function sendWelcomeEmail(user) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: '🎉 Welcome to CCMS - Registration Successful!',
      html: welcomeEmailTemplate(user),
    });

    console.log('✅ Welcome email sent to:', user.email);
  } catch (error) {
    console.error('❌ Welcome email failed:', error);
  }
}

module.exports = {
  sendRegistrationOTP,
  sendWelcomeEmail,
};