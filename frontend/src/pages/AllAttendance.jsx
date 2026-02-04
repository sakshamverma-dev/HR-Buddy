import { useState, useEffect } from 'react';
import { getAllAttendance } from '../services/attendanceService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AllAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const data = await getAllAttendance();
            setAttendance(data);
        } catch (error) {
            console.error('Error fetching attendance:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAttendance = attendance.filter((record) => {
        const matchesFilter = filter === 'all' || record.status === filter;
        const matchesSearch =
            searchTerm === '' ||
            record.userId?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            record.userId?.email.toLowerCase().includes(searchTerm.toLowerCase());

        // Date filter
        const recordDate = new Date(record.date);
        const matchesDateFrom = !dateFrom || recordDate >= new Date(dateFrom);
        const matchesDateTo = !dateTo || recordDate <= new Date(dateTo);

        return matchesFilter && matchesSearch && matchesDateFrom && matchesDateTo;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredAttendance.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredAttendance.slice(indexOfFirstItem, indexOfLastItem);

    // Pagination handlers
    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filter, searchTerm, dateFrom, dateTo]);

    // Group by employee
    const groupedByEmployee = filteredAttendance.reduce((acc, record) => {
        const employeeId = record.userId?._id;
        if (!acc[employeeId]) {
            acc[employeeId] = {
                employee: record.userId,
                records: [],
            };
        }
        acc[employeeId].records.push(record);
        return acc;
    }, {});

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
                        <h1 className="text-3xl font-bold text-gray-900">All Attendance Records</h1>
                        <p className="text-gray-600 mt-2">View employee attendance</p>
                    </div>

                    <div className="card mb-6">
                        <div className="space-y-4">
                            {/* Search and Date Filters Row */}
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                {/* Search */}
                                <div className="flex-1">
                                    <input
                                        type="text"
                                        placeholder="Search by employee name or email..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="input-field"
                                    />
                                </div>

                                {/* Date Filters */}
                                <div className="flex gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                                        <input
                                            type="date"
                                            value={dateFrom}
                                            onChange={(e) => setDateFrom(e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                                        <input
                                            type="date"
                                            value={dateTo}
                                            onChange={(e) => setDateTo(e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Status Filter Buttons */}
                            <div className="flex space-x-4">
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
                        </div>
                    </div>

                    <div className="card">
                        {filteredAttendance.length > 0 ? (
                            <div className="table-container">
                                <table className="modern-table striped">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
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
                                                        <div className="text-sm font-medium text-gray-900">{record.userId?.fullName}</div>
                                                        <div className="text-sm text-gray-500">{record.userId?.email}</div>
                                                    </td>
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
                                    <div className="px-6 py-4 border-t border-gray-200">
                                        {/* Mobile view */}
                                        <div className="flex items-center justify-between sm:hidden">
                                            <button
                                                onClick={handlePrevPage}
                                                disabled={currentPage === 1}
                                                className="btn-secondary px-3 py-2 text-sm disabled:opacity-50"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-700">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                onClick={handleNextPage}
                                                disabled={currentPage === totalPages}
                                                className="btn-secondary px-3 py-2 text-sm disabled:opacity-50"
                                            >
                                                Next
                                            </button>
                                        </div>

                                        {/* Desktop view */}
                                        <div className="hidden sm:flex sm:items-center sm:justify-between">
                                            <div className="text-sm text-gray-700">
                                                Showing <span className="font-medium">{indexOfFirstItem + 1}</span> to{' '}
                                                <span className="font-medium">
                                                    {Math.min(indexOfLastItem, filteredAttendance.length)}
                                                </span>{' '}
                                                of <span className="font-medium">{filteredAttendance.length}</span> results
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={handlePrevPage}
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Previous
                                                </button>
                                                {[...Array(totalPages)].map((_, index) => {
                                                    const pageNumber = index + 1;
                                                    if (
                                                        pageNumber === 1 ||
                                                        pageNumber === totalPages ||
                                                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                                    ) {
                                                        return (
                                                            <button
                                                                key={pageNumber}
                                                                onClick={() => handlePageChange(pageNumber)}
                                                                className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === pageNumber
                                                                    ? 'bg-primary-600 text-white'
                                                                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                                                                    }`}
                                                            >
                                                                {pageNumber}
                                                            </button>
                                                        );
                                                    } else if (
                                                        pageNumber === currentPage - 2 ||
                                                        pageNumber === currentPage + 2
                                                    ) {
                                                        return <span key={pageNumber} className="px-2 py-2 text-gray-500">...</span>;
                                                    }
                                                    return null;
                                                })}
                                                <button
                                                    onClick={handleNextPage}
                                                    disabled={currentPage === totalPages}
                                                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Next
                                                </button>
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
            <Footer />
        </>
    );
};

export default AllAttendance;
