// backend/src/templates/emailTemplates.js - NEW FILE

// ✅ 1. Registration OTP Email (BEAUTIFUL)
exports.registrationOTPTemplate = (name, otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
        <tr>
          <td align="center">
            <!-- Main Container -->
            <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 30px; text-align: center;">
                  <div style="font-size: 60px; margin-bottom: 15px;">🔐</div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">Verify Your Email</h1>
                  <p style="margin: 10px 0 0 0; color: #f3f4f6; font-size: 16px;">Complete your CCMS registration</p>
                </td>
              </tr>

              <!-- Content -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #1f2937; font-size: 24px; font-weight: 700;">
                    Hello ${name || 'there'}! 👋
                  </h2>
                  
                  <p style="margin: 0 0 25px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Thank you for registering with <strong>Campus Complaint Management System</strong> at University of Lucknow.
                  </p>

                  <p style="margin: 0 0 30px 0; color: #4b5563; font-size: 16px; line-height: 1.6;">
                    Please use the verification code below to complete your registration:
                  </p>

                  <!-- OTP Box -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 15px; padding: 30px; text-align: center; border: 2px dashed #9ca3af;">
                        <div style="color: #6b7280; font-size: 14px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                          YOUR VERIFICATION CODE
                        </div>
                        <div style="font-size: 48px; font-weight: 800; color: #667eea; letter-spacing: 10px; font-family: 'Courier New', monospace; text-shadow: 2px 2px 4px rgba(102, 126, 234, 0.2);">
                          ${otp}
                        </div>
                        <div style="margin-top: 15px; font-size: 14px; color: #dc2626; font-weight: 600;">
                          ⏰ Valid for 10 minutes
                        </div>
                      </td>
                    </tr>
                  </table>

                  <!-- Warning Box -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px 20px; border-radius: 8px;">
                        <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.5;">
                          <strong>⚠️ Security Alert:</strong><br>
                          Never share this code with anyone. Our team will never ask for your OTP via phone or email.
                        </p>
                      </td>
                    </tr>
                  </table>

                  <!-- Steps -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px 20px; border-radius: 8px;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #1e40af; font-weight: 700;">
                          📝 Next Steps:
                        </p>
                        <ol style="margin: 0; padding-left: 20px; color: #1e40af; font-size: 14px; line-height: 1.8;">
                          <li>Copy the 6-digit code above</li>
                          <li>Return to the registration page</li>
                          <li>Enter the code to verify your email</li>
                          <li>Complete your profile setup</li>
                        </ol>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 30px 0 0 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                    If you didn't request this code, please ignore this email or contact us at 
                    <a href="mailto:support@ccms.ac.in" style="color: #667eea; text-decoration: none; font-weight: 600;">support@ccms.ac.in</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 14px; font-weight: 700;">
                    Campus Complaint Management System
                  </p>
                  <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                    University of Lucknow<br>
                    Badshah Bagh, Lucknow - 226001
                  </p>
                  <div style="margin: 20px 0 0 0;">
                    <a href="https://landing-test-liard-one.vercel.app" style="color: #667eea; text-decoration: none; margin: 0 10px; font-weight: 600; font-size: 13px;">Home</a>
                    <a href="mailto:support@ccms.ac.in" style="color: #667eea; text-decoration: none; margin: 0 10px; font-weight: 600; font-size: 13px;">Support</a>
                    <a href="https://user-dash-test.vercel.app" style="color: #667eea; text-decoration: none; margin: 0 10px; font-weight: 600; font-size: 13px;">Login</a>
                  </div>
                  <p style="margin: 20px 0 0 0; font-size: 12px; color: #9ca3af;">
                    © 2024 CCMS. All rights reserved.<br>
                    This is an automated message, please do not reply.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

// ✅ 2. Welcome Email (After Successful Registration)
exports.welcomeEmailTemplate = (user) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to CCMS</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
              
              <!-- Header with Animation -->
              <tr>
                <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 50px 30px; text-align: center;">
                  <div style="font-size: 80px; margin-bottom: 20px;">🎉</div>
                  <h1 style="margin: 0; color: #ffffff; font-size: 36px; font-weight: 700;">Welcome to CCMS!</h1>
                  <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 16px;">Your account is now active</p>
                </td>
              </tr>

              <!-- Success Checkmark -->
              <tr>
                <td style="padding: 40px 30px; text-align: center;">
                  <div style="width: 80px; height: 80px; margin: 0 auto 30px; background: #10b981; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                    <div style="width: 40px; height: 40px; border: 4px solid white; border-top: none; border-left: none; transform: rotate(45deg); margin-bottom: 10px;"></div>
                  </div>

                  <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 28px; font-weight: 700;">
                    Welcome aboard, ${user.name}!
                  </h2>

                  <p style="margin: 0 0 30px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                    🎊 Congratulations! Your CCMS account has been successfully created.<br>
                    You can now submit and track complaints on campus.
                  </p>

                  <!-- Account Details Card -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 15px; padding: 25px;">
                        <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 18px; font-weight: 700; text-align: left;">
                          📋 Your Account Details
                        </h3>
                        
                        <table width="100%" cellpadding="8" cellspacing="0">
                          <tr style="border-bottom: 1px solid #d1d5db;">
                            <td style="color: #6b7280; font-weight: 600; font-size: 14px; width: 130px;">Name:</td>
                            <td style="color: #1f2937; font-weight: 600; font-size: 14px;">${user.name}</td>
                          </tr>
                          <tr style="border-bottom: 1px solid #d1d5db;">
                            <td style="color: #6b7280; font-weight: 600; font-size: 14px;">Email:</td>
                            <td style="color: #1f2937; font-weight: 600; font-size: 14px;">${user.email}</td>
                          </tr>
                          ${user.rollNo ? `
                            <tr style="border-bottom: 1px solid #d1d5db;">
                              <td style="color: #6b7280; font-weight: 600; font-size: 14px;">Roll Number:</td>
                              <td style="color: #1f2937; font-weight: 600; font-size: 14px;">${user.rollNo}</td>
                            </tr>
                          ` : ''}
                          <tr>
                            <td style="color: #6b7280; font-weight: 600; font-size: 14px;">Role:</td>
                            <td style="color: #1f2937; font-weight: 600; font-size: 14px; text-transform: capitalize;">${user.role || 'Student'}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA Button -->
                  <table cellpadding="0" cellspacing="0" style="margin: 30px auto;">
                    <tr>
                      <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 30px; padding: 15px 40px;">
                        <a href="https://user-dash-test.vercel.app/user/dashboard" style="color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; display: block;">
                          Go to Dashboard →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- Features Section -->
                  <h3 style="margin: 40px 0 25px 0; color: #1f2937; font-size: 20px; font-weight: 700;">
                    🚀 What You Can Do
                  </h3>

                  <!-- Feature Items -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background: #f9fafb; border-radius: 10px; padding: 15px; margin-bottom: 15px;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="font-size: 28px; padding-right: 15px; vertical-align: top;">📝</td>
                            <td>
                              <h4 style="margin: 0 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 700; text-align: left;">Submit Complaints</h4>
                              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: left;">Report campus issues quickly with photos and descriptions</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                    <tr>
                      <td style="background: #f9fafb; border-radius: 10px; padding: 15px;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="font-size: 28px; padding-right: 15px; vertical-align: top;">📊</td>
                            <td>
                              <h4 style="margin: 0 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 700; text-align: left;">Track Progress</h4>
                              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: left;">Monitor your complaints and get real-time status updates</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                    <tr>
                      <td style="background: #f9fafb; border-radius: 10px; padding: 15px;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="font-size: 28px; padding-right: 15px; vertical-align: top;">🔔</td>
                            <td>
                              <h4 style="margin: 0 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 700; text-align: left;">Get Notifications</h4>
                              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: left;">Receive email alerts when your complaints are updated</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 15px;">
                    <tr>
                      <td style="background: #f9fafb; border-radius: 10px; padding: 15px;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="font-size: 28px; padding-right: 15px; vertical-align: top;">🔒</td>
                            <td>
                              <h4 style="margin: 0 0 5px 0; color: #1f2937; font-size: 16px; font-weight: 700; text-align: left;">Anonymous Option</h4>
                              <p style="margin: 0; color: #6b7280; font-size: 14px; text-align: left;">Submit sensitive complaints anonymously when needed</p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 40px 0 0 0; color: #6b7280; font-size: 14px;">
                    Need help? Contact us at 
                    <a href="mailto:support@ccms.ac.in" style="color: #667eea; text-decoration: none; font-weight: 600;">support@ccms.ac.in</a>
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0 0 10px 0; color: #1f2937; font-size: 14px; font-weight: 700;">
                    Campus Complaint Management System
                  </p>
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">
                    University of Lucknow
                  </p>
                  <p style="margin: 15px 0 0 0; font-size: 12px; color: #9ca3af;">
                    © 2024 CCMS. All rights reserved.
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

module.exports = {
  registrationOTPTemplate,
  welcomeEmailTemplate,
};