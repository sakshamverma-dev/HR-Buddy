import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats } from '../services/dashboardService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalEmployees: 0,
        pendingLeaves: 0,
        todayPresent: 0,
        todayAbsent: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
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
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600 mt-2">Overview of HR Buddy</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white animate-slide-up delay-100 hover-lift">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-primary-100 text-sm font-medium">Total Employees</p>
                                    <p className="text-4xl font-bold mt-2">{stats.totalEmployees}</p>
                                </div>
                                <svg className="w-12 h-12 text-primary-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white animate-slide-up delay-200 hover-lift">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-100 text-sm font-medium">Pending Leaves</p>
                                    <p className="text-4xl font-bold mt-2">{stats.pendingLeaves}</p>
                                </div>
                                <svg className="w-12 h-12 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white animate-slide-up delay-300 hover-lift">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium">Today Present</p>
                                    <p className="text-4xl font-bold mt-2">{stats.todayPresent}</p>
                                </div>
                                <svg className="w-12 h-12 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white animate-slide-up delay-400 hover-lift">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100 text-sm font-medium">Today Absent</p>
                                    <p className="text-4xl font-bold mt-2">{stats.todayAbsent}</p>
                                </div>
                                <svg className="w-12 h-12 text-red-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link to="/admin/leaves" className="card hover-lift transition-all animate-slide-up delay-500 group">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">Manage Leave Requests</h3>
                            <p className="text-gray-600">Review and approve/reject employee leave requests</p>
                        </Link>

                        <Link to="/admin/attendance" className="card hover-lift transition-all animate-slide-up delay-500 group">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">View Attendance</h3>
                            <p className="text-gray-600">Monitor employee attendance records</p>
                        </Link>

                        <Link to="/admin/employees" className="card hover-lift transition-all animate-slide-up delay-500 group">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">Employee Directory</h3>
                            <p className="text-gray-600">View all registered employees</p>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AdminDashboard;
