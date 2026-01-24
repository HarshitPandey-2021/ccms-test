# 🎓 CCMS - Campus Complaint Management System

> Report it. Track it. Fix it. 🚀

Modern web application for managing campus facility complaints with automated department routing, staff assignment, email notifications, and comprehensive analytics.

**Status:** 🟢 Test Environment Live | 🟡 Production Migration In Progress

---

## 🌐 Live Environments

### Test Environment (Enhanced Version)
- **Landing Page:** [https://landing-test-liard-one.vercel.app](https://landing-test-liard-one.vercel.app) ✅
- **Admin Dashboard:** [https://admin-test-nine.vercel.app](https://admin-test-nine.vercel.app) ✅
- **Student Portal:** [https://user-dash-test.vercel.app](https://user-dash-test.vercel.app) ✅
- **Backend API:** [https://ccms-backend-test.onrender.com](https://ccms-backend-test.onrender.com) ✅

### Production Environment (Stable)
- **Landing Page:** [https://ccms-home.vercel.app](https://ccms-home.vercel.app)
- **Admin Dashboard:** [https://ccms-admin-rho.vercel.app](https://ccms-admin-rho.vercel.app)
- **Student Portal:** [https://ccms-student.vercel.app](https://ccms-student.vercel.app)
- **Backend API:** [https://campus-backend-rq7f.onrender.com](https://campus-backend-rq7f.onrender.com)

---

## ✨ Key Features

### Student Portal
- 🔐 **Secure Registration** - Email OTP verification via SendGrid
- 📝 **Complaint Submission** - File complaints with category selection and image upload
- 🔍 **Real-time Tracking** - Track complaint status and view history
- 🎭 **Anonymous Option** - Optional anonymity for sensitive complaints
- ⭐ **Feedback System** - Rate and review after resolution

### Admin Dashboard
- 📊 **Interactive Analytics** - Real-time statistics and trend charts
- 🏢 **Department Management** - Create and manage departments with categories
- 👥 **Staff Management** - Assign staff to departments with role-based access
- ✅ **Complaint Assignment** - Assign complaints to specific staff members
- 🔔 **Email Notifications** - Automated emails on status changes
- 🌓 **Dark Mode** - Full dark theme support
- 📱 **Fully Responsive** - Works on all devices

### Smart Features
- 🎯 **Auto-routing** - Complaints automatically assigned to departments based on category
- 🔒 **Role-based Access** - Different admin types (Regular, Women's Cell, Anti-Ragging, Dean)
- 📧 **SendGrid Integration** - OTP verification and notification emails
- 🔐 **JWT Authentication** - Secure token-based authentication
- 📷 **Cloudinary Integration** - Image upload and management

---

## 🔧 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas |
| Authentication | JWT, bcrypt, OTP (SendGrid) |
| File Storage | Cloudinary |
| Deployment | Vercel (Frontend), Render (Backend) |
| Email Service | SendGrid |

---

## 📦 Project Structure

```
CCMS-PROJECT/
│
├── 📂 frontend/student-ui/     ✅ Landing & Registration
│   ├── Login with email
│   ├── OTP verification
│   └── Responsive design
│
├── 📂 admin/                   ✅ Admin Dashboard
│   ├── Dashboard & Analytics
│   ├── Department Management
│   ├── Staff Management
│   ├── Complaint Assignment
│   └── Dark mode support
│
├── 📂 user-portal/             ✅ Student Dashboard
│   ├── File complaints
│   ├── Track status
│   ├── Anonymous option
│   └── Feedback system
│
└── 📂 backend/                 ✅ RESTful API
    ├── Authentication (JWT + OTP)
    ├── Complaints CRUD
    ├── Departments & Staff
    ├── Email notifications
    └── File uploads
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- SendGrid API key (for emails)
- Cloudinary account (for images)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd CCMS-PROJECT

# Backend Setup
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev

# Admin Dashboard
cd ../admin
npm install
npm run dev

# Student Portal
cd ../user-portal
npm install
npm run dev

# Landing Page
cd ../frontend/student-ui
npm install
npm run dev
```

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=mongodb+srv://...
DB_NAME=ccms
JWT_SECRET=your_secret_key
SENDGRID_API_KEY=SG.xxx...
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
PORT=5000
```

**Frontend (.env)**
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 API Endpoints

### Authentication
```http
POST   /api/register          # Register with OTP
POST   /api/verify-otp        # Verify OTP
POST   /api/login             # Login
GET    /api/profile           # Get user profile
PUT    /api/profile           # Update profile
```

### Complaints
```http
GET    /api/complaints              # Get all complaints
GET    /api/complaints/:id          # Get single complaint
POST   /api/complaints              # Create complaint
PUT    /api/complaints/:id          # Update complaint
PUT    /api/complaints/:id/assign   # Assign to staff
DELETE /api/complaints/:id          # Delete complaint
POST   /api/complaints/:id/feedback # Submit feedback
```

### Departments & Staff
```http
GET    /api/departments                    # Get all departments
POST   /api/departments                    # Create department
PUT    /api/departments/:id                # Update department
DELETE /api/departments/:id                # Delete department

GET    /api/staff                          # Get all staff
GET    /api/staff/department/:deptId       # Get staff by department
POST   /api/staff                          # Create staff
PUT    /api/staff/:id                      # Update staff
DELETE /api/staff/:id                      # Delete staff
```

---

## 🗄️ Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String,
  password: String,        // Hashed
  rollNo: String,          // For students
  role: "user" | "admin",
  adminType: String,       // regular | women_cell | anti_ragging | dean
  department: ObjectId,    // Reference
  isVerified: Boolean,
  createdAt: Date
}
```

### Complaints Collection
```javascript
{
  userId: ObjectId,
  title: String,
  description: String,
  category: String,
  images: [String],
  
  type: "general" | "sensitive" | "confidential",
  department: ObjectId,
  assignedTo: ObjectId,    // Staff
  assignedBy: ObjectId,    // Admin
  priority: "low" | "medium" | "high" | "urgent",
  isAnonymous: Boolean,
  
  status: "pending" | "assigned" | "in_progress" | "resolved",
  
  resolution: {
    remarks: String,
    resolvedAt: Date,
    resolvedBy: ObjectId
  },
  
  feedback: {
    rating: Number,
    comment: String,
    givenAt: Date
  },
  
  createdAt: Date
}
```

### Departments Collection
```javascript
{
  name: String,
  description: String,
  categories: [String],
  headName: String,
  headEmail: String,
  headPhone: String,
  isActive: Boolean,
  createdAt: Date
}
```

### Staff Collection
```javascript
{
  name: String,
  email: String,
  phone: String,
  role: "Worker" | "Supervisor",
  department: ObjectId,
  isActive: Boolean,
  createdAt: Date
}
```

---

## 🎯 Complaint Flow

```
Student Files Complaint
    ↓
Auto-assigned to Department (based on category)
    ↓
Admin Assigns to Staff Member
    ↓
Staff Works on Resolution
    ↓
Admin Updates Status → Student Receives Email
    ↓
Complaint Resolved
    ↓
Student Gives Feedback (rating + comment)
```

---

## 🔐 Admin Roles & Access Control

| Role | Can See | Permissions |
|------|---------|-------------|
| Regular Admin | General complaints | Assign, Update, Resolve |
| Women's Cell | Harassment, Safety complaints | View, Update, Resolve |
| Anti-Ragging | Ragging complaints | View, Update, Resolve |
| Dean/Super Admin | All complaints | Full access |

---

## 📧 Email Notifications

- ✅ OTP verification on registration
- ✅ Complaint filed confirmation
- ✅ Status change notifications
- ✅ Assignment notifications to staff
- ✅ Resolution confirmation
- ⏳ Weekly summary (planned)

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
# Deploy to Vercel
vercel --prod
```

### Backend (Render)
```bash
# Connect GitHub repo to Render
# Set environment variables in Render dashboard
# Auto-deploys on git push
```

---

## 🔜 Coming Soon

- [ ] Student feedback dashboard
- [ ] Advanced analytics with charts
- [ ] AI-powered categorization
- [ ] Duplicate complaint detection
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Real-time notifications (WebSocket)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📝 License

Academic Project - Built with ❤️ by Team CCMS

---

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Contact: pandey6051172@gmail.com

---

**Last Updated:** 24 January 2026 | **Version:** 2.0 (Enhanced)

---

> 💡 **Note:** Test environment includes all latest features. Production migration in progress.
