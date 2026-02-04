import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const handleLogout = () => {
        setIsLogoutModalOpen(true);
        setMobileMenuOpen(false);
    };

    const confirmLogout = () => {
        logout();
        navigate('/');
        setIsLogoutModalOpen(false);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    if (!user) return null;

    return (
        <nav className="shadow-xl relative z-50 border-b-2 border-blue-400" style={{ backgroundColor: '#5B6CF5' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Left side - Logo & Desktop Menu */}
                    <div className="flex items-center">
                        <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="flex items-center group">
                            {/* HR Icon Logo */}
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mr-3 group-hover:bg-white/20 transition-all duration-300 shadow-lg border border-white/20 group-hover:scale-110 group-hover:rotate-3">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
                                </svg>
                            </div>
                            {/* Logo Text */}
                            <span className="text-2xl font-black text-white tracking-tight group-hover:text-blue-50 transition-colors duration-200">
                                HR Buddy
                            </span>
                        </Link>

                        {/* Desktop Menu - Hidden on Mobile */}
                        <div className="hidden md:ml-10 md:flex md:items-baseline md:space-x-1">
                            {user.role === 'admin' ? (
                                <>
                                    <Link
                                        to="/admin/dashboard"
                                        className="relative group text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    >
                                        Dashboard
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                                    </Link>
                                    <Link
                                        to="/admin/leaves"
                                        className="relative group text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    >
                                        Leave Requests
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                                    </Link>
                                    <Link
                                        to="/admin/attendance"
                                        className="relative group text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    >
                                        Attendance
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                                    </Link>
                                    <Link
                                        to="/admin/employees"
                                        className="relative group text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    >
                                        Employees
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                                    </Link>
                                    <Link
                                        to="/admin/monthly-report"
                                        className="relative group text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    >
                                        Monthly Report
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/dashboard"
                                        className="relative group text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    >
                                        Dashboard
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                                    </Link>
                                    <Link
                                        to="/apply-leave"
                                        className="relative group text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    >
                                        Apply Leave
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                                    </Link>
                                    <Link
                                        to="/leave-history"
                                        className="relative group text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    >
                                        Leave History
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                                    </Link>
                                    <Link
                                        to="/mark-attendance"
                                        className="relative group text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    >
                                        Mark Attendance
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                                    </Link>
                                    <Link
                                        to="/attendance-history"
                                        className="relative group text-white/90 hover:text-white px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
                                    >
                                        Attendance History
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out origin-left"></span>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right side - User Info & Logout (Desktop) + Hamburger (Mobile) */}
                    <div className="flex items-center">
                        {/* Desktop User Info & Logout - Hidden on Mobile */}
                        <div className="hidden md:flex md:items-center md:space-x-4">
                            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/20">
                                <svg className="w-4 h-4 text-white/80" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                <span className="text-white font-semibold text-sm">
                                    {user.fullName}
                                </span>
                                <span className="text-white/60 text-xs">•</span>
                                <span className="text-white/80 text-xs capitalize font-medium">
                                    {user.role}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                            >
                                Logout
                            </button>
                        </div>

                        {/* Hamburger Icon - Visible on Mobile Only */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white/40 transition-all"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Hamburger Icon */}
                            <svg
                                className="h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu - Slide-in from Right */}
            <div
                className={`fixed inset-y-0 right-0 w-64 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out md:hidden ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
                    } z-50`}
            >
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <span className="text-lg font-bold text-primary-600">Menu</span>
                    {/* Close Button */}
                    <button
                        onClick={closeMobileMenu}
                        className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary-600 hover:bg-gray-100 focus:outline-none transition-colors"
                    >
                        <span className="sr-only">Close menu</span>
                        {/* X Icon */}
                        <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu Content */}
                <div className="px-4 py-6 space-y-1 overflow-y-auto h-full pb-20">
                    {/* User Info */}
                    <div className="mb-6 pb-4 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                        <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                    </div>

                    {/* Navigation Links */}
                    {user.role === 'admin' ? (
                        <>
                            <Link
                                to="/admin/dashboard"
                                onClick={closeMobileMenu}
                                className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-3 rounded-md text-base font-medium transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/admin/leaves"
                                onClick={closeMobileMenu}
                                className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-3 rounded-md text-base font-medium transition-colors"
                            >
                                Leave Requests
                            </Link>
                            <Link
                                to="/admin/attendance"
                                onClick={closeMobileMenu}
                                className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-3 rounded-md text-base font-medium transition-colors"
                            >
                                Attendance
                            </Link>
                            <Link
                                to="/admin/employees"
                                onClick={closeMobileMenu}
                                className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-3 rounded-md text-base font-medium transition-colors"
                            >
                                Employees
                            </Link>
                            <Link
                                to="/admin/monthly-report"
                                onClick={closeMobileMenu}
                                className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-3 rounded-md text-base font-medium transition-colors"
                            >
                                Monthly Report
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/dashboard"
                                onClick={closeMobileMenu}
                                className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-3 rounded-md text-base font-medium transition-colors"
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/apply-leave"
                                onClick={closeMobileMenu}
                                className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-3 rounded-md text-base font-medium transition-colors"
                            >
                                Apply Leave
                            </Link>
                            <Link
                                to="/leave-history"
                                onClick={closeMobileMenu}
                                className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-3 rounded-md text-base font-medium transition-colors"
                            >
                                Leave History
                            </Link>
                            <Link
                                to="/mark-attendance"
                                onClick={closeMobileMenu}
                                className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-3 rounded-md text-base font-medium transition-colors"
                            >
                                Mark Attendance
                            </Link>
                            <Link
                                to="/attendance-history"
                                onClick={closeMobileMenu}
                                className="block text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-3 rounded-md text-base font-medium transition-colors"
                            >
                                Attendance History
                            </Link>
                        </>
                    )}

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full mt-6 btn-danger text-center"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Mobile Menu Backdrop/Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300"
                    onClick={closeMobileMenu}
                ></div>
            )}

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 opacity-100 animate-fade-in-up">
                        <div className="p-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirm Logout</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to log out?
                            </p>
                            <div className="flex justify-center space-x-3">
                                <button
                                    onClick={() => setIsLogoutModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmLogout}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Yes, Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
