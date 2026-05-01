import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyLeaves } from '../services/leaveService';
import { getMyAttendance, cleanLeaveConflicts } from '../services/attendanceService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const EmployeeDashboard = () => {
    const { user, updateUser } = useAuth();
    const [leaves, setLeaves] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [totalAttendanceCount, setTotalAttendanceCount] = useState(0);
    const [leaveDateMap, setLeaveDateMap] = useState({}); // dateStr -> leave status
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const toLocalStr = (d) => {
        const dt = new Date(d);
        return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
    };

    const fetchData = async () => {
        try {
            try {
                await cleanLeaveConflicts();
            } catch (cleanupErr) {
                console.warn('Cleanup skipped (non-critical):', cleanupErr.message);
            }

            await updateUser();
            const [leavesData, attendanceData] = await Promise.all([
                getMyLeaves(),
                getMyAttendance(),
            ]);

            // Build leave date map for UI display
            const ldMap = {};
            leavesData.forEach(leave => {
                if (!['Approved', 'Pending'].includes(leave.status)) return;
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);
                let cur = new Date(start);
                while (cur <= end) {
                    if (cur.getDay() !== 0) {
                        const dk = toLocalStr(cur);
                        if (!ldMap[dk] || leave.status === 'Approved') ldMap[dk] = leave.status;
                    }
                    cur.setDate(cur.getDate() + 1);
                }
            });
            setLeaveDateMap(ldMap);

            // Filter out attendance records on leave dates for Recent Attendance
            const filteredAttendance = attendanceData.filter(r => !ldMap[toLocalStr(new Date(r.date))]);

            // Calculate approved leave days count
            let approvedLeaveCount = 0;
            leavesData.forEach(leave => {
                if (leave.status === 'Approved') {
                    const start = new Date(leave.startDate);
                    const end = new Date(leave.endDate);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(0, 0, 0, 0);
                    let cur = new Date(start);
                    while (cur <= end) {
                        if (cur.getDay() !== 0) approvedLeaveCount++;
                        cur.setDate(cur.getDate() + 1);
                    }
                }
            });

            setTotalAttendanceCount(filteredAttendance.length + approvedLeaveCount);
            setLeaves(leavesData.slice(0, 5));
            setAttendance(filteredAttendance.slice(0, 5));
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-xl">Loading...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.fullName}!</h1>
                        <p className="text-gray-600 mt-2">Manage your leave and attendance</p>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white animate-slide-up delay-100 hover-lift">
                            <h3 className="text-lg font-semibold mb-2">Leave Balance</h3>
                            <p className="text-4xl font-bold">{user?.leaveBalance || 0}</p>
                            <p className="text-primary-100 mt-2">Days remaining</p>
                        </div>

                        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white animate-slide-up delay-200 hover-lift">
                            <h3 className="text-lg font-semibold mb-2">Total Attendance</h3>
                            <p className="text-4xl font-bold">{totalAttendanceCount}</p>
                            <p className="text-green-100 mt-2">Days marked</p>
                        </div>

                        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white animate-slide-up delay-300 hover-lift">
                            <h3 className="text-lg font-semibold mb-2">Pending Leaves</h3>
                            <p className="text-4xl font-bold">
                                {leaves.filter((l) => l.status === 'Pending').length}
                            </p>
                            <p className="text-yellow-100 mt-2">Awaiting approval</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <Link to="/apply-leave" className="card hover-lift transition-all animate-slide-up delay-400 group">
                            <div className="flex items-center">
                                <div className="bg-primary-100 p-4 rounded-lg group-hover:bg-primary-200 transition-colors">
                                    <svg className="w-8 h-8 text-primary-600 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Apply for Leave</h3>
                                    <p className="text-gray-600">Submit a new leave request</p>
                                </div>
                            </div>
                        </Link>

                        <Link to="/mark-attendance" className="card hover-lift transition-all animate-slide-up delay-500 group">
                            <div className="flex items-center">
                                <div className="bg-green-100 p-4 rounded-lg group-hover:bg-green-200 transition-colors">
                                    <svg className="w-8 h-8 text-green-600 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Mark Attendance</h3>
                                    <p className="text-gray-600">Record your attendance for today</p>
                                </div>
                            </div>
                        </Link>
                    </div>

                    {/* Recent Leave Requests */}
                    <div className="card mb-8 animate-slide-up delay-500 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Recent Leave Requests</h2>
                            <Link to="/leave-history" className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-all">
                                View All
                            </Link>
                        </div>
                        {leaves.length > 0 ? (
                            <div className="table-container">
                                <table className="modern-table striped">
                                    <thead>
                                        <tr>
                                            <th>Type</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Days</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {leaves.map((leave, index) => (
                                            <tr key={leave._id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                                                <td>{leave.leaveType}</td>
                                                <td>
                                                    {new Date(leave.startDate).toLocaleDateString('en-GB')}
                                                </td>
                                                <td>
                                                    {new Date(leave.endDate).toLocaleDateString('en-GB')}
                                                </td>
                                                <td>{leave.totalDays}</td>
                                                <td>
                                                    <span className={`badge-${leave.status.toLowerCase()}`}>{leave.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-600">No leave requests yet</p>
                        )}
                    </div>

                    {/* Recent Attendance */}
                    <div className="card animate-slide-up delay-700 hover:shadow-lg transition-shadow duration-300">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Recent Attendance</h2>
                            <Link to="/attendance-history" className="text-primary-600 hover:text-primary-700 font-medium hover:underline transition-all">
                                View All
                            </Link>
                        </div>
                        {attendance.length > 0 ? (
                            <div className="table-container">
                                <table className="modern-table striped">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendance.map((record, index) => (
                                            <tr key={record._id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                                                <td>
                                                    {new Date(record.date).toLocaleDateString('en-GB')}
                                                </td>
                                                <td>
                                                    <span className={`badge-${record.status.toLowerCase()}`}>{record.status}</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p className="text-gray-600">No attendance records yet</p>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default EmployeeDashboard;
