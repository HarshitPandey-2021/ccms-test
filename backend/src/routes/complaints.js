// backend/src/routes/complaints.js
const express = require("express");
const router = express.Router();
const complaintsController = require("../controllers/complaintsController");
const { auth, requireRole } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// ==================== PUBLIC ROUTES (NO AUTH) ====================

router.get("/public/stats", complaintsController.getLandingStats);

// ==================== ADMIN ROUTES ====================

router.get(
  "/admin/all",
  auth,
  requireRole("admin"),
  complaintsController.getAllComplaints
);

router.get(
  "/admin/analytics",
  auth,
  requireRole("admin"),
  complaintsController.getAnalyticsData
);

router.get(
  "/admin/unread",
  auth,
  requireRole("admin"),
  complaintsController.getUnreadComplaints
);

router.put(
  "/admin/:id",
  auth,
  requireRole("admin"),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "pdfDocument", maxCount: 1 },
  ]),
  complaintsController.updateComplaint
);

router.put(
  "/admin/:id/status",
  auth,
  requireRole("admin"),
  complaintsController.updateComplaintStatus
);

router.patch(
  "/admin/:id/read",
  auth,
  requireRole("admin"),
  complaintsController.markComplaintAsRead
);

router.get(
  "/admin/:id",
  auth,
  requireRole("admin"),
  complaintsController.getComplaintById
);

// ==================== STUDENT ROUTES ====================

router.post(
  "/",
  auth,
  requireRole("student"),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "pdfDocument", maxCount: 1 },
  ]),
  complaintsController.createComplaint
);

router.get(
  "/mine",
  auth,
  requireRole("student"),
  complaintsController.getUserComplaints
);

router.put(
  "/:id",
  auth,
  requireRole("student"),
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "pdfDocument", maxCount: 1 },
  ]),
  complaintsController.updateComplaint
);

// ✅ FEEDBACK ROUTE - Student submits feedback for resolved complaint
router.post(
  "/:id/feedback",
  auth,
  requireRole("student"),
  complaintsController.submitFeedback  // We'll create this function
);

// ==================== SHARED ROUTES ====================

router.get("/:id", auth, complaintsController.getComplaintById);

module.exports = router;