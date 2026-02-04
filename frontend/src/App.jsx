import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Auth Pages
import LandingPage from './pages/LandingPage';

// Employee Pages
import EmployeeDashboard from './pages/EmployeeDashboard';
import ApplyLeave from './pages/ApplyLeave';
import LeaveHistory from './pages/LeaveHistory';
import MarkAttendance from './pages/MarkAttendance';
import AttendanceHistory from './pages/AttendanceHistory';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import AllLeaveRequests from './pages/AllLeaveRequests';
import AllAttendance from './pages/AllAttendance';
import AllEmployees from './pages/AllEmployees';
import MonthlyReport from './pages/MonthlyReport';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<LandingPage />} />

                    {/* Employee Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <EmployeeDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/apply-leave"
                        element={
                            <ProtectedRoute>
                                <ApplyLeave />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/leave-history"
                        element={
                            <ProtectedRoute>
                                <LeaveHistory />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/mark-attendance"
                        element={
                            <ProtectedRoute>
                                <MarkAttendance />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/attendance-history"
                        element={
                            <ProtectedRoute>
                                <AttendanceHistory />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Protected Routes */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <AdminRoute>
                                <AdminDashboard />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/leaves"
                        element={
                            <AdminRoute>
                                <AllLeaveRequests />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/attendance"
                        element={
                            <AdminRoute>
                                <AllAttendance />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/employees"
                        element={
                            <AdminRoute>
                                <AllEmployees />
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/monthly-report"
                        element={
                            <AdminRoute>
                                <MonthlyReport />
                            </AdminRoute>
                        }
                    />

                    {/* Catch all */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
