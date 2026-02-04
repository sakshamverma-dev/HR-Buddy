# Employee Leave & Attendance Management System (HR Buddy)

> **HR Buddy** is a modern, full-stack "Mini HR Tool" designed to streamline employee management. It allows employees to mark attendance and apply for leave, while providing Admins with powerful tools to manage requests and view reports.

**Deployed Application:**
- **Frontend:** [https://hrbuddy.vercel.app/](https://hrbuddy.vercel.app/)
- **Backend:** [https://hr-buddy-backend-theta.vercel.app/](https://hr-buddy-backend-theta.vercel.app/)

---

## 📌 Project Overview

This system was built to solve the manual tracking capabilities of small organizations. It features a complete **Role-Based Access Control (RBAC)** system separating Employees and Admins.

**Key Features:**
- **Secure Authentication:** JWT-based login with password hashing.
- **Attendance Tracking:** One-click attendance marking with strictly enforced rules (e.g., no future dates).
- **Leave Management:** Complete lifecycle handling (Apply -> Pending -> Approve/Reject).
- **Dashboards:** Dedicated views for Employees (personal stats) and Admins (organization-wide oversight).

### 🏆 Bonus Features Implemented
We went the extra mile to include advanced features:
- **📧 Real Email Notifications:** Integrated **Nodemailer** to send actual emails to employees when their leave status changes.
- **📊 Monthly Reports & CSV Export:** Admins can generate and download detailed monthly attendance reports.
- **🔍 Advanced Filtering & Pagination:** Implemented server-side pagination and dynamic filters (by Date, Status, Employee Name) for large datasets.
- **⚙️ Auto Absent System:** Intelligent background logic that automatically marks "Absent" for missed days.

---

## 🛠 Tech Stack & Justification

| Technology | Usage | Justification |
| :--- | :--- | :--- |
| **MongoDB** | Database | Flexible schema design perfect for evolving implementations like Leave/Attendance records. |
| **Express.js** | Backend Framework | Minimalist and fast web framework for Node.js to handle API routing efficiently. |
| **React (Vite)** | Frontend | chosen for its component-based architecture and Vite's superior build performance over CRA. |
| **Node.js** | Runtime | Unified JavaScript environment allowing code sharing and consistent logic across the stack. |
| **Tailwind CSS** | Styling | Utility-first CSS framework for rapid UI development and responsive design without context switching. |

---

## 🚀 Installation & Setup

Follow these steps to run the project locally.

### 1. Clone the Repository
```bash
git clone <repository-url>
cd hr-buddy
```

### 2. Backend Setup
```bash
cd backend
npm install
```

**Configure Environment Variables:**
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin123
MAIL_USER=your_email@gmail.com
MAIL_PASS=your_app_password
```

**Start the Server:**
```bash
npm start
```
*Server runs on http://localhost:5000*

### 3. Frontend Setup
```bash
cd frontend
npm install
```

**Configure Vercel/Proxy or Env:**
Create a `.env` file in `frontend`:
```env
VITE_API_URL=http://localhost:5000
```

**Start the Client:**
```bash
npm run dev
```
*Client runs on http://localhost:5173*

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Register a new employee |
| POST | `/api/auth/login` | Login user & get JWT |
| GET | `/api/auth/me` | Get current user profile |

### Leaves
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/leave/apply` | Apply for new leave |
| GET | `/api/leave/my` | Get current user's leaves |
| GET | `/api/leave/all` | **(Admin)** Get all leave requests |
| PUT | `/api/leave/status/:id` | **(Admin)** Approve/Reject leave |
| PUT | `/api/leave/edit/:id` | Edit pending leave request |
| DELETE | `/api/leave/cancel/:id` | Cancel pending leave request |

### Attendance
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/attendance/mark` | Mark attendance for today |
| GET | `/api/attendance/my` | Get individual attendance history |
| GET | `/api/attendance/all` | **(Admin)** Get all employees' attendance |

---

## 🗄️ Database Models

1.  **User**: Stores Employee details, Role ('admin'/'employee'), Password Hash, and **Leave Balance**.
2.  **Leave**: Links to `User`. Stores Start/End Date, Type, Reason, and Status.
3.  **Attendance**: Links to `User`. Stores Date and Status ('Present'/'Absent').

**Relationships:**
- A `User` has many `Leave` requests.
- A `User` has many `Attendance` records.

---

## 🔑 Admin Credentials (Seeded)

The system automatically seeds an Admin account on first run if configured in `.env`.

*   **Email:** `admin@gmail.com`
*   **Password:** `admin123`

---

## 🤖 AI Tools Declaration & Usage

This project was developed with a hybrid approach, leveraging AI tools to enhance efficiency while manually implementing core business logic and structure.

| Component | Tool Used | Contribution Detail |
| :--- | :--- | :--- |
| **Project Structure** | **Manual** | Folder structure (MVC), database schema design, and API route planning were designed manually to ensure scalability. |
| **UI Design & CSS** | **Claude** | Used to generate clean, modern aesthetically pleasing UI components (gradients, cards, responsive tables) using Tailwind CSS. |
| **Frontend logic** | **GitHub Copilot** | Assisted in writing repetitive boilerplate code for API service calls (`axios` setup) and form state handling. |
| **Advanced Features** | **ChatGPT / Copilot** | Utilized for optimizing the Nodemailer configuration and generating the CSV Export logic (Blob creation). |
| **Auto Absent Logic** | **GitHub Copilot** | Generated the logic for automatically marking "Absent" for past days using date comparisons. |
| **Business Logic** | **Manual / ChatGPT** | Core logic for "Leave Balance Deduction", "Date Overlap Checks", and "Weekend Exclusion" was implemented manually with efficiency suggestions from ChatGPT. |

**Statement of Originality:** While AI tools assisted in syntax generation and UI styling, the underlying business rules, validation logic, and integration of components were implemented and verified manually to meet the specific assignment requirements.

---

## ⚠️ Known Limitations

1.  **Free Tier Hosting:** Takes a few seconds to "wake up" the server on the first request after inactivity.
2.  **Email Limits:** Uses Gmail SMTP which has daily sending limits; suitable for development/demo only.

---

## ⏱️ Time Spent

**Approximately 15-20 Hours**
(Includes: Design, Development, Testing, Debugging, and Documentation)
