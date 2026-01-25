require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { Readable } = require("stream");

// ✅ NEW: OTP Dependencies
const otpGenerator = require("otp-generator");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

console.log('✅ SendGrid initialized');
const app = express();
// ---------- CORS & BODY PARSING ----------
app.use(
  cors({
    origin: [
      "https://ccms-home.vercel.app",
      "https://ccms-admin-rho.vercel.app",
      "https://ccms-student.vercel.app",
      "https://ccms-home-test.vercel.app",
      "https://ccms-admin-test.vercel.app",
      "https://ccms-student-test.vercel.app",
      "https://landing-test-liard-one.vercel.app",
      "https://admin-test-nine.vercel.app",
      "https://user-dash-test.vercel.app",
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:3001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

const PORT = process.env.PORT || 4000;
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

// ✅ UPDATED: Added OTPs and AllowedStudents collections
let db, Users, Complaints, AdminLogs, Departments, OTPs, AllowedStudents;

// ---------- CLOUDINARY ----------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

cloudinary.api
  .ping()
  .then(() => console.log("✅ Cloudinary connected"))
  .catch((err) => console.error("❌ Cloudinary FAILED:", err.message));

const uploadToCloudinary = (buffer, options) =>
  new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { ...options, use_filename: true, unique_filename: true },
      (error, result) => {
        if (error) {
          console.error("Upload error:", error.message);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    Readable.from(buffer).pipe(uploadStream);
  });

// ---------- MULTER ----------
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "images") {
      if (file.mimetype.startsWith("image/")) cb(null, true);
      else cb(new Error("Only image files allowed"), false);
    } else if (file.fieldname === "pdfDocument") {
      if (file.mimetype === "application/pdf") cb(null, true);
      else cb(new Error("Only PDF files allowed"), false);
    } else {
      cb(null, true);
    }
  },
});

// ---------- HELPERS ----------
function toObjectId(id) {
  if (!ObjectId.isValid(id)) return null;
  return new ObjectId(id);
}

function normalizeRole(role) {
  const r = (role || "").toLowerCase();
  if (r === "admin") return "admin";
  return "student";
}

// ✅ NEW: Email Template Functions
function getOTPEmailTemplate(name, otp) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f0f2f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 30px;text-align:center;">
              <div style="font-size:50px;margin-bottom:15px;">🔐</div>
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:700;">Verify Your Email</h1>
              <p style="margin:10px 0 0 0;color:rgba(255,255,255,0.9);font-size:16px;">Complete your CCMS registration</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;">
              <h2 style="color:#1f2937;font-size:22px;margin:0 0 15px 0;">Hello ${name || "there"}! 👋</h2>
              <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 25px 0;">
                Thank you for registering with <strong>Campus Complaint Management System</strong>. 
                Use the verification code below to complete your registration.
              </p>
              
              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:30px 0;">
                <tr>
                  <td style="background:linear-gradient(135deg,#f3f4f6 0%,#e5e7eb 100%);border-radius:16px;padding:30px;text-align:center;border:2px dashed #9ca3af;">
                    <div style="color:#6b7280;font-size:14px;margin-bottom:15px;text-transform:uppercase;letter-spacing:2px;font-weight:600;">Your Verification Code</div>
                    <div style="font-size:42px;font-weight:800;color:#667eea;letter-spacing:8px;font-family:'Courier New',monospace;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;">${otp}</div>
                    <div style="margin-top:15px;font-size:14px;color:#dc2626;font-weight:600;">⏰ Valid for 10 minutes only</div>
                  </td>
                </tr>
              </table>
              
              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:25px 0;">
                <tr>
                  <td style="background:#fef3c7;border-left:4px solid #f59e0b;padding:15px 20px;border-radius:0 8px 8px 0;">
                    <p style="margin:0;font-size:14px;color:#92400e;">
                      <strong>⚠️ Security Notice:</strong><br>
                      Never share this code with anyone. CCMS staff will never ask for your OTP.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:25px 30px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0 0 10px 0;color:#6b7280;font-size:13px;">
                If you didn't request this code, please ignore this email.
              </p>
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © 2026 Campus Complaint Management System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function getWelcomeEmailTemplate(user) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f0f2f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.3);overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#10b981 0%,#059669 100%);padding:50px 30px;text-align:center;">
              <div style="font-size:70px;margin-bottom:20px;">🎉</div>
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:700;">Welcome to CCMS!</h1>
              <p style="margin:15px 0 0 0;color:rgba(255,255,255,0.9);font-size:16px;">Your account has been created successfully</p>
            </td>
          </tr>
          
          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;text-align:center;">
              <h2 style="color:#1f2937;font-size:24px;margin:0 0 20px 0;">Hello, ${user.name}! 👋</h2>
              <p style="color:#4b5563;font-size:16px;line-height:1.6;margin:0 0 30px 0;">
                Your CCMS account is now active. You can start submitting and tracking complaints right away!
              </p>
              
              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);border-radius:30px;padding:15px 40px;">
                    <a href="https://user-dash-test.vercel.app/login" style="color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;display:inline-block;">
                      Go to Login  →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:25px 30px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © 2026 Campus Complaint Management System
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ✅ NEW: Send OTP Email Function
async function sendOTPEmail(email, otp, name) {
  try {
    console.log(`📤 Sending OTP to: ${email}`);
    
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: '🔐 Verify Your Email - CCMS Registration',
      html: getOTPEmailTemplate(name, otp),
    };

    await sgMail.send(msg);
    console.log(`✅ OTP email sent to ${email} via SendGrid`);
    return { success: true };
  } catch (error) {
    console.error('❌ SendGrid error:', error.message);
    if (error.response) {
      console.error('Error body:', error.response.body);
    }
    throw error;
  }
}

// ✅ NEW: Send Welcome Email Function
async function sendWelcomeEmail(user) {
  try {
    const msg = {
      to: user.email,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: '🎉 Welcome to CCMS - Registration Successful!',
      html: getWelcomeEmailTemplate(user),
    };

    await sgMail.send(msg);
    console.log(`✅ Welcome email sent to ${user.email} via SendGrid`);
  } catch (error) {
    console.error('❌ Welcome email error:', error);
  }
}
// ---------- AUTH MIDDLEWARE ----------
function auth(req, res, next) {
  const token = req.headers["authorization"]?.replace("Bearer ", "");
  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ message: `Forbidden: ${role}s only` });
    }
    next();
  };
}

// ---------- MONGO CONNECTION ----------
async function start() {
  const client = new MongoClient(uri);
  await client.connect();

  db = client.db(dbName);
  Users = db.collection("Users");
  Complaints = db.collection("Complaints");
  AdminLogs = db.collection("AdminLogs");
  Departments = db.collection("Departments");

 OTPs = db.collection("OTPs");
AllowedStudents = db.collection("AllowedStudents"); // ✅ NEW: Whitelist Collection
  await Users.createIndex({ email: 1 }, { unique: true });
  await Departments.createIndex({ name: 1 }, { unique: true });
  await Complaints.createIndex({ userId: 1 });
  await Complaints.createIndex({ status: 1, priority: 1 });
  await Complaints.createIndex({ assignedTo: 1 });
  await Complaints.createIndex({ submittedAt: -1 });
  await Complaints.createIndex({ subject: "text", description: "text" });
  
  // ✅ NEW: OTP Indexes
  await OTPs.createIndex({ email: 1 });
  await OTPs.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // Auto-delete expired OTPs
  // ✅ NEW: AllowedStudents Indexes
await AllowedStudents.createIndex({ rollNo: 1 }, { unique: true });
await AllowedStudents.createIndex({ isRegistered: 1 });

  console.log("✅ MongoDB connected. DB:", dbName);
  app.listen(PORT, () => console.log(`🚀 Server: http://localhost:${PORT}`));
}

start().catch((e) => {
  console.error("Failed to start:", e);
  process.exit(1);
});

// ---------- HEALTH & CLOUDINARY TEST ----------
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Keep-alive (Production)
if (process.env.NODE_ENV === "production") {
  const keepAlive = () => {
    setInterval(() => {
      const url = process.env.RENDER_EXTERNAL_URL;
      if (url) {
        fetch(`${url}/health`)
          .then(() => console.log("✅ Keep-alive ping"))
          .catch((err) => console.log("❌ Ping failed:", err.message));
      }
    }, 14 * 60 * 1000);
  };

  setTimeout(() => {
    keepAlive();
    console.log("🔄 Keep-alive started");
  }, 60 * 1000);
}

app.get("/api/test-cloudinary", async (req, res) => {
  try {
    const ping = await cloudinary.api.ping();
    res.json({
      status: "connected",
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      ping,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    });
  }
});

app.get("/api/files/pdf/:publicId", async (req, res) => {
  try {
    const { publicId } = req.params;
    const pdfUrl = cloudinary.url(publicId, {
      resource_type: "raw",
      secure: true,
    });

    const response = await fetch(pdfUrl);
    if (!response.ok) {
      return res.status(404).json({ message: "PDF not found" });
    }

    const buffer = await response.arrayBuffer();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline");
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error("PDF proxy error:", error);
    res.status(500).json({ message: "Failed to fetch PDF" });
  }
});

// ============================================
// ✅ NEW: OTP REGISTRATION ROUTES
// ============================================

// ✅ FIXED: Request OTP for Registration
// app.post("/api/auth/register/request-otp", async (req, res) => {
//   try {
//     const { email, name } = req.body;

//     // Validation
//     if (!email || !name) {
//       return res.status(400).json({
//         success: false,
//         message: "Email and name are required",
//       });
//     }

//     const normalizedEmail = email.toLowerCase().trim();

//     // Check if user already exists
//     const existingUser = await Users.findOne({ email: normalizedEmail });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already registered. Please login instead.",
//       });
//     }

//     // ✅ FIX 1: Force delete ALL old OTPs for this email (even expired ones)
//     const deleteResult = await OTPs.deleteMany({ email: normalizedEmail });
//     console.log(`🗑️ Deleted ${deleteResult.deletedCount} old OTPs for ${normalizedEmail}`);

//     // ✅ FIX 2: Generate FRESH OTP with timestamp to ensure uniqueness
//     const otp = otpGenerator.generate(6, {
//       digits: true,
//       upperCaseAlphabets: false,
//       lowerCaseAlphabets: false,
//       specialChars: false,
//     });

//     const now = new Date();
//     const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

//     console.log(`📧 Generated NEW OTP for ${normalizedEmail}: ${otp} at ${now.toISOString()}`);

//     // ✅ FIX 3: Insert new OTP with proper fields
//     await OTPs.insertOne({
//       email: normalizedEmail,
//       otp: otp,
//       name: name.trim(),
//       verified: false,
//       createdAt: now,
//       expiresAt: expiresAt,
//     });

//     // ✅ FIX 4: Verify OTP was saved
//     const savedOTP = await OTPs.findOne({ email: normalizedEmail, verified: false });
//     console.log(`✅ Saved OTP in DB: ${savedOTP?.otp} (should match ${otp})`);

//     // Send OTP email
//     await sendOTPEmail(normalizedEmail, otp, name);

//     res.status(200).json({
//       success: true,
//       message: `Verification code sent to ${normalizedEmail}`,
//       expiresIn: 600, // 10 minutes in seconds
//     });
//   } catch (error) {
//     console.error("❌ Request OTP error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to send verification code. Please try again.",
//       error: error.message,
//     });
//   }
// });

// ============================================
// ✅ WHITELIST-BASED REGISTRATION WITH OTP
// ============================================

// Helper: Get student-friendly batch message
function getWelcomeMessage(student) {
  const firstName = student.name.split(" ")[0];
  const year = student.rollNo.substring(0, 2);
  
  if (year === "22") {
    return {
      greeting: `Welcome back, ${firstName}! 📚`,
      subtitle: "Great to see a senior here. Your experience matters!",
    };
  } else if (year === "23") {
    return {
      greeting: `Hey ${firstName}! 🎓`,
      subtitle: `You're part of the ${student.batch} batch. Let's make our campus better!`,
    };
  } else if (year === "24") {
    return {
      greeting: `Welcome aboard, ${firstName}! 🚀`,
      subtitle: "Glad to have you in the AI family. Your fresh perspective counts!",
    };
  }
  
  return {
    greeting: `Welcome, ${firstName}! 👋`,
    subtitle: "You're verified as a University of Lucknow student.",
  };
}

