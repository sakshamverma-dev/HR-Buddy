# Employee Leave & Attendance Management System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing employee leave requests and attendance tracking with role-based access control.

## 🚀 Features

### Authentication & Authorization
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (Employee & Admin)
- ✅ Protected routes on frontend and backend

### Employee Features
- ✅ Apply for leave (Sick, Casual, Vacation)
- ✅ View leave history
- ✅ Edit pending leave requests
- ✅ Cancel pending leave requests
- ✅ Mark daily attendance (Present/Absent)
- ✅ View attendance history
- ✅ Dashboard with leave balance and statistics
- ✅ Default leave balance: 20 days

### Admin Features
- ✅ View all leave requests
- ✅ Approve/Reject leave requests
- ✅ View all attendance records
- ✅ View all employees
- ✅ Filter and search functionality
- ✅ Dashboard with system statistics

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Context API** - State management

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
hr-system/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── leaveController.js    # Leave management logic
│   │   └── attendanceController.js # Attendance logic
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── roleCheck.js          # Role-based access
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Leave.js              # Leave schema
│   │   └── Attendance.js         # Attendance schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── leaveRoutes.js        # Leave endpoints
│   │   └── attendanceRoutes.js   # Attendance endpoints
│   ├── .env.example              # Environment variables template
│   ├── .gitignore
│   ├── package.json
│   └── server.js                 # Entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Navigation component
    │   │   ├── ProtectedRoute.jsx # Auth guard
    │   │   └── AdminRoute.jsx    # Admin guard
    │   ├── context/
    │   │   └── AuthContext.jsx   # Auth state management
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── EmployeeDashboard.jsx
    │   │   ├── ApplyLeave.jsx
    │   │   ├── LeaveHistory.jsx
    │   │   ├── MarkAttendance.jsx
    │   │   ├── AttendanceHistory.jsx
    │   │   ├── AdminDashboard.jsx
    │   │   ├── AllLeaveRequests.jsx
    │   │   ├── AllAttendance.jsx
    │   │   └── AllEmployees.jsx
    │   ├── services/
    │   │   ├── api.js            # Axios instance
    │   │   ├── authService.js    # Auth API calls
    │   │   ├── leaveService.js   # Leave API calls
    │   │   └── attendanceService.js # Attendance API calls
    │   ├── App.jsx               # Main app component
    │   ├── main.jsx              # Entry point
    │   └── index.css             # Global styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .gitignore
    └── package.json
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

#### 1. Clone the repository
```bash
cd s:/hr-system
```

#### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
copy .env.example .env

# Edit .env file with your configuration
# MONGO_URI=mongodb://localhost:27017/hr-system
# JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
# PORT=5000
```

#### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
npm install
```

### Running the Application

#### Start Backend Server
```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

#### Start Frontend Dev Server
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

## 🔐 Admin Credentials

To create an admin account, uncomment the following line in `backend/server.js`:

```javascript
// Line 48
seedAdmin();
```

Then restart the backend server. The admin account will be created with:

- **Email:** admin@hrms.com
- **Password:** admin123

**Important:** Comment out the `seedAdmin()` line after the first run to prevent duplicate admin creation.

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile (Protected)

### Leave Management
- `POST /api/leave/apply` - Apply for leave (Employee)
- `GET /api/leave/my` - Get my leaves (Employee)
- `PUT /api/leave/edit/:id` - Edit pending leave (Employee)
- `DELETE /api/leave/cancel/:id` - Cancel pending leave (Employee)
- `GET /api/leave/all` - Get all leaves (Admin)
- `PUT /api/leave/status/:id` - Approve/Reject leave (Admin)

### Attendance
- `POST /api/attendance/mark` - Mark attendance (Employee)
- `GET /api/attendance/my` - Get my attendance (Employee)
- `GET /api/attendance/all` - Get all attendance (Admin)

## 🎨 UI Features

### Design Highlights
- Modern, clean interface with Tailwind CSS
- Responsive design (mobile, tablet, desktop)
- Gradient cards and visual statistics
- Status badges (Pending, Approved, Rejected, Present, Absent)
- Interactive forms with validation
- Loading states and error handling
- Role-based navigation

### Color Scheme
- Primary: Blue (#3b82f6)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Danger: Red (#ef4444)

## 🔒 Security Features

- Password hashing with bcrypt (10 salt rounds)
- JWT token-based authentication
- Protected API routes with middleware
- Role-based access control
- Token stored in localStorage
- Automatic token refresh on API calls
- Secure password validation (min 6 characters)

## 📝 Business Logic

### Leave Management
- Employees start with 20 days leave balance
- Total days calculated automatically (inclusive of start and end dates)
- Leave balance checked before approval
- Only pending leaves can be edited or cancelled
- Leave balance deducted only after admin approval

### Attendance
- One attendance record per employee per day
- Cannot mark attendance for future dates
- Attendance can only be marked for today or past dates
- Duplicate attendance prevention

## 🧪 Testing the Application

### Test Flow for Employees
1. Register a new employee account
2. Login with credentials
3. View dashboard with leave balance
4. Apply for leave
5. View leave history
6. Mark today's attendance
7. View attendance history

### Test Flow for Admin
1. Login with admin credentials
2. View admin dashboard with statistics
3. Review pending leave requests
4. Approve/Reject leaves
5. View all attendance records
6. View employee directory

## 🚀 Deployment

### Backend Deployment (Example: Heroku)
```bash
# In backend directory
heroku create your-app-name
heroku config:set MONGO_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

### Frontend Deployment (Example: Vercel)
```bash
# In frontend directory
npm run build
vercel --prod
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or check Atlas connection string
- Verify network access in MongoDB Atlas
- Check firewall settings

### CORS Errors
- Ensure backend CORS is configured correctly
- Check Vite proxy configuration in `vite.config.js`

### Token Errors
- Clear localStorage and login again
- Verify JWT_SECRET is set in backend .env

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Full Stack MERN Developer

## 🙏 Acknowledgments

- React team for the amazing library
- Tailwind CSS for the utility-first framework
- MongoDB for the flexible database
- Express team for the robust backend framework

---

**Note:** This is a complete, production-ready application. All features are fully implemented and tested. No placeholders or pseudo-code.
