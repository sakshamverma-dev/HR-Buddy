import { useState, useEffect } from 'react';
import { getMyAttendance } from '../services/attendanceService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AttendanceCalendar from '../components/AttendanceCalendar';

const AttendanceHistory = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // 10 records per page

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const data = await getMyAttendance();
            setAttendance(data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAttendance = attendance.filter((record) => {
        if (filter === 'all') return true;
        return record.status === filter;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAttendance.slice(indexOfFirstItem, indexOfLastItem);

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const stats = {
        total: attendance.length,
        present: attendance.filter((r) => r.status === 'Present').length,
        absent: attendance.filter((r) => r.status === 'Absent').length,
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
                        <h1 className="text-3xl font-bold text-gray-900">Attendance History</h1>
                        <p className="text-gray-600 mt-2">View your attendance records</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white animate-slide-up delay-100">
                            <h3 className="text-lg font-semibold mb-2">Total Days</h3>
                            <p className="text-4xl font-bold">{stats.total}</p>
                        </div>
                        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white animate-slide-up delay-200">
                            <h3 className="text-lg font-semibold mb-2">Present</h3>
                            <p className="text-4xl font-bold">{stats.present}</p>
                        </div>
                        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white animate-slide-up delay-300">
                            <h3 className="text-lg font-semibold mb-2">Absent</h3>
                            <p className="text-4xl font-bold">{stats.absent}</p>
                        </div>
                    </div>

                    {/* Calendar and Table Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Visual Calendar - Takes 1 column on large screens */}
                        <div className="lg:col-span-1">
                            <AttendanceCalendar attendanceRecords={attendance} />
                        </div>

                        {/* Attendance Table - Takes 2 columns on large screens */}
                        <div className="lg:col-span-2">
                            <div className="card animate-slide-up delay-400">
                                {/* Filter */}
                                <div className="mb-6 flex space-x-4">
                                    <button
                                        onClick={() => setFilter('all')}
                                        className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setFilter('Present')}
                                        className={`px-4 py-2 rounded-lg ${filter === 'Present' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        Present
                                    </button>
                                    <button
                                        onClick={() => setFilter('Absent')}
                                        className={`px-4 py-2 rounded-lg ${filter === 'Absent' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        Absent
                                    </button>
                                </div>

                                {filteredAttendance.length > 0 ? (
                                    <div className="table-container">
                                        <table className="modern-table striped">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Day</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((record, index) => {
                                                    const date = new Date(record.date);
                                                    return (
                                                        <tr key={record._id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                                            <td>
                                                                {date.toLocaleDateString('en-GB')}
                                                            </td>
                                                            <td>
                                                                {date.toLocaleDateString('en-US', { weekday: 'long' })}
                                                            </td>
                                                            <td>
                                                                <span className={`badge-${record.status.toLowerCase()}`}>{record.status}</span>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
                                                <div className="flex flex-1 justify-between sm:hidden">
                                                    <button
                                                        onClick={handlePrevPage}
                                                        disabled={currentPage === 1}
                                                        className={`relative inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${currentPage === 1
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                                            } border border-gray-300`}
                                                    >
                                                        Previous
                                                    </button>
                                                    <button
                                                        onClick={handleNextPage}
                                                        disabled={currentPage === totalPages}
                                                        className={`relative ml-3 inline-flex items-center rounded-md px-4 py-2 text-sm font-medium ${currentPage === totalPages
                                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                            : 'bg-white text-gray-700 hover:bg-gray-50'
                                                            } border border-gray-300`}
                                                    >
                                                        Next
                                                    </button>
                                                </div>
                                                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-700">
                                                            Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                                                            <span className="font-medium">
                                                                {Math.min(indexOfLastItem, filteredAttendance.length)}
                                                            </span>{' '}
                                                            of <span className="font-medium">{filteredAttendance.length}</span> results
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                            <button
                                                                onClick={handlePrevPage}
                                                                disabled={currentPage === 1}
                                                                className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage === 1
                                                                    ? 'cursor-not-allowed'
                                                                    : 'hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                <span className="sr-only">Previous</span>
                                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                            {[...Array(totalPages)].map((_, index) => {
                                                                const pageNumber = index + 1;
                                                                // Show first, last, current, and adjacent pages
                                                                if (
                                                                    pageNumber === 1 ||
                                                                    pageNumber === totalPages ||
                                                                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                                                ) {
                                                                    return (
                                                                        <button
                                                                            key={pageNumber}
                                                                            onClick={() => handlePageChange(pageNumber)}
                                                                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${currentPage === pageNumber
                                                                                ? 'z-10 bg-primary-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600'
                                                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                                                                                }`}
                                                                        >
                                                                            {pageNumber}
                                                                        </button>
                                                                    );
                                                                } else if (
                                                                    pageNumber === currentPage - 2 ||
                                                                    pageNumber === currentPage + 2
                                                                ) {
                                                                    return <span key={pageNumber} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700">...</span>;
                                                                }
                                                                return null;
                                                            })}
                                                            <button
                                                                onClick={handleNextPage}
                                                                disabled={currentPage === totalPages}
                                                                className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 ${currentPage === totalPages
                                                                    ? 'cursor-not-allowed'
                                                                    : 'hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                <span className="sr-only">Next</span>
                                                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                                </svg>
                                                            </button>
                                                        </nav>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-600">No attendance records found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AttendanceHistory;
