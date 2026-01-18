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

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      role: normalizedUserRole,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "24h",
    });

    const refreshToken = jwt.sign(
      { ...payload, type: "refresh" },
      process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const { password: _, ...safeUser } = user;

    res.status(200).json({
      user: {
        ...safeUser,
        role: normalizedUserRole,
        id: user._id.toString(),
        _id: user._id.toString(),
      },
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

// ---------- CHANGE PASSWORD ----------
app.post("/api/auth/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Current and new password required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "New password must be at least 6 characters" });
    }

    const user = await Users.findOne({
      _id: toObjectId(req.user.userId),
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password incorrect" });
    }

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

    return res.json({ message: "Password changed successfully" });
  } catch (e) {
    console.error("Change password error:", e);
    return res.status(500).json({ message: "Internal server error" });
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
        assignedTo: null,
        adminRemarks: "",
        isAnonymous:
          isAnonymous === "true" || isAnonymous === true ? true : false,
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
            message: "Complaint submitted",
          },
        ],
      };

      const r = await Complaints.insertOne(complaint);

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
      const complaints = await Complaints.find({})
        .sort({ submittedAt: -1 })
        .toArray();

      const transformed = complaints.map((c) => ({
        ...c,
        title: c.title || c.subject,
        createdAt: c.createdAt || c.submittedAt,
      }));

      console.log(`✅ Returning ${transformed.length} complaints to admin`);
      res.json(transformed);
    } catch (err) {
      console.error("Error fetching all complaints:", err);
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
      let unread = await Complaints.find({
        $or: [{ readByAdmin: { $exists: false } }, { readByAdmin: false }],
      })
        .sort({ submittedAt: -1 })
        .limit(10)
        .toArray();

      if (!unread || unread.length === 0) {
        unread = await Complaints.find()
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
      const total = await Complaints.countDocuments();
      const pending = await Complaints.countDocuments({ status: "Pending" });
      const inProgress = await Complaints.countDocuments({
        status: "In Progress",
      });
      const resolved = await Complaints.countDocuments({ status: "Resolved" });
      const rejected = await Complaints.countDocuments({ status: "Rejected" });

      const categoryStats = await Complaints.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
      ]).toArray();

      const priorityStats = await Complaints.aggregate([
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