// Step 1: Verify Roll Number & Request OTP
app.post("/api/auth/register/request-otp", async (req, res) => {
  try {
    const { email, name, rollNo } = req.body;

    // Validation
    if (!email || !rollNo) {
      return res.status(400).json({
        success: false,
        message: "Email and Roll Number are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRollNo = rollNo.trim();

    // ✅ STEP 1: Check if roll number exists in whitelist
    const allowedStudent = await AllowedStudents.findOne({ 
      rollNo: normalizedRollNo 
    });

    if (!allowedStudent) {
      console.log(`❌ Roll number not in whitelist: ${normalizedRollNo}`);
      return res.status(403).json({
        success: false,
        errorType: "ROLL_NOT_FOUND",
        message: "Roll number not found in our records",
        details: "This portal is exclusively for B.Tech AI students of University of Lucknow. If you believe this is a mistake, please contact your Class Representative.",
      });
    }

    // ✅ STEP 2: Check if already registered
    if (allowedStudent.isRegistered) {
      console.log(`⚠️ Roll number already registered: ${normalizedRollNo}`);
      return res.status(400).json({
        success: false,
        errorType: "ALREADY_REGISTERED",
        message: `Hey ${allowedStudent.name.split(" ")[0]}! You're already registered.`,
        details: "This roll number has an existing account. Try logging in instead.",
        registeredEmail: allowedStudent.registeredEmail 
          ? `Registered with: ${allowedStudent.registeredEmail.substring(0, 3)}***` 
          : null,
      });
    }

    // ✅ STEP 3: Check if email already used by someone else
    const existingUser = await Users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        errorType: "EMAIL_EXISTS",
        message: "This email is already registered with another account.",
        details: "Please use a different email address or try logging in.",
      });
    }

    // ✅ STEP 4: Delete old OTPs and generate new one
    await OTPs.deleteMany({ email: normalizedEmail });

    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes

    console.log(`📧 Generated OTP for ${allowedStudent.name}: ${otp}`);

    // Save OTP with student info
    await OTPs.insertOne({
      email: normalizedEmail,
      otp: otp,
      rollNo: normalizedRollNo,
      name: allowedStudent.name, // Use name from whitelist
      verified: false,
      createdAt: now,
      expiresAt: expiresAt,
    });

    // ✅ STEP 5: Send personalized OTP email
    await sendOTPEmail(normalizedEmail, otp, allowedStudent.name);

    // Get personalized welcome message
    const welcomeMsg = getWelcomeMessage(allowedStudent);

    res.status(200).json({
      success: true,
      message: `Verification code sent to ${normalizedEmail}`,
      studentName: allowedStudent.name,
      greeting: welcomeMsg.greeting,
      subtitle: welcomeMsg.subtitle,
      batch: allowedStudent.batch,
      expiresIn: 600, // 10 minutes in seconds
    });
  } catch (error) {
    console.error("❌ Request OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again.",
      error: error.message,
    });
  }
});

// ============================================
// REVEAL ANONYMOUS IDENTITY (Super Admin Only)
// ============================================
app.post(
  "/api/complaints/:id/reveal-identity",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Get admin making the request
      const admin = await Users.findOne({ _id: toObjectId(req.user.userId) });
      
      // ✅ ONLY Super Admin can reveal
      if (admin.adminType !== "super") {
        return res.status(403).json({
          success: false,
          message: "Only Super Admins can reveal anonymous identities"
        });
      }

      // Get the complaint
      const complaint = await Complaints.findOne({ _id: toObjectId(id) });
      
      if (!complaint) {
        return res.status(404).json({
          success: false,
          message: "Complaint not found"
        });
      }

      // Check if it's actually anonymous
      if (!complaint.isAnonymous) {
        return res.status(400).json({
          success: false,
          message: "This complaint is not anonymous"
        });
      }

      // ✅ LOG THE ACTION for audit trail
      await AdminLogs.insertOne({
        adminId: req.user.userId,
        adminName: admin.name,
        adminEmail: admin.email,
        action: "REVEAL_IDENTITY",
        complaintId: id,
        details: {
          complaintSubject: complaint.subject || complaint.title,
          revealedUser: complaint.submittedBy,
          revealedEmail: complaint.email,
          revealedRoll: complaint.roll,
        },
        timestamp: new Date(),
        ipAddress: req.ip,
      });

      console.log(`🔓 Identity revealed for complaint ${id} by ${admin.email}`);

      // Return the identity
      res.json({
        success: true,
        identity: {
          name: complaint.submittedBy || "Unknown",
          email: complaint.email || "N/A",
          roll: complaint.roll || complaint.rollNo || "N/A",
          phone: complaint.phone || "Not provided",
        },
        message: "Identity revealed successfully. Action logged.",
      });

    } catch (error) {
      console.error("Reveal identity error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to reveal identity"
      });
    }
  }
);


// Step 2: Verify OTP and Complete Registration
// app.post("/api/auth/register/verify-otp", async (req, res) => {
//   try {
//     const { email, otp, name, password, roll, rollNo, phone } = req.body;

//     // Validation
//     if (!email || !otp || !name || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "Email, OTP, name, and password are required",
//       });
//     }

//     const normalizedEmail = email.toLowerCase().trim();

//     // Find valid OTP
//     const otpDoc = await OTPs.findOne({
//       email: normalizedEmail,
//       otp: otp.trim(),
//       verified: false,
//       expiresAt: { $gt: new Date() },
//     });

//     if (!otpDoc) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid or expired verification code. Please request a new one.",
//       });
//     }

//     // Check if user already exists (double check)
//     const existingUser = await Users.findOne({ email: normalizedEmail });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already registered",
//       });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Determine role and roll number
//     const userRoll = roll || rollNo || null;
//     const userRole = userRoll ? "student" : "student"; // Default to student

//     // Create user
//     const now = new Date();
//     const newUser = {
//       name: name.trim(),
//       email: normalizedEmail,
//       password: hashedPassword,
//       phone: phone?.trim() || null,
//       roll: userRoll,
//       role: userRole,
//       emailVerified: true,
//       createdAt: now,
//       updatedAt: now,
//     };

//     const result = await Users.insertOne(newUser);
//     const userId = result.insertedId.toString();

//     console.log("✅ User registered with OTP:", normalizedEmail);

//     // Mark OTP as verified
//     await OTPs.updateOne(
//       { _id: otpDoc._id },
//       { $set: { verified: true } }
//     );

//     // Send welcome email (non-blocking)
//     sendWelcomeEmail({ ...newUser, _id: result.insertedId }).catch((err) =>
//       console.error("Welcome email failed:", err)
//     );

//     // Generate tokens
//     const payload = { userId, email: normalizedEmail, role: userRole };

//     const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN || "24h",
//     });

//     const refreshToken = jwt.sign(
//       { ...payload, type: "refresh" },
//       process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
//       { expiresIn: "30d" }
//     );

//     res.status(201).json({
//       success: true,
//       message: "Registration successful! Welcome to CCMS.",
//       token: accessToken,
//       refreshToken: refreshToken,
//       user: {
//         id: userId,
//         _id: userId,
//         name: newUser.name,
//         email: newUser.email,
//         phone: newUser.phone,
//         roll: newUser.roll,
//         role: newUser.role,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Verify OTP error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Registration failed. Please try again.",
//       error: error.message,
//     });
//   }
// });

// Step 2: Verify OTP and Complete Registration
app.post("/api/auth/register/verify-otp", async (req, res) => {
  try {
    const { email, otp, password, phone } = req.body;

    // Validation
    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ✅ STEP 1: Find valid OTP
    const otpDoc = await OTPs.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      verified: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpDoc) {
      // Check if OTP exists but expired
      const expiredOtp = await OTPs.findOne({
        email: normalizedEmail,
        otp: otp.trim(),
      });

      if (expiredOtp) {
        return res.status(400).json({
          success: false,
          errorType: "OTP_EXPIRED",
          message: "This code has expired. Please request a new one.",
        });
      }

      return res.status(400).json({
        success: false,
        errorType: "INVALID_OTP",
        message: "Invalid verification code. Please check and try again.",
      });
    }

    // ✅ STEP 2: Get student info from whitelist
    const allowedStudent = await AllowedStudents.findOne({ 
      rollNo: otpDoc.rollNo 
    });

    if (!allowedStudent) {
      return res.status(400).json({
        success: false,
        message: "Student record not found. Please contact support.",
      });
    }

    // Double check not already registered
    if (allowedStudent.isRegistered) {
      return res.status(400).json({
        success: false,
        message: "This roll number is already registered.",
      });
    }

    // ✅ STEP 3: Check email not already used
    const existingUser = await Users.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // ✅ STEP 4: Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);

    const now = new Date();
    const newUser = {
      name: allowedStudent.name, // Use official name from whitelist
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone?.trim() || null,
      roll: otpDoc.rollNo,
      rollNo: otpDoc.rollNo,
      batch: allowedStudent.batch,
      role: "student",
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    };

    const result = await Users.insertOne(newUser);
    const userId = result.insertedId.toString();

    console.log(`✅ User registered: ${allowedStudent.name} (${otpDoc.rollNo})`);

    // ✅ STEP 5: Mark student as registered in whitelist
    await AllowedStudents.updateOne(
      { rollNo: otpDoc.rollNo },
      {
        $set: {
          isRegistered: true,
          registeredAt: now,
          registeredEmail: normalizedEmail,
          userId: userId,
        },
      }
    );

    // ✅ STEP 6: Mark OTP as used
    await OTPs.updateOne(
      { _id: otpDoc._id },
      { $set: { verified: true } }
    );

    // ✅ STEP 7: Send welcome email (non-blocking)
    sendWelcomeEmail({ ...newUser, _id: result.insertedId }).catch((err) =>
      console.error("Welcome email failed:", err)
    );

    // ✅ STEP 8: Generate tokens
    const payload = { userId, email: normalizedEmail, role: "student" };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });

    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    // Get registration stats
    const totalRegistered = await AllowedStudents.countDocuments({ isRegistered: true });
    const totalStudents = await AllowedStudents.countDocuments();

    res.status(201).json({
      success: true,
      message: `Welcome to CCMS, ${allowedStudent.name.split(" ")[0]}! 🎉`,
      subtitle: `You're student #${totalRegistered} of ${totalStudents} to join.`,
      token: accessToken,
      refreshToken: refreshToken,
      user: {
        id: userId,
        _id: userId,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        roll: newUser.roll,
        rollNo: newUser.rollNo,
        batch: newUser.batch,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("❌ Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again.",
      error: error.message,
    });
  }
});


// Resend OTP
// app.post("/api/auth/register/resend-otp", async (req, res) => {
//   try {
//     const { email, name } = req.body;

//     if (!email) {
//       return res.status(400).json({
//         success: false,
//         message: "Email is required",
//       });
//     }

//     const normalizedEmail = email.toLowerCase().trim();

//     // Check if user already exists
//     const existingUser = await Users.findOne({ email: normalizedEmail });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: "Email already registered",
//       });
//     }

//     // Check rate limiting (prevent spam)
//     const recentOTP = await OTPs.findOne({
//       email: normalizedEmail,
//       createdAt: { $gt: new Date(Date.now() - 60 * 1000) }, // Last 1 minute
//     });

//     if (recentOTP) {
//       return res.status(429).json({
//         success: false,
//         message: "Please wait 1 minute before requesting another code",
//       });
//     }

//     // Generate new OTP
//     const otp = otpGenerator.generate(6, {
//       digits: true,
//       upperCaseAlphabets: false,
//       lowerCaseAlphabets: false,
//       specialChars: false,
//     });

//     console.log(`📧 Resent OTP for ${normalizedEmail}: ${otp}`);

//     // Delete old OTPs and create new one
//     await OTPs.deleteMany({ email: normalizedEmail });
//     await OTPs.insertOne({
//       email: normalizedEmail,
//       otp: otp,
//       name: name?.trim() || "User",
//       verified: false,
//       createdAt: new Date(),
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000),
//     });

//     // Send OTP email
//     await sendOTPEmail(normalizedEmail, otp, name || "User");

//     res.status(200).json({
//       success: true,
//       message: "New verification code sent",
//       expiresIn: 600,
//     });
//   } catch (error) {
//     console.error("❌ Resend OTP error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to resend code",
//     });
//   }
// });


// Resend OTP
app.post("/api/auth/register/resend-otp", async (req, res) => {
  try {
    const { email, rollNo } = req.body;

    if (!email || !rollNo) {
      return res.status(400).json({
        success: false,
        message: "Email and Roll Number are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedRollNo = rollNo.trim();

    // Verify student is in whitelist
    const allowedStudent = await AllowedStudents.findOne({ 
      rollNo: normalizedRollNo 
    });

    if (!allowedStudent) {
      return res.status(403).json({
        success: false,
        message: "Roll number not found in our records",
      });
    }

    if (allowedStudent.isRegistered) {
      return res.status(400).json({
        success: false,
        message: "This roll number is already registered. Please login.",
      });
    }

    // Check rate limiting (prevent spam)
    const recentOTP = await OTPs.findOne({
      email: normalizedEmail,
      createdAt: { $gt: new Date(Date.now() - 60 * 1000) }, // Last 1 minute
    });

    if (recentOTP) {
      const waitTime = Math.ceil((60000 - (Date.now() - recentOTP.createdAt.getTime())) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitTime} seconds before requesting another code`,
        waitTime: waitTime,
      });
    }

    // Generate new OTP
    const otp = otpGenerator.generate(6, {
      digits: true,
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log(`📧 Resent OTP for ${allowedStudent.name}: ${otp}`);

    // Delete old OTPs and create new one
    await OTPs.deleteMany({ email: normalizedEmail });
    await OTPs.insertOne({
      email: normalizedEmail,
      otp: otp,
      rollNo: normalizedRollNo,
      name: allowedStudent.name,
      verified: false,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    // Send OTP email
    await sendOTPEmail(normalizedEmail, otp, allowedStudent.name);

    res.status(200).json({
      success: true,
      message: `New verification code sent to ${normalizedEmail}`,
      expiresIn: 600,
    });
  } catch (error) {
    console.error("❌ Resend OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resend code. Please try again.",
    });
  }
});

// backend/index.js - ADD THIS ENDPOINT

// ✅ NEW: Admin endpoint to reset student registration (for testing/mistakes)
app.post(
  "/api/admin/students/reset",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { rollNo } = req.body;

      if (!rollNo) {
        return res.status(400).json({ message: "Roll number required" });
      }

      // Find student
      const student = await AllowedStudents.findOne({ rollNo: rollNo.trim() });
      if (!student) {
        return res.status(404).json({ message: "Student not found in whitelist" });
      }

      // Delete from Users if exists
      if (student.userId) {
        await Users.deleteOne({ _id: toObjectId(student.userId) });
      }

      // Reset in AllowedStudents
      await AllowedStudents.updateOne(
        { rollNo: rollNo.trim() },
        {
          $set: {
            isRegistered: false,
            registeredAt: null,
            registeredEmail: null,
            userId: null,
          },
        }
      );

      await AdminLogs.insertOne({
        adminId: req.user.userId,
        action: "RESET_STUDENT_REGISTRATION",
        details: { rollNo },
        timestamp: new Date(),
      });

      res.json({ 
        message: `Student ${student.name} (${rollNo}) reset successfully. They can register again.` 
      });
    } catch (error) {
      console.error("Reset student error:", error);
      res.status(500).json({ message: "Failed to reset student" });
    }
  }
);

// backend/index.js - ADD THIS ENDPOINT

// ✅ GET: Trend data (last 7 days)
// ============================================
// COMPLAINT TRENDS ENDPOINT
// ============================================

// ============================================
// COMPLAINT TRENDS (FIXED - HANDLES BOTH DATE FIELDS)
// ============================================
app.get(
  "/api/complaints/admin/trends",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { days = 7 } = req.query;
      
      const currentAdmin = await Users.findOne({ _id: toObjectId(req.user.userId) });
      const adminType = currentAdmin?.adminType || "super";

      // Build query based on admin type
      let baseQuery = {};
      
      if (adminType === "department" && currentAdmin.department) {
        baseQuery.department = currentAdmin.department;
      } else if (adminType === "womens_cell") {
        baseQuery.$or = [
          { category: { $regex: /harassment/i } },
          { category: { $regex: /eve teasing/i } },
          { category: { $regex: /safety/i } },
          { type: "confidential" },
          { type: "sensitive" },
        ];
      } else if (adminType === "academic") {
        baseQuery.$or = [
          { category: { $regex: /academic/i } },
          { category: { $regex: /exam/i } },
        ];
      } else if (adminType === "anti_ragging") {
        baseQuery.$or = [
          { category: { $regex: /ragging/i } },
          { category: { $regex: /bullying/i } },
        ];
      }
      
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));
      daysAgo.setHours(0, 0, 0, 0);

      console.log(`📅 Fetching trends from: ${daysAgo.toISOString()}`);

      // ✅ FIX: Use $or to check both submittedAt AND createdAt
      baseQuery.$or = baseQuery.$or || [];
      baseQuery.$or.push(
        { submittedAt: { $gte: daysAgo } },
        { createdAt: { $gte: daysAgo } }
      );

      // Count total matching complaints
      const totalCount = await Complaints.countDocuments(baseQuery);
      console.log(`📊 Total complaints in range: ${totalCount}`);

      // Aggregate by day (use whichever date field exists)
      const trends = await Complaints.aggregate([
        { $match: baseQuery },
        {
          $addFields: {
            dateField: {
              $ifNull: ["$submittedAt", "$createdAt"] // Use submittedAt if exists, else createdAt
            }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$dateField" }
            },
            submitted: { $sum: 1 },
            resolved: {
              $sum: {
                $cond: [
                  { $or: [
                    { $eq: ["$status", "Resolved"] },
                    { $eq: ["$Status", "Resolved"] } // Handle both cases
                  ]}, 
                  1, 
                  0
                ]
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ]).toArray();

      console.log(`📈 Aggregated trends:`, trends);

      // Fill in missing days with 0
      const result = [];
      for (let i = parseInt(days) - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateStr = date.toISOString().split('T')[0];
        
        const found = trends.find(t => t._id === dateStr);
        
        result.push({
          date: dateStr,
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          submitted: found?.submitted || 0,
          resolved: found?.resolved || 0,
        });
      }

      console.log(`✅ Final trends data (${result.length} days):`, result);

      res.json({
        success: true,
        trends: result
      });

    } catch (error) {
      console.error("❌ Trends error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to fetch trends",
        error: error.message
      });
    }
  }
);

// ============================================
// EXISTING AUTH ROUTES (UNCHANGED)
// ============================================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password, role, roll } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const normalizedRole = normalizeRole(role);
    if (normalizedRole === "student" && !roll) {
      return res
        .status(400)
        .json({ message: "Roll number required for students" });
    }

    const existing = await Users.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const now = new Date();

    const newUser = {
      name,
      email,
      password: hash,
      role: normalizedRole,
      ...(normalizedRole === "student" && { roll }),
      createdAt: now,
      updatedAt: now,
    };

    const r = await Users.insertOne(newUser);
    const userId = r.insertedId.toString();

    const payload = { userId, email, role: normalizedRole };
    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });

    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      token: accessToken,
      refreshToken,
      user: {
        id: userId,
        _id: userId,
        name,
        email,
        role: normalizedRole,
        ...(normalizedRole === "student" && { roll }),
      },
    });
  } catch (e) {
    console.error("Register error:", e);
    const code = e.code === 11000 ? 409 : 500;
    res.status(code).json({ message: e.message || "Internal server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password, role: requestedRole } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  try {
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPwdValid = await bcrypt.compare(password, user.password);
    if (!isPwdValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const normalizedUserRole = normalizeRole(user.role);
    const normalizedRequestedRole = requestedRole
      ? normalizeRole(requestedRole)
      : null;

    if (
      normalizedRequestedRole &&
      normalizedRequestedRole !== normalizedUserRole
    ) {
      return res.status(403).json({
        message: `Access denied! Account (${email}) is "${normalizedUserRole}", not "${normalizedRequestedRole}". Use correct role.`,
      });
    }

    // ✅ NEW: Enhanced payload with admin metadata
    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: normalizedUserRole,
    };

    // ✅ NEW: Add admin-specific data if user is admin
    if (normalizedUserRole === "admin") {
      payload.adminType = user.adminType || "super"; // Default to super if not set
      payload.department = user.department || null;
      payload.permissions = user.permissions || [];
    }

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });

    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const { password: _, ...safeUser } = user;

    // ✅ NEW: Enhanced response with admin metadata
    const responseUser = {
      ...safeUser,
      role: normalizedUserRole,
      id: user._id.toString(),
      _id: user._id.toString(),
    };

    // Add admin-specific fields to response
    if (normalizedUserRole === "admin") {
      responseUser.adminType = user.adminType || "super";
      responseUser.department = user.department || null;
      responseUser.departmentName = user.departmentName || null;
      responseUser.permissions = user.permissions || [];
      
      console.log(`✅ Admin login: ${user.email} (Type: ${responseUser.adminType})`);
    }

    res.status(200).json({
      user: responseUser,
      token: accessToken,
      refreshToken: refreshToken || accessToken,
      role: normalizedUserRole,
    });
  } catch (e) {
    console.error("Login error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---------- ONE-TIME ADMIN SESSION CODE ----------
const oneTimeCodes = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [code, data] of oneTimeCodes.entries()) {
    if (now - data.createdAt > 2 * 60 * 1000) {
      oneTimeCodes.delete(code);
    }
  }
}, 60 * 1000);

app.post("/api/auth/admin-session-code", async (req, res) => {
  try {
    const { token, refreshToken, user } = req.body;
    if (!token || !user || user.role !== "admin") {
      return res.status(400).json({ message: "Invalid admin session data" });
    }

    const code = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    oneTimeCodes.set(code, {
      token,
      refreshToken: refreshToken || null,
      user,
      createdAt: Date.now(),
    });

    console.log("✅ One-time code generated for admin:", user.email);
    res.json({ code });
  } catch (error) {
    console.error("Session code generation error:", error);
    res.status(500).json({ message: "Failed to generate session code" });
  }
});

app.post("/api/auth/exchange-admin-code", async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Code required" });
    }

    const sessionData = oneTimeCodes.get(code);
    if (!sessionData) {
      return res.status(401).json({ message: "Invalid or expired code" });
    }

    const age = Date.now() - sessionData.createdAt;
    if (age > 2 * 60 * 1000) {
      oneTimeCodes.delete(code);
      return res.status(401).json({ message: "Code expired" });
    }

    oneTimeCodes.delete(code);
    console.log("✅ Code exchanged for admin:", sessionData.user.email);

    res.json({
      token: sessionData.token,
      refreshToken: sessionData.refreshToken,
      user: sessionData.user,
    });
  } catch (error) {
    console.error("Code exchange error:", error);
    res.status(500).json({ message: "Failed to exchange code" });
  }
});

// ---------- REFRESH TOKEN ----------
app.post("/api/auth/refresh", async (req, res) => {
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
      { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
    );

    res.json({ token: newAccessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(401).json({ message: "Invalid or expired refresh token" });
  }
});

// ============================================
// CHANGE PASSWORD (FIXED - HANDLES OBJECT PASSWORD)
// ============================================
app.put("/api/auth/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    console.log('🔑 Password change request from:', req.user.email);
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Current and new password required" 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false,
        message: "New password must be at least 6 characters" 
      });
    }

    const user = await Users.findOne({
      _id: toObjectId(req.user.userId),
    });
    
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // ✅ FIX: Handle password being an object or string
    let storedPassword = user.password;
    
    // If password is an object, extract the string value
    if (typeof storedPassword === 'object' && storedPassword !== null) {
      storedPassword = storedPassword.toString();
    }
    
    // Ensure we have a valid password string
    if (!storedPassword || typeof storedPassword !== 'string') {
      console.error('❌ Invalid password format in database for user:', user.email);
      return res.status(500).json({
        success: false,
        message: "Password data is corrupted. Please contact support."
      });
    }

    console.log('🔍 Password type check:', typeof storedPassword, storedPassword.substring(0, 10) + '...');

    // Compare passwords
    const isMatch = await bcrypt.compare(currentPassword, storedPassword);
    
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "Current password is incorrect" 
      });
    }

    // Hash new password
    const hash = await bcrypt.hash(newPassword, 10);
    
    await Users.updateOne(
      { _id: toObjectId(req.user.userId) },
      { $set: { password: hash, updatedAt: new Date() } }
    );

    if (req.user.role === "admin") {
      await AdminLogs.insertOne({
        adminId: req.user.userId,
        action: "CHANGE_PASSWORD",
        timestamp: new Date(),
      });
    }

    console.log('✅ Password changed for:', user.email);

    return res.json({ 
      success: true,
      message: "Password changed successfully" 
    });
  } catch (e) {
    console.error("❌ Change password error:", e);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error",
      error: e.message 
    });
  }
});

// ---------- PROFILE ----------
app.get("/api/profile", auth, async (req, res) => {
  try {
    const user = await Users.findOne(
      { _id: toObjectId(req.user.userId) },
      { projection: { password: 0 } }
    );
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json(user);
  } catch (e) {
    console.error("Profile fetch error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put("/api/profile", auth, async (req, res) => {
  try {
    const allowedFields = {};
    if ("name" in req.body) allowedFields.name = req.body.name;
    if ("phone" in req.body) allowedFields.phone = req.body.phone;
    allowedFields.updatedAt = new Date();

    await Users.updateOne(
      { _id: toObjectId(req.user.userId) },
      { $set: allowedFields }
    );

    res.json({ message: "Profile updated" });
  } catch (e) {
    console.error("Profile update error:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/profile/stats", auth, async (req, res) => {
  try {
    const total = await Complaints.countDocuments({
      userId: req.user.userId,
    });

    const pending = await Complaints.countDocuments({
      userId: req.user.userId,
      status: "Pending",
    });

    const inProgress = await Complaints.countDocuments({
      userId: req.user.userId,
      status: "In Progress",
    });

    const resolved = await Complaints.countDocuments({
      userId: req.user.userId,
      status: "Resolved",
    });

    res.json({ total, pending, inProgress, resolved });
  } catch {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// ---------- COMPLAINTS: STUDENT & ADMIN ----------
app.post(
  "/api/complaints",
  auth,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "pdfDocument", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { subject, description, category, location, priority, isAnonymous } =
        req.body;

      if (!subject || !description || !category || !location) {
        return res
          .status(400)
          .json({ message: "All required fields must be provided" });
      }

      const userId = req.user.userId;
      const user = await Users.findOne({ _id: toObjectId(userId) });
      if (!user) return res.status(404).json({ message: "User not found" });

      const imageUrls = [];
      if (req.files && req.files["images"]) {
        for (const file of req.files["images"]) {
          try {
            const result = await uploadToCloudinary(file.buffer, {
              folder: "campus-complaints/images",
              resource_type: "image",
              transformation: {
                width: 1200,
                quality: "auto",
                crop: "limit",
              },
            });
            imageUrls.push(result.secure_url);
          } catch (imgError) {
            console.error("Image upload failed:", imgError.message);
          }
        }
      }

      let pdfUrl = null;
      let pdfPublicId = null;

      if (
        req.files &&
        req.files["pdfDocument"] &&
        req.files["pdfDocument"][0]
      ) {
        try {
          const result = await uploadToCloudinary(
            req.files["pdfDocument"][0].buffer,
            {
              folder: "campus-complaints/documents",
              resource_type: "raw",
              format: "pdf",
              type: "upload",
              access_mode: "public",
            }
          );

          pdfUrl = result.secure_url;
          pdfPublicId = result.public_id;
        } catch (pdfError) {
          console.error("PDF upload failed:", pdfError.message);
          pdfUrl = null;
        }
      }

      const complaintCount = await Complaints.countDocuments();
      const complaintId = `CMP${String(complaintCount + 1).padStart(5, "0")}`;

      const now = new Date();

      // ========== AUTO-ASSIGN DEPARTMENT BASED ON CATEGORY ==========
      let departmentId = null;
      let departmentName = null;

      const categoryDepartmentMap = {
        // Infrastructure → Maintenance
        'electrical': 'Maintenance',
        'plumbing': 'Maintenance',
        'furniture': 'Maintenance',
        'civil': 'Maintenance',
        'ac/cooling': 'Maintenance',
        'ac': 'Maintenance',
        'building': 'Maintenance',
        'infrastructure': 'Maintenance',
        'fan': 'Maintenance',
        'light': 'Maintenance',
        
        // Tech → IT Department
        'wifi': 'IT Department',
        'internet': 'IT Department',
        'computer': 'IT Department',
        'projector': 'IT Department',
        'software': 'IT Department',
        'network': 'IT Department',
        'it': 'IT Department',
        'technical': 'IT Department',
        
        // Cleanliness → Housekeeping
        'cleaning': 'Housekeeping',
        'washroom': 'Housekeeping',
        'garbage': 'Housekeeping',
        'sanitation': 'Housekeeping',
        'hygiene': 'Housekeeping',
        'water': 'Housekeeping',
        
        // Sensitive → Special Cells
        'harassment': "Women's Cell",
        'eve teasing': "Women's Cell",
        'safety': "Women's Cell",
        'women': "Women's Cell",
        'ragging': 'Anti-Ragging Cell',
        'bullying': 'Anti-Ragging Cell',
        'discrimination': "Dean's Office",
        
        // Academic
        'academic': 'Academic',
        'examination': 'Academic',
        'exam': 'Academic',
        'faculty': 'Academic',
        'teacher': 'Academic',
        'syllabus': 'Academic',
        
        // Hostel
        'hostel': 'Hostel',
        'mess': 'Hostel',
        'food': 'Hostel',
        'canteen': 'Hostel',
        'accommodation': 'Hostel',
        
        // Transport
        'transport': 'Transport',
        'bus': 'Transport',
        'vehicle': 'Transport',
        
        // Library
        'library': 'Library',
        'books': 'Library',
        
        // Other
        'other': null,
      };

      // Try to match category to department
      const categoryLower = category.toLowerCase().trim();
      let mappedDeptName = categoryDepartmentMap[categoryLower];
      
      // If exact match not found, try partial match
      if (!mappedDeptName) {
        for (const [key, value] of Object.entries(categoryDepartmentMap)) {
          if (categoryLower.includes(key) || key.includes(categoryLower)) {
            mappedDeptName = value;
            break;
          }
        }
      }

      // Find the department in database
      if (mappedDeptName) {
        const dept = await Departments.findOne({ 
          name: { $regex: new RegExp(`^${mappedDeptName}$`, 'i') },
          isActive: { $ne: false }
        });
        
        if (dept) {
          departmentId = dept._id;
          departmentName = dept.name;
          console.log(`✅ Auto-assigned to department: ${dept.name} (Category: ${category})`);
        } else {
          console.log(`⚠️ Department "${mappedDeptName}" not found in database`);
        }
      } else {
        console.log(`ℹ️ No department mapping for category: ${category}`);
      }
      // ========== END AUTO-ASSIGN DEPARTMENT ==========

      // ✅ NEW: Determine if complaint should be anonymous
      const sensitiveCategories = [
        'harassment', 'eve teasing', 'safety', 'ragging', 
        'bullying', 'discrimination', 'abuse', 'assault',
        'women', 'personal', 'confidential'
      ];

      // Auto-mark as anonymous if category is sensitive
      const isSensitiveCategory = sensitiveCategories.some(cat => 
        categoryLower.includes(cat)
      );

      // Complaint is anonymous if:
      // 1. Student explicitly checked the box, OR
      // 2. Category is sensitive (auto-anonymous for safety)
      const shouldBeAnonymous = 
        isAnonymous === "true" || 
        isAnonymous === true || 
        isSensitiveCategory;

      // ✅ NEW: Determine complaint type based on sensitivity
      let complaintType = "general";
      
      if (categoryLower.includes('harassment') || 
          categoryLower.includes('assault') || 
          categoryLower.includes('abuse') ||
          categoryLower.includes('eve teasing')) {
        complaintType = "confidential"; // Highest privacy
      } else if (categoryLower.includes('ragging') || 
                 categoryLower.includes('discrimination') ||
                 categoryLower.includes('bullying') ||
                 categoryLower.includes('safety')) {
        complaintType = "sensitive"; // Moderate privacy
      }

      const complaint = {
        complaintId,
        userId,
        submittedBy: user.name,
        email: user.email,
        subject,
        title: subject,
        description,
        category,
        location,
        priority: priority || "Medium",
        images: imageUrls,
        pdfDocument: pdfUrl,
        pdfPublicId,
        status: "Pending",
        adminRemarks: "",
        
        // ✅ UPDATED: Anonymous handling
        isAnonymous: shouldBeAnonymous,
        type: complaintType,
        
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
        resolvedAt: null,
        readByAdmin: false,
        readAt: null,
        timeline: [
          {
            status: "Pending",
            timestamp: now,
            message: shouldBeAnonymous 
              ? "Anonymous complaint submitted" 
              : "Complaint submitted",
          },
        ],
        
        // Department & Assignment Fields
        department: departmentId,
        departmentName: departmentName,
        assignedTo: null,
        assignedToName: null,
        assignedToEmail: null,
        assignedBy: null,
        assignedAt: null,
      };

      const r = await Complaints.insertOne(complaint);

      console.log(`✅ Complaint created: ${complaintId} (Anonymous: ${shouldBeAnonymous}, Type: ${complaintType}, Dept: ${departmentName || 'None'})`);

      res.status(201).json({
        id: r.insertedId,
        complaintId: complaint.complaintId,
        message: "Complaint submitted successfully",
        complaint: { ...complaint, id: r.insertedId },
      });
    } catch (e) {
      console.error("Error submitting complaint:", e);
      res
        .status(500)
        .json({ message: "Internal server error", error: e.message });
    }
  }
);
app.get("/api/complaints/mine", auth, async (req, res) => {
  try {
    const complaints = await Complaints.find({ userId: req.user.userId })
      .sort({ submittedAt: -1 })
      .toArray();

    const transformed = complaints.map((c) => ({
      ...c,
      title: c.title || c.subject,
      createdAt: c.createdAt || c.submittedAt,
    }));

    res.json(transformed);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/complaints/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    const complaint = await Complaints.findOne({ _id: toObjectId(id) });
    if (!complaint) {
      return res.status(404).json({ message: "Not found" });
    }

    if (
      req.user.role !== "admin" &&
      String(complaint.userId) !== req.user.userId
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    const transformed = {
      ...complaint,
      title: complaint.title || complaint.subject,
      createdAt: complaint.createdAt || complaint.submittedAt,
    };

    res.json(transformed);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

app.put(
  "/api/complaints/:id",
  auth,
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "pdfDocument", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const complaint = await Complaints.findOne({ _id: toObjectId(id) });
      if (!complaint) {
        return res.status(404).json({ message: "Not found" });
      }

      if (req.user.role !== "admin") {
        if (String(complaint.userId) !== req.user.userId) {
          return res.status(403).json({ message: "Not allowed to edit" });
        }

        if (complaint.status !== "Pending") {
          return res
            .status(403)
            .json({ message: "Cannot edit non-pending complaint" });
        }

        if (complaint.assignedTo) {
          return res
            .status(403)
            .json({ message: "Cannot edit assigned complaint" });
        }
      }

      const {
        subject,
        description,
        category,
        priority,
        location,
        isAnonymous,
        existingImages,
        existingPdf,
      } = req.body;

      const updateFields = { updatedAt: new Date() };

      if (subject) {
        updateFields.subject = subject;
        updateFields.title = subject;
      }
      if (description) updateFields.description = description;
      if (category) updateFields.category = category;
      if (priority) updateFields.priority = priority;
      if (location) updateFields.location = location;
      if (typeof isAnonymous !== "undefined") {
        updateFields.isAnonymous =
          isAnonymous === "true" || isAnonymous === true;
      }

      let finalImages = [];
      if (existingImages) {
        if (Array.isArray(existingImages)) {
          finalImages = [...existingImages];
        } else if (typeof existingImages === "string") {
          try {
            finalImages = JSON.parse(existingImages);
          } catch {
            finalImages = [existingImages];
          }
        }
      }

      if (req.files && req.files["images"]) {
        for (const file of req.files["images"]) {
          try {
            const result = await uploadToCloudinary(file.buffer, {
              folder: "campus-complaints/images",
              resource_type: "image",
              transformation: {
                width: 1200,
                quality: "auto",
                crop: "limit",
              },
            });
            finalImages.push(result.secure_url);
          } catch (imgError) {
            console.error("Image upload failed:", imgError.message);
          }
        }
      }

      updateFields.images = finalImages;

      if (existingPdf && existingPdf !== "null" && existingPdf !== "") {
        updateFields.pdfDocument = existingPdf;
      } else if (
        req.files &&
        req.files["pdfDocument"] &&
        req.files["pdfDocument"][0]
      ) {
        try {
          const result = await uploadToCloudinary(
            req.files["pdfDocument"][0].buffer,
            {
              folder: "campus-complaints/documents",
              resource_type: "raw",
              format: "pdf",
              type: "upload",
              access_mode: "public",
            }
          );

          updateFields.pdfDocument = result.secure_url;
          updateFields.pdfPublicId = result.public_id;
        } catch (pdfError) {
          console.error("PDF upload failed:", pdfError.message);
        }
      } else if (!existingPdf || existingPdf === "null" || existingPdf === "") {
        updateFields.pdfDocument = null;
        updateFields.pdfPublicId = null;
      }

      const update = await Complaints.updateOne(
        { _id: toObjectId(id) },
        { $set: updateFields }
      );

      if (!update.matchedCount) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      const updatedComplaint = await Complaints.findOne({
        _id: toObjectId(id),
      });

      const transformed = {
        ...updatedComplaint,
        title: updatedComplaint.title || updatedComplaint.subject,
        createdAt: updatedComplaint.createdAt || updatedComplaint.submittedAt,
      };

      res.json({
        message: "Complaint updated successfully",
        complaint: transformed,
      });
    } catch (e) {
      console.error("Update error:", e);
      res
        .status(500)
        .json({ message: "Internal server error", error: e.message });
    }
  }
);

app.get("/api/complaints", auth, async (req, res) => {
  try {
    const query =
      req.user.role === "admin" ? {} : { userId: req.user.userId };

    const complaints = await Complaints.find(query)
      .sort({ submittedAt: -1 })
      .toArray();

    const transformed = complaints.map((c) => ({
      ...c,
      title: c.title || c.subject,
      createdAt: c.createdAt || c.submittedAt,
    }));

    res.json(transformed);
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get(
  "/api/complaints/admin/all",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      // ✅ Get current admin's details
      const currentAdmin = await Users.findOne({ _id: toObjectId(req.user.userId) });
      
      if (!currentAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }

      const adminType = currentAdmin.adminType || "super";
      
      console.log(`📋 Admin Type: ${adminType} (${currentAdmin.email})`);

      // ✅ Build query based on admin type
      let query = {};

      if (adminType === "super") {
        // Super Admin sees EVERYTHING
        console.log("✅ Super Admin: Showing ALL complaints");
        query = {};
      } 
      else if (adminType === "department") {
        // Department Admin sees ONLY their department
        if (currentAdmin.department) {
          query.department = currentAdmin.department;
          console.log(`✅ Department Admin: Filtering for ${currentAdmin.departmentName}`);
        } else {
          // If no department assigned, show nothing
          console.log("⚠️ Department Admin has no department assigned");
          query._id = { $exists: false }; // Returns empty
        }
      }
      else if (adminType === "womens_cell") {
        // Women's Cell sees ONLY sensitive/harassment complaints
        query.$or = [
          { category: { $regex: /harassment/i } },
          { category: { $regex: /eve teasing/i } },
          { category: { $regex: /safety/i } },
          { category: { $regex: /women/i } },
          { category: { $regex: /ragging/i } },
          { type: "confidential" },
          { type: "sensitive" },
        ];
        console.log("✅ Women's Cell: Filtering sensitive complaints");
      }
      else if (adminType === "academic") {
        // Academic Admin sees ONLY academic complaints
        query.$or = [
          { category: { $regex: /academic/i } },
          { category: { $regex: /exam/i } },
          { category: { $regex: /faculty/i } },
          { category: { $regex: /teacher/i } },
          { category: { $regex: /syllabus/i } },
          { departmentName: { $regex: /academic/i } },
        ];
        console.log("✅ Academic Admin: Filtering academic complaints");
      }
      else if (adminType === "anti_ragging") {
        // Anti-Ragging sees ONLY ragging/bullying complaints
        query.$or = [
          { category: { $regex: /ragging/i } },
          { category: { $regex: /bullying/i } },
          { category: { $regex: /harassment/i } },
          { category: { $regex: /discipline/i } },
        ];
        console.log("✅ Anti-Ragging Admin: Filtering ragging complaints");
      }
      else {
        // Unknown admin type - show nothing for security
        console.log(`⚠️ Unknown admin type: ${adminType}`);
        query._id = { $exists: false };
      }

      // Fetch complaints with the built query
      const complaints = await Complaints.find(query)
        .sort({ submittedAt: -1 })
        .toArray();

      const transformed = complaints.map((c) => ({
        ...c,
        title: c.title || c.subject,
        createdAt: c.createdAt || c.submittedAt,
      }));

      console.log(`✅ Returning ${transformed.length} complaints for ${adminType} admin (${currentAdmin.email})`);
      
      res.json(transformed);
    } catch (err) {
      console.error("❌ Error fetching complaints:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ---------- ADMIN COMPLAINTS ----------
app.put(
  "/api/admin/complaints/:id/status",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, adminRemarks, assignedTo } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const updateFields = { updatedAt: new Date() };

      if (status) {
        updateFields.status = status;
        const timelineEntry = {
          status,
          timestamp: new Date(),
          message: `Status changed to ${status}`,
        };

        await Complaints.updateOne(
          { _id: toObjectId(id) },
          { $push: { timeline: timelineEntry } }
        );
      }

      if (adminRemarks) updateFields.adminRemarks = adminRemarks;
      if (assignedTo) updateFields.assignedTo = assignedTo;
      if (status === "Resolved") updateFields.resolvedAt = new Date();

      const result = await Complaints.updateOne(
        { _id: toObjectId(id) },
        { $set: updateFields }
      );

      if (!result.matchedCount) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      await AdminLogs.insertOne({
        adminId: req.user.userId,
        action: "UPDATE_STATUS",
        complaintId: id,
        details: { status, adminRemarks, assignedTo },
        timestamp: new Date(),
      });

      res.json({ message: "Complaint status updated" });
    } catch (e) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.put(
  "/api/admin/complaints/:id/assign",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { assignedTo } = req.body;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      await Complaints.updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            assignedTo,
            status: "In Progress",
            updatedAt: new Date(),
          },
          $push: {
            timeline: {
              status: "In Progress",
              timestamp: new Date(),
              message: `Assigned to ${assignedTo}`,
            },
          },
        }
      );

      res.json({ message: "Complaint assigned successfully" });
    } catch {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.get(
  "/api/complaints/admin/unread",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      // ✅ Get current admin's details
      const currentAdmin = await Users.findOne({ _id: toObjectId(req.user.userId) });
      const adminType = currentAdmin?.adminType || "super";

      // ✅ Build query
      let baseQuery = {
        $or: [{ readByAdmin: { $exists: false } }, { readByAdmin: false }],
      };

      // Add role-based filtering
      if (adminType === "department" && currentAdmin.department) {
        baseQuery.department = currentAdmin.department;
      } else if (adminType === "womens_cell") {
        baseQuery.$and = [
          { $or: baseQuery.$or },
          {
            $or: [
              { category: { $regex: /harassment/i } },
              { category: { $regex: /safety/i } },
              { type: "confidential" },
            ],
          },
        ];
        delete baseQuery.$or;
      } else if (adminType === "academic") {
        baseQuery.$and = [
          { $or: baseQuery.$or },
          {
            $or: [
              { category: { $regex: /academic/i } },
              { category: { $regex: /exam/i } },
            ],
          },
        ];
        delete baseQuery.$or;
      } else if (adminType === "anti_ragging") {
        baseQuery.$and = [
          { $or: baseQuery.$or },
          {
            $or: [
              { category: { $regex: /ragging/i } },
              { category: { $regex: /bullying/i } },
            ],
          },
        ];
        delete baseQuery.$or;
      }

      let unread = await Complaints.find(baseQuery)
        .sort({ submittedAt: -1 })
        .limit(10)
        .toArray();

      if (!unread || unread.length === 0) {
        // If no unread, get recent ones
        let recentQuery = {};
        if (adminType === "department" && currentAdmin.department) {
          recentQuery.department = currentAdmin.department;
        } else if (adminType === "womens_cell") {
          recentQuery.$or = [
            { category: { $regex: /harassment/i } },
            { type: "confidential" },
          ];
        } else if (adminType === "academic") {
          recentQuery.$or = [
            { category: { $regex: /academic/i } },
            { category: { $regex: /exam/i } },
          ];
        } else if (adminType === "anti_ragging") {
          recentQuery.$or = [
            { category: { $regex: /ragging/i } },
          ];
        }

        unread = await Complaints.find(recentQuery)
          .sort({ submittedAt: -1 })
          .limit(10)
          .toArray();
      }

      const transformed = unread.map((c) => ({
        ...c,
        title: c.title || c.subject,
        createdAt: c.createdAt || c.submittedAt,
      }));

      res.json(transformed);
    } catch (error) {
      console.error("Unread complaints error:", error);
      res.status(500).json({ message: "Failed to fetch unread complaints" });
    }
  }
);
app.patch(
  "/api/complaints/admin/:id/read",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid complaint ID" });
      }

      const result = await Complaints.updateOne(
        { _id: toObjectId(id) },
        {
          $set: {
            readByAdmin: true,
            readAt: new Date(),
          },
        }
      );

      if (!result.matchedCount) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      await AdminLogs.insertOne({
        adminId: req.user.userId,
        action: "VIEW_COMPLAINT",
        complaintId: id,
        timestamp: new Date(),
      });

      res.json({ message: "Marked as read" });
    } catch (error) {
      console.error("Error marking as read:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// ---------- ADMIN ANALYTICS ----------
app.get(
  "/api/complaints/admin/analytics",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      // ✅ Get current admin's details
      const currentAdmin = await Users.findOne({ _id: toObjectId(req.user.userId) });
      const adminType = currentAdmin?.adminType || "super";

      // ✅ Build same query as complaint list
      let query = {};

      if (adminType === "department" && currentAdmin.department) {
        query.department = currentAdmin.department;
      } else if (adminType === "womens_cell") {
        query.$or = [
          { category: { $regex: /harassment/i } },
          { category: { $regex: /eve teasing/i } },
          { category: { $regex: /safety/i } },
          { category: { $regex: /women/i } },
          { type: "confidential" },
          { type: "sensitive" },
        ];
      } else if (adminType === "academic") {
        query.$or = [
          { category: { $regex: /academic/i } },
          { category: { $regex: /exam/i } },
          { category: { $regex: /faculty/i } },
        ];
      } else if (adminType === "anti_ragging") {
        query.$or = [
          { category: { $regex: /ragging/i } },
          { category: { $regex: /bullying/i } },
        ];
      }

      // Get stats with filtered query
      const total = await Complaints.countDocuments(query);
      const pending = await Complaints.countDocuments({ ...query, status: "Pending" });
      const inProgress = await Complaints.countDocuments({ ...query, status: "In Progress" });
      const assigned = await Complaints.countDocuments({ ...query, status: "Assigned" });
      const resolved = await Complaints.countDocuments({ ...query, status: "Resolved" });
      const rejected = await Complaints.countDocuments({ ...query, status: "Rejected" });

      const categoryStats = await Complaints.aggregate([
        { $match: query },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]).toArray();

      const priorityStats = await Complaints.aggregate([
        { $match: query },
        {
          $group: {
            _id: { $ifNull: ["$priority", "UNKNOWN"] },
            count: { $sum: 1 },
          },
        },
      ]).toArray();

      const byPriority = {};
      priorityStats.forEach((p) => {
        const key = p._id || "UNKNOWN";
        byPriority[key] = p.count || 0;
      });

      const resolutionAgg = await Complaints.aggregate([
        {
          $match: {
            ...query,
            status: "Resolved",
            resolvedAt: { $ne: null },
            submittedAt: { $ne: null },
          },
        },
        {
          $project: {
            diffHours: {
              $divide: [
                { $subtract: ["$resolvedAt", "$submittedAt"] },
                1000 * 60 * 60,
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgHours: { $avg: "$diffHours" },
          },
        },
      ]).toArray();

      const avgResolutionTime =
        resolutionAgg.length > 0 ? resolutionAgg[0].avgHours : 0;

      res.json({
        stats: {
          total,
          pending,
          inProgress,
          assigned,
          resolved,
          rejected,
        },
        categories: categoryStats,
        byCategory: null,
        categoryStats,
        byPriority,
        priorities: priorityStats,
        avgResolutionTime,
      });
    } catch (e) {
      console.error("Analytics error:", e);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  }
);

// backend/index.js - ADD THIS ENDPOINT (after other admin endpoints):

// ✅ ADMIN: Reset Student Registration
app.post(
  "/api/admin/students/reset",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { rollNo } = req.body;

      if (!rollNo) {
        return res.status(400).json({ message: "Roll number required" });
      }

      // Find student in whitelist
      const student = await AllowedStudents.findOne({ rollNo: rollNo.trim() });
      
      if (!student) {
        return res.status(404).json({ message: "Student not found in whitelist" });
      }

      // Delete from Users if exists
      if (student.userId) {
        await Users.deleteOne({ _id: toObjectId(student.userId) });
      }

      // Reset in AllowedStudents
      await AllowedStudents.updateOne(
        { rollNo: rollNo.trim() },
        {
          $set: {
            isRegistered: false,
            registeredAt: null,
            registeredEmail: null,
            userId: null,
          },
        }
      );

      // Log activity
      await AdminLogs.insertOne({
        adminId: req.user.userId,
        action: "RESET_STUDENT",
        details: { rollNo, studentName: student.name },
        timestamp: new Date(),
      });

      res.json({ 
        success: true,
        message: `Student ${student.name} (${rollNo}) reset successfully. They can register again.` 
      });
    } catch (error) {
      console.error("Reset student error:", error);
      res.status(500).json({ message: "Failed to reset student" });
    }
  }
);

// ==================== PUBLIC ROUTES (NO AUTH) ====================

app.get("/api/complaints/public/stats", async (req, res) => {
  try {
    const totalResolved = await Complaints.countDocuments({ status: "Resolved" });

    const resolvedComplaints = await Complaints.find({
      status: "Resolved",
      submittedAt: { $exists: true },
      resolvedAt: { $exists: true },
    }).toArray();

    let avgResponseHours = 24;

    if (resolvedComplaints.length > 0) {
      const totalTime = resolvedComplaints.reduce((sum, c) => {
        if (c.submittedAt && c.resolvedAt) {
          const timeDiff = new Date(c.resolvedAt) - new Date(c.submittedAt);
          return sum + timeDiff;
        }
        return sum;
      }, 0);

      avgResponseHours = Math.round(
        totalTime / resolvedComplaints.length / 1000 / 60 / 60
      );
      if (avgResponseHours < 1) avgResponseHours = 1;
    }

    const totalComplaints = await Complaints.countDocuments();
    const satisfactionRate =
      totalComplaints > 0
        ? Math.round((totalResolved / totalComplaints) * 100)
        : 95;

    console.log("✅ Landing stats:", {
      totalResolved,
      avgResponseHours,
      satisfactionRate,
    });

    res.status(200).json({
      totalResolved: totalResolved || 50,
      avgResponseTime: `${avgResponseHours} Hrs`,
      satisfactionRate: satisfactionRate || 95,
    });
  } catch (error) {
    console.error("❌ Error fetching landing stats:", error);
    res.status(500).json({
      message: "Failed to fetch stats",
      error: error.message,
    });
  }
});

// backend/index.js - ADD THESE ENDPOINTS

// ✅ ENDPOINT 1: Search Student by Roll Number
app.post(
  "/api/admin/students/search",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { rollNo } = req.body;

      if (!rollNo) {
        return res.status(400).json({ 
          success: false,
          message: "Roll number required" 
        });
      }

      // Find student in whitelist
      const student = await AllowedStudents.findOne({ rollNo: rollNo.trim() });
      
      if (!student) {
        return res.status(404).json({ 
          success: false,
          message: `Roll number ${rollNo} not found in whitelist` 
        });
      }

      res.json({ 
        success: true,
        student: {
          name: student.name,
          rollNo: student.rollNo,
          batch: student.batch,
          batchType: student.batchType,
          isRegistered: student.isRegistered,
          registeredEmail: student.registeredEmail || null,
          registeredAt: student.registeredAt || null,
        }
      });
    } catch (error) {
      console.error("Search student error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to search student" 
      });
    }
  }
);

// ✅ ENDPOINT 2: Reset Student Registration
app.post(
  "/api/admin/students/reset",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { rollNo } = req.body;

      if (!rollNo) {
        return res.status(400).json({ 
          success: false,
          message: "Roll number required" 
        });
      }

      console.log(`🔧 Admin resetting student: ${rollNo}`);

      // Find student in whitelist
      const student = await AllowedStudents.findOne({ rollNo: rollNo.trim() });
      
      if (!student) {
        return res.status(404).json({ 
          success: false,
          message: `Roll number ${rollNo} not found in whitelist` 
        });
      }

      console.log(`📋 Found student: ${student.name}`);

      let usersDeleted = 0;

      // Delete from Users by userId
      if (student.userId) {
        try {
          const result = await Users.deleteOne({ _id: toObjectId(student.userId) });
          usersDeleted += result.deletedCount;
          console.log(`🗑️ Deleted by userId: ${result.deletedCount}`);
        } catch (err) {
          console.log("⚠️ Failed to delete by userId:", err.message);
        }
      }

      // Delete from Users by email (backup)
      if (student.registeredEmail) {
        try {
          const result = await Users.deleteOne({ email: student.registeredEmail });
          usersDeleted += result.deletedCount;
          console.log(`🗑️ Deleted by email: ${result.deletedCount}`);
        } catch (err) {
          console.log("⚠️ Failed to delete by email:", err.message);
        }
      }

      // Delete ALL users with this roll number (thorough cleanup)
      const rollDeleteResult = await Users.deleteMany({ 
        $or: [
          { roll: rollNo.trim() },
          { rollNo: rollNo.trim() }
        ]
      });
      usersDeleted += rollDeleteResult.deletedCount;
      console.log(`🗑️ Deleted by rollNo: ${rollDeleteResult.deletedCount}`);

      // Reset in AllowedStudents using $unset
      await AllowedStudents.updateOne(
        { rollNo: rollNo.trim() },
        {
          $set: {
            isRegistered: false
          },
          $unset: {
            registeredAt: "",
            registeredEmail: "",
            userId: ""
          }
        }
      );

      console.log(`✅ Reset complete for ${student.name}`);

      // Log activity
      await AdminLogs.insertOne({
        adminId: req.user.userId,
        action: "RESET_STUDENT",
        details: { 
          rollNo, 
          studentName: student.name,
          usersDeleted 
        },
        timestamp: new Date(),
      });

      res.json({ 
        success: true,
        message: `${student.name} can now register again!`,
        details: {
          studentName: student.name,
          rollNo: rollNo,
          usersDeleted,
        }
      });
    } catch (error) {
      console.error("❌ Reset student error:", error);
      res.status(500).json({ 
        success: false,
        message: "Failed to reset student",
        error: error.message 
      });
    }
  }
);

// ============================================
// ADMIN: Student Registration Stats
// ============================================

app.get(
  "/api/admin/students/stats",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const total = await AllowedStudents.countDocuments();
      const registered = await AllowedStudents.countDocuments({ isRegistered: true });
      const notRegistered = total - registered;

      // Batch-wise breakdown
      const batchStats = await AllowedStudents.aggregate([
        {
          $group: {
            _id: "$batch",
            total: { $sum: 1 },
            registered: {
              $sum: { $cond: ["$isRegistered", 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]).toArray();

      // Recent registrations
      const recentRegistrations = await AllowedStudents.find({ isRegistered: true })
        .sort({ registeredAt: -1 })
        .limit(10)
        .project({ name: 1, rollNo: 1, batch: 1, registeredAt: 1 })
        .toArray();

      res.json({
        overview: {
          total,
          registered,
          notRegistered,
          registrationRate: Math.round((registered / total) * 100),
        },
        byBatch: batchStats,
        recentRegistrations,
      });
    } catch (error) {
      console.error("Student stats error:", error);
      res.status(500).json({ message: "Failed to fetch student stats" });
    }
  }
);

// Get list of all students (for admin to see who registered)
app.get(
  "/api/admin/students/list",
  auth,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { batch, registered } = req.query;
      
      const query = {};
      if (batch) query.batch = batch;
      if (registered === "true") query.isRegistered = true;
      if (registered === "false") query.isRegistered = false;

      const students = await AllowedStudents.find(query)
        .sort({ rollNo: 1 })
        .toArray();

      res.json(students);
    } catch (error) {
      console.error("Student list error:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  }
);
// ============================================
// DEPARTMENT MANAGEMENT ENDPOINTS
// ============================================

// GET: All departments
app.get("/api/departments", async (req, res) => {
  try {
    const departments = await Departments.find({ isActive: { $ne: false } })
      .sort({ name: 1 })
      .toArray();

    res.json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ message: "Failed to fetch departments" });
  }
});

// GET: Single department
app.get("/api/departments/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const department = await Departments.findOne({ _id: toObjectId(id) });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json({ success: true, data: department });
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ message: "Failed to fetch department" });
  }
});

// POST: Create department (Admin only)
app.post("/api/departments", auth, requireRole("admin"), async (req, res) => {
  try {
    const { name, description, categories, headName, headEmail, headPhone } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Department name is required" });
    }

    // Check if department already exists
  // Check if department already exists (only active ones)
const existing = await Departments.findOne({ 
  name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
  isActive: { $ne: false }
});

if (existing) {
  return res.status(400).json({ message: "Department with this name already exists" });
}

// Check if there's a soft-deleted one with same name - reactivate it
const softDeleted = await Departments.findOne({
  name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
  isActive: false
});

if (softDeleted) {
  // Reactivate and update the existing record
  await Departments.updateOne(
    { _id: softDeleted._id },
    { 
      $set: { 
        isActive: true,
        description: description?.trim() || softDeleted.description || "",
        categories: Array.isArray(categories) ? categories : softDeleted.categories || [],
        headName: headName?.trim() || softDeleted.headName || "",
        headEmail: headEmail?.trim() || softDeleted.headEmail || "",
        headPhone: headPhone?.trim() || softDeleted.headPhone || "",
        updatedAt: new Date()
      } 
    }
  );

  const reactivated = await Departments.findOne({ _id: softDeleted._id });

  await AdminLogs.insertOne({
    adminId: req.user.userId,
    action: "REACTIVATE_DEPARTMENT",
    details: { departmentId: softDeleted._id, name: name.trim() },
    timestamp: new Date(),
  });

  return res.status(201).json({
    success: true,
    message: "Department reactivated successfully",
    data: reactivated,
  });
}

    const now = new Date();
    const department = {
      name: name.trim(),
      description: description?.trim() || "",
      categories: Array.isArray(categories) ? categories : [],
      headName: headName?.trim() || "",
      headEmail: headEmail?.trim() || "",
      headPhone: headPhone?.trim() || "",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const result = await Departments.insertOne(department);

    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: "CREATE_DEPARTMENT",
      details: { departmentId: result.insertedId, name: department.name },
      timestamp: now,
    });

    res.status(201).json({
      success: true,
      message: "Department created successfully",
      data: { ...department, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating department:", error);
    res.status(500).json({ message: "Failed to create department" });
  }
});

// PUT: Update department (Admin only)
app.put("/api/departments/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, categories, headName, headEmail, headPhone, isActive } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const existing = await Departments.findOne({ _id: toObjectId(id) });
    if (!existing) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Check if new name conflicts with another department
// Check if new name conflicts with another ACTIVE department
if (name && name.trim().toLowerCase() !== existing.name.toLowerCase()) {
  const nameConflict = await Departments.findOne({
    _id: { $ne: toObjectId(id) },
    name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    isActive: { $ne: false }
  });
  if (nameConflict) {
    return res.status(400).json({ message: "Another department with this name exists" });
  }
}

    const updateFields = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateFields.name = name.trim();
    if (description !== undefined) updateFields.description = description.trim();
    if (categories !== undefined) updateFields.categories = Array.isArray(categories) ? categories : [];
    if (headName !== undefined) updateFields.headName = headName.trim();
    if (headEmail !== undefined) updateFields.headEmail = headEmail.trim();
    if (headPhone !== undefined) updateFields.headPhone = headPhone.trim();
    if (isActive !== undefined) updateFields.isActive = isActive;

    await Departments.updateOne(
      { _id: toObjectId(id) },
      { $set: updateFields }
    );

    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: "UPDATE_DEPARTMENT",
      details: { departmentId: id, updates: updateFields },
      timestamp: new Date(),
    });

    const updated = await Departments.findOne({ _id: toObjectId(id) });

    res.json({
      success: true,
      message: "Department updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ message: "Failed to update department" });
  }
});

// DELETE: Delete department (Admin only) - Soft delete
app.delete("/api/departments/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const existing = await Departments.findOne({ _id: toObjectId(id) });
    if (!existing) {
      return res.status(404).json({ message: "Department not found" });
    }

    // Soft delete
    await Departments.updateOne(
      { _id: toObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: "DELETE_DEPARTMENT",
      details: { departmentId: id, name: existing.name },
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ message: "Failed to delete department" });
  }
});

// GET: Department categories (for dropdowns)
app.get("/api/departments/:id/categories", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const department = await Departments.findOne({ _id: toObjectId(id) });

    if (!department) {
      return res.status(404).json({ message: "Department not found" });
    }

    res.json({
      success: true,
      data: department.categories || [],
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Failed to fetch categories" });
  }
});

// ============================================
// STAFF MANAGEMENT ENDPOINTS
// ============================================

// GET: All staff (with optional department filter)
app.get("/api/staff", async (req, res) => {
  try {
    const { department } = req.query;
    
    const query = { isActive: { $ne: false } };
    if (department && ObjectId.isValid(department)) {
      query.department = toObjectId(department);
    }

    const staff = await db.collection("Staff")
      .find(query)
      .sort({ name: 1 })
      .toArray();

    // Populate department names
    const departmentIds = [...new Set(staff.map(s => s.department).filter(Boolean))];
    const departments = await Departments.find({
      _id: { $in: departmentIds.map(id => toObjectId(id)) }
    }).toArray();

    const deptMap = {};
    departments.forEach(d => {
      deptMap[d._id.toString()] = d.name;
    });

    const populatedStaff = staff.map(s => ({
      ...s,
      departmentName: s.department ? deptMap[s.department.toString()] || 'Unknown' : 'Not Assigned'
    }));

    res.json({
      success: true,
      count: populatedStaff.length,
      data: populatedStaff,
    });
  } catch (error) {
    console.error("Error fetching staff:", error);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
});

// GET: Staff by department
app.get("/api/staff/department/:departmentId", async (req, res) => {
  try {
    const { departmentId } = req.params;

    if (!ObjectId.isValid(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const staff = await db.collection("Staff")
      .find({ 
        department: toObjectId(departmentId),
        isActive: { $ne: false }
      })
      .sort({ role: -1, name: 1 }) // Supervisors first
      .toArray();

    res.json({
      success: true,
      count: staff.length,
      data: staff,
    });
  } catch (error) {
    console.error("Error fetching staff by department:", error);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
});

// GET: Single staff member
app.get("/api/staff/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid staff ID" });
    }

    const staffMember = await db.collection("Staff").findOne({ _id: toObjectId(id) });

    if (!staffMember) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Get department name
    if (staffMember.department) {
      const dept = await Departments.findOne({ _id: toObjectId(staffMember.department) });
      staffMember.departmentName = dept?.name || 'Unknown';
    }

    res.json({ success: true, data: staffMember });
  } catch (error) {
    console.error("Error fetching staff member:", error);
    res.status(500).json({ message: "Failed to fetch staff member" });
  }
});

// POST: Create staff member (Admin only)
app.post("/api/staff", auth, requireRole("admin"), async (req, res) => {
  try {
    const { name, email, phone, role, department } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Staff name is required" });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!department) {
      return res.status(400).json({ message: "Department is required" });
    }

    // Check if email already exists
// Check if email already exists (only active ones)
const existing = await db.collection("Staff").findOne({ 
  email: email.toLowerCase().trim(),
  isActive: { $ne: false }
});

if (existing) {
  return res.status(400).json({ message: "Staff with this email already exists" });
}

// Check if there's a soft-deleted one with same email - reactivate it
const softDeleted = await db.collection("Staff").findOne({
  email: email.toLowerCase().trim(),
  isActive: false
});

if (softDeleted) {
  // Verify department exists
  const dept = await Departments.findOne({ _id: toObjectId(department) });
  if (!dept) {
    return res.status(400).json({ message: "Department not found" });
  }

  // Reactivate and update the existing record
  await db.collection("Staff").updateOne(
    { _id: softDeleted._id },
    { 
      $set: { 
        isActive: true,
        name: name.trim(),
        phone: phone?.trim() || "",
        role: role || "Worker",
        department: toObjectId(department),
        departmentName: dept.name,
        updatedAt: new Date()
      } 
    }
  );

  const reactivated = await db.collection("Staff").findOne({ _id: softDeleted._id });

  await AdminLogs.insertOne({
    adminId: req.user.userId,
    action: "REACTIVATE_STAFF",
    details: { staffId: softDeleted._id, name: name.trim(), email: email.toLowerCase().trim() },
    timestamp: new Date(),
  });

  return res.status(201).json({
    success: true,
    message: "Staff member reactivated successfully",
    data: reactivated,
  });
}
    // Verify department exists
    if (!ObjectId.isValid(department)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }

    const dept = await Departments.findOne({ _id: toObjectId(department) });
    if (!dept) {
      return res.status(400).json({ message: "Department not found" });
    }

    const now = new Date();
    const staffMember = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || "",
      role: role || "Worker", // Worker or Supervisor
      department: toObjectId(department),
      departmentName: dept.name,
      isActive: true,
      complaintsAssigned: 0,
      complaintsResolved: 0,
      createdAt: now,
      updatedAt: now,
    };

    const result = await db.collection("Staff").insertOne(staffMember);

    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: "CREATE_STAFF",
      details: { staffId: result.insertedId, name: staffMember.name, department: dept.name },
      timestamp: now,
    });

    res.status(201).json({
      success: true,
      message: "Staff member created successfully",
      data: { ...staffMember, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating staff:", error);
    res.status(500).json({ message: "Failed to create staff member" });
  }
});

// PUT: Update staff member (Admin only)
app.put("/api/staff/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, department, isActive } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid staff ID" });
    }

    const existing = await db.collection("Staff").findOne({ _id: toObjectId(id) });
    if (!existing) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Check email conflict
// Check email conflict (only active staff)
if (email && email.toLowerCase().trim() !== existing.email) {
  const emailConflict = await db.collection("Staff").findOne({
    _id: { $ne: toObjectId(id) },
    email: email.toLowerCase().trim(),
    isActive: { $ne: false }
  });
  if (emailConflict) {
    return res.status(400).json({ message: "Another staff member with this email exists" });
  }
}

    const updateFields = {
      updatedAt: new Date(),
    };

    if (name !== undefined) updateFields.name = name.trim();
    if (email !== undefined) updateFields.email = email.toLowerCase().trim();
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (role !== undefined) updateFields.role = role;
    if (isActive !== undefined) updateFields.isActive = isActive;

    // Update department if provided
    if (department !== undefined) {
      if (!ObjectId.isValid(department)) {
        return res.status(400).json({ message: "Invalid department ID" });
      }
      const dept = await Departments.findOne({ _id: toObjectId(department) });
      if (!dept) {
        return res.status(400).json({ message: "Department not found" });
      }
      updateFields.department = toObjectId(department);
      updateFields.departmentName = dept.name;
    }

    await db.collection("Staff").updateOne(
      { _id: toObjectId(id) },
      { $set: updateFields }
    );

    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: "UPDATE_STAFF",
      details: { staffId: id, updates: updateFields },
      timestamp: new Date(),
    });

    const updated = await db.collection("Staff").findOne({ _id: toObjectId(id) });

    res.json({
      success: true,
      message: "Staff member updated successfully",
      data: updated,
    });
  } catch (error) {
    console.error("Error updating staff:", error);
    res.status(500).json({ message: "Failed to update staff member" });
  }
});

// DELETE: Delete staff member (Admin only) - Soft delete
app.delete("/api/staff/:id", auth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid staff ID" });
    }

    const existing = await db.collection("Staff").findOne({ _id: toObjectId(id) });
    if (!existing) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    // Soft delete
    await db.collection("Staff").updateOne(
      { _id: toObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: "DELETE_STAFF",
      details: { staffId: id, name: existing.name },
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: "Staff member deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting staff:", error);
    res.status(500).json({ message: "Failed to delete staff member" });
  }
});

// GET: Staff stats (for dashboard)
app.get("/api/staff/stats/overview", auth, requireRole("admin"), async (req, res) => {
  try {
    const totalStaff = await db.collection("Staff").countDocuments({ isActive: { $ne: false } });
    const supervisors = await db.collection("Staff").countDocuments({ role: "Supervisor", isActive: { $ne: false } });
    const workers = await db.collection("Staff").countDocuments({ role: "Worker", isActive: { $ne: false } });

    // Staff by department
    const byDepartment = await db.collection("Staff").aggregate([
      { $match: { isActive: { $ne: false } } },
      { $group: { _id: "$departmentName", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]).toArray();

    res.json({
      success: true,
      data: {
        total: totalStaff,
        supervisors,
        workers,
        byDepartment,
      },
    });
  } catch (error) {
    console.error("Error fetching staff stats:", error);
    res.status(500).json({ message: "Failed to fetch staff stats" });
  }
});

// ============================================
// COMPLAINT ASSIGNMENT ENDPOINTS
// ============================================

// POST: Assign complaint to staff
app.post("/api/complaints/:id/assign", auth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId, priority, remarks } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    if (!staffId) {
      return res.status(400).json({ message: "Staff ID is required" });
    }

    if (!ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: "Invalid staff ID" });
    }

    // Find complaint
    const complaint = await Complaints.findOne({ _id: toObjectId(id) });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // Find staff member
    const staff = await db.collection("Staff").findOne({ 
      _id: toObjectId(staffId),
      isActive: { $ne: false }
    });
    if (!staff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const now = new Date();

    // Update complaint
    const updateFields = {
      assignedTo: staffId,
      assignedToName: staff.name,
      assignedToEmail: staff.email,
      assignedBy: req.user.userId,
      assignedAt: now,
      status: "Assigned",
      updatedAt: now,
    };

    if (priority) {
      updateFields.priority = priority;
    }

    // Add to timeline
    const timelineEntry = {
      status: "Assigned",
      timestamp: now,
      message: `Assigned to ${staff.name} (${staff.departmentName || 'Staff'})`,
      by: req.user.userId,
    };

    if (remarks) {
      timelineEntry.remarks = remarks;
      updateFields.adminRemarks = remarks;
    }

    await Complaints.updateOne(
      { _id: toObjectId(id) },
      { 
        $set: updateFields,
        $push: { timeline: timelineEntry }
      }
    );

    // Update staff assignment count
    await db.collection("Staff").updateOne(
      { _id: toObjectId(staffId) },
      { $inc: { complaintsAssigned: 1 } }
    );

    // Log admin action
    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: "ASSIGN_COMPLAINT",
      complaintId: id,
      details: { 
        staffId, 
        staffName: staff.name,
        priority: priority || complaint.priority 
      },
      timestamp: now,
    });

    // Get updated complaint
    const updated = await Complaints.findOne({ _id: toObjectId(id) });

    res.json({
      success: true,
      message: `Complaint assigned to ${staff.name}`,
      data: updated,
    });
  } catch (error) {
    console.error("Error assigning complaint:", error);
    res.status(500).json({ message: "Failed to assign complaint" });
  }
});

// PUT: Reassign complaint to different staff
app.put("/api/complaints/:id/reassign", auth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { staffId, reason } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    if (!staffId || !ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: "Valid staff ID is required" });
    }

    const complaint = await Complaints.findOne({ _id: toObjectId(id) });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const newStaff = await db.collection("Staff").findOne({ 
      _id: toObjectId(staffId),
      isActive: { $ne: false }
    });
    if (!newStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    const previousStaffId = complaint.assignedTo;
    const now = new Date();

    // Update complaint
    await Complaints.updateOne(
      { _id: toObjectId(id) },
      { 
        $set: {
          assignedTo: staffId,
          assignedToName: newStaff.name,
          assignedToEmail: newStaff.email,
          assignedBy: req.user.userId,
          assignedAt: now,
          updatedAt: now,
        },
        $push: { 
          timeline: {
            status: "Reassigned",
            timestamp: now,
            message: `Reassigned to ${newStaff.name}${reason ? `: ${reason}` : ''}`,
            by: req.user.userId,
          }
        }
      }
    );

    // Update staff counts
    if (previousStaffId) {
      await db.collection("Staff").updateOne(
        { _id: toObjectId(previousStaffId) },
        { $inc: { complaintsAssigned: -1 } }
      );
    }
    await db.collection("Staff").updateOne(
      { _id: toObjectId(staffId) },
      { $inc: { complaintsAssigned: 1 } }
    );

    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: "REASSIGN_COMPLAINT",
      complaintId: id,
      details: { previousStaffId, newStaffId: staffId, newStaffName: newStaff.name, reason },
      timestamp: now,
    });

    const updated = await Complaints.findOne({ _id: toObjectId(id) });

    res.json({
      success: true,
      message: `Complaint reassigned to ${newStaff.name}`,
      data: updated,
    });
  } catch (error) {
    console.error("Error reassigning complaint:", error);
    res.status(500).json({ message: "Failed to reassign complaint" });
  }
});

// PUT: Unassign complaint
app.put("/api/complaints/:id/unassign", auth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid complaint ID" });
    }

    const complaint = await Complaints.findOne({ _id: toObjectId(id) });
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    const previousStaffId = complaint.assignedTo;
    const now = new Date();

    await Complaints.updateOne(
      { _id: toObjectId(id) },
      { 
        $set: {
          assignedTo: null,
          assignedToName: null,
          assignedToEmail: null,
          status: "Pending",
          updatedAt: now,
        },
        $push: { 
          timeline: {
            status: "Unassigned",
            timestamp: now,
            message: `Unassigned from staff${reason ? `: ${reason}` : ''}`,
            by: req.user.userId,
          }
        }
      }
    );

    // Decrease staff count
    if (previousStaffId) {
      await db.collection("Staff").updateOne(
        { _id: toObjectId(previousStaffId) },
        { $inc: { complaintsAssigned: -1 } }
      );
    }

    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: "UNASSIGN_COMPLAINT",
      complaintId: id,
      details: { previousStaffId, reason },
      timestamp: now,
    });

    res.json({
      success: true,
      message: "Complaint unassigned",
    });
  } catch (error) {
    console.error("Error unassigning complaint:", error);
    res.status(500).json({ message: "Failed to unassign complaint" });
  }
});

// GET: Complaints assigned to specific staff
app.get("/api/staff/:staffId/complaints", auth, requireRole("admin"), async (req, res) => {
  try {
    const { staffId } = req.params;

    if (!ObjectId.isValid(staffId)) {
      return res.status(400).json({ message: "Invalid staff ID" });
    }

    const complaints = await Complaints.find({ assignedTo: staffId })
      .sort({ updatedAt: -1 })
      .toArray();

    res.json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    console.error("Error fetching staff complaints:", error);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

// GET: Assignment stats
app.get("/api/complaints/admin/assignment-stats", auth, requireRole("admin"), async (req, res) => {
  try {
    const total = await Complaints.countDocuments();
    const assigned = await Complaints.countDocuments({ assignedTo: { $ne: null } });
    const unassigned = await Complaints.countDocuments({ 
      $or: [{ assignedTo: null }, { assignedTo: { $exists: false } }]
    });
    const pending = await Complaints.countDocuments({ status: "Pending" });
    const inProgress = await Complaints.countDocuments({ status: "In Progress" });
    const assignedStatus = await Complaints.countDocuments({ status: "Assigned" });
    const resolved = await Complaints.countDocuments({ status: "Resolved" });

    // Staff with most assignments
    const topStaff = await Complaints.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      { $group: { _id: "$assignedToName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]).toArray();

    res.json({
      success: true,
      data: {
        total,
        assigned,
        unassigned,
        byStatus: { pending, assigned: assignedStatus, inProgress, resolved },
        topStaff,
      },
    });
  } catch (error) {
    console.error("Error fetching assignment stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});



// ============================================
// ADMIN MANAGEMENT ENDPOINTS
// ============================================

// Helper: Check if user is super admin
function requireSuperAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  
  // If adminType exists in token, check it
  if (req.user.adminType && req.user.adminType !== "super") {
    return res.status(403).json({ message: "Super Admin access required" });
  }
  
  // For backwards compatibility, also check user in database
  Users.findOne({ _id: toObjectId(req.user.userId) })
    .then(user => {
      if (user && user.adminType && user.adminType !== "super") {
        return res.status(403).json({ message: "Super Admin access required" });
      }
      next();
    })
    .catch(() => {
      res.status(500).json({ message: "Authorization check failed" });
    });
}

// GET: List all admins (Super Admin only)
app.get("/api/admin/list", auth, requireSuperAdmin, async (req, res) => {
  try {
    const admins = await Users.find({ role: "admin" })
      .sort({ createdAt: -1 })
      .toArray();

    // Remove passwords
    const safeAdmins = admins.map(({ password, ...admin }) => ({
      ...admin,
      adminType: admin.adminType || "super",
      departmentName: admin.departmentName || null,
    }));

    res.json({
      success: true,
      count: safeAdmins.length,
      data: safeAdmins,
    });
  } catch (error) {
    console.error("Error fetching admins:", error);
    res.status(500).json({ message: "Failed to fetch admins" });
  }
});

// POST: Create new admin (Super Admin only)
app.post("/api/admin/create", auth, requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, adminType, department, permissions } = req.body;

    // Validation
    if (!name || !email || !password || !adminType) {
      return res.status(400).json({ 
        message: "Name, email, password, and admin type are required" 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        message: "Password must be at least 6 characters" 
      });
    }

    // Validate admin type
    const validAdminTypes = ['super', 'department', 'womens_cell', 'academic', 'anti_ragging'];
    if (!validAdminTypes.includes(adminType)) {
      return res.status(400).json({ 
        message: `Invalid admin type. Must be one of: ${validAdminTypes.join(', ')}` 
      });
    }

    // Department admins must have a department
    if (adminType === 'department' && !department) {
      return res.status(400).json({ 
        message: "Department is required for department admins" 
      });
    }

    // Check if email already exists
    const existing = await Users.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Get department name if department admin
    let departmentName = null;
    if (adminType === 'department' && department) {
      if (!ObjectId.isValid(department)) {
        return res.status(400).json({ message: "Invalid department ID" });
      }
      
      const dept = await Departments.findOne({ _id: toObjectId(department) });
      if (!dept) {
        return res.status(400).json({ message: "Department not found" });
      }
      departmentName = dept.name;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const now = new Date();
    const newAdmin = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: "admin",
      adminType: adminType,
      department: adminType === 'department' && department ? toObjectId(department) : null,
      departmentName: departmentName,
      permissions: permissions || [],
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
      createdBy: req.user.userId,
    };

    const result = await Users.insertOne(newAdmin);

    // Log action
    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: "CREATE_ADMIN",
      details: { 
        newAdminId: result.insertedId, 
        email: newAdmin.email,
        adminType: adminType,
        department: departmentName 
      },
      timestamp: now,
    });

    const { password: _, ...safeAdmin } = newAdmin;

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      data: { ...safeAdmin, _id: result.insertedId },
    });
  } catch (error) {
    console.error("Error creating admin:", error);
    res.status(500).json({ message: "Failed to create admin" });
  }
});

// PUT: Update admin (Super Admin only)
app.put("/api/admin/:id", auth, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, adminType, department, permissions, isActive } = req.body;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid admin ID" });
    }

    const existing = await Users.findOne({ _id: toObjectId(id) });
    if (!existing || existing.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Prevent super admin from changing their own type
    if (id === req.user.userId && adminType && adminType !== 'super') {
      return res.status(400).json({ 
        message: "You cannot change your own admin type" 
      });
    }

    const updateFields = { updatedAt: new Date() };

    if (name !== undefined) updateFields.name = name.trim();
    if (email !== undefined) {
      // Check email conflict
      const emailConflict = await Users.findOne({
        _id: { $ne: toObjectId(id) },
        email: email.toLowerCase().trim(),
      });
      if (emailConflict) {
        return res.status(400).json({ message: "Email already in use" });
      }
      updateFields.email = email.toLowerCase().trim();
    }
    if (adminType !== undefined) updateFields.adminType = adminType;
    if (permissions !== undefined) updateFields.permissions = permissions;
    if (isActive !== undefined) updateFields.isActive = isActive;

    // Handle department
    if (department !== undefined) {
      if (department && ObjectId.isValid(department)) {
        const dept = await Departments.findOne({ _id: toObjectId(department) });
        if (dept) {
          updateFields.department = toObjectId(department);
          updateFields.departmentName = dept.name;
        }
      } else {
        updateFields.department = null;
        updateFields.departmentName = null;
      }
    }

    await Users.updateOne(
      { _id: toObjectId(id) },
      { $set: updateFields }
    );

    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: "UPDATE_ADMIN",
      details: { adminId: id, updates: updateFields },
      timestamp: new Date(),
    });

    const updated = await Users.findOne({ _id: toObjectId(id) });
    const { password: _, ...safeAdmin } = updated;

    res.json({
      success: true,
      message: "Admin updated successfully",
      data: safeAdmin,
    });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ message: "Failed to update admin" });
  }
});

// DELETE: Delete admin (Super Admin only)
app.delete("/api/admin/:id", auth, requireSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid admin ID" });
    }

    // Prevent self-deletion
    if (id === req.user.userId) {
      return res.status(400).json({ 
        message: "You cannot delete your own account" 
      });
    }

    const existing = await Users.findOne({ _id: toObjectId(id) });
    if (!existing || existing.role !== "admin") {
      return res.status(404).json({ message: "Admin not found" });
    }

    // Soft delete
    await Users.updateOne(
      { _id: toObjectId(id) },
      { $set: { isActive: false, updatedAt: new Date() } }
    );

    await AdminLogs.insertOne({
      adminId: req.user.userId,
      action: "DELETE_ADMIN",
      details: { deletedAdminId: id, email: existing.email },
      timestamp: new Date(),
    });

    res.json({
      success: true,
      message: "Admin deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    res.status(500).json({ message: "Failed to delete admin" });
  }
});

// GET: Admin stats (for dashboard)
app.get("/api/admin/stats", auth, requireSuperAdmin, async (req, res) => {
  try {
    const total = await Users.countDocuments({ role: "admin", isActive: { $ne: false } });
    const superAdmins = await Users.countDocuments({ role: "admin", adminType: "super", isActive: { $ne: false } });
    const deptAdmins = await Users.countDocuments({ role: "admin", adminType: "department", isActive: { $ne: false } });
    const womensCell = await Users.countDocuments({ role: "admin", adminType: "womens_cell", isActive: { $ne: false } });

    const byType = await Users.aggregate([
      { $match: { role: "admin", isActive: { $ne: false } } },
      { $group: { _id: "$adminType", count: { $sum: 1 } } },
    ]).toArray();

    res.json({
      success: true,
      data: {
        total,
        superAdmins,
        deptAdmins,
        womensCell,
        byType,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});









// ---------- 404 & ERROR HANDLERS ----------
app.use((req, res) => {
  res.status(404).json({ message: "URL not found" });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({ message: "File too large. Max 10MB." });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({ message: "Too many files. Max 6 files." });
    }
    return res.status(400).json({ message: err.message });
  }

  if (err) {
    console.error("Server error:", err);
    return res
      .status(500)
      .json({ message: err.message || "Internal server error" });
  }

  next();
});

module.exports = app;