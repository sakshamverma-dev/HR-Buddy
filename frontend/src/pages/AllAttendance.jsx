import { useState, useEffect } from 'react';
import { getAllAttendance } from '../services/attendanceService';
import { adminUpdateAttendance } from '../services/attendanceService';
import { getAllLeaves } from '../services/leaveService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AllAttendance = () => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const [editingRecordId, setEditingRecordId] = useState(null);
    const [editStatus, setEditStatus] = useState('');

    const handleEditClick = (record) => {
        setEditingRecordId(record._id);
        setEditStatus(record.isVirtual ? 'Leave' : record.status);
    };

    const handleSaveStatus = async (record) => {
        try {
            await adminUpdateAttendance(record.userId._id, record.date, editStatus);
            setEditingRecordId(null);
            fetchAttendance(); // Refresh data
        } catch (error) {
            alert(error.response?.data?.message || 'Error updating status');
        }
    };

    const handleCancelEdit = () => {
        setEditingRecordId(null);
        setEditStatus('');
    };

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            const [attendanceData, leavesData] = await Promise.all([
                getAllAttendance(),
                getAllLeaves()
            ]);

            const virtualAttendance = [...attendanceData];
            const toLocalDateStr = (d) => {
                const dt = new Date(d);
                return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
            };

            const existingDatesByUser = {};
            attendanceData.forEach(r => {
                if (r.userId?._id) {
                    if (!existingDatesByUser[r.userId._id]) existingDatesByUser[r.userId._id] = new Set();
                    existingDatesByUser[r.userId._id].add(toLocalDateStr(new Date(r.date)));
                }
            });

            leavesData.forEach(leave => {
                if (leave.status !== 'Approved') return;
                const start = new Date(leave.startDate);
                const end = new Date(leave.endDate);
                start.setHours(0, 0, 0, 0);
                end.setHours(0, 0, 0, 0);
                let cur = new Date(start);
                while (cur <= end) {
                    if (cur.getDay() !== 0) {
                        const dateStr = toLocalDateStr(cur);
                        const userId = leave.userId?._id;
                        if (userId) {
                            if (!existingDatesByUser[userId]) existingDatesByUser[userId] = new Set();
                            if (!existingDatesByUser[userId].has(dateStr)) {
                                existingDatesByUser[userId].add(dateStr);
                                virtualAttendance.push({
                                    _id: `leave-${leave._id}-${dateStr}`,
                                    userId: leave.userId,
                                    date: new Date(cur).toISOString(),
                                    status: 'Leave',
                                    isVirtual: true
                                });
                            }
                        }
                    }
                    cur.setDate(cur.getDate() + 1);
                }
            });

            // Sort by date descending
            virtualAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));
            setAttendance(virtualAttendance);
        } catch (error) {
            console.error('Error fetching attendance/leaves:', error);
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
                                <button
                                    onClick={() => setFilter('Leave')}
                                    className={`px-4 py-2 rounded-lg ${filter === 'Leave' ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'
                                        }`}
                                >
                                    On Leave
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
                                            <th>Actions</th>
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
                                                        {editingRecordId === record._id ? (
                                                            <select
                                                                value={editStatus}
                                                                onChange={(e) => setEditStatus(e.target.value)}
                                                                className="input-field py-1 px-2 text-sm"
                                                            >
                                                                <option value="Present">Present</option>
                                                                <option value="Absent">Absent</option>
                                                                <option value="Leave">On Leave</option>
                                                            </select>
                                                        ) : (
                                                            <span className={record.isVirtual ? 'badge-leave' : `badge-${record.status.toLowerCase()}`}>
                                                                {record.isVirtual ? 'On Leave' : record.status}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        {editingRecordId === record._id ? (
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleSaveStatus(record)}
                                                                    className="text-green-600 hover:text-green-900 font-medium text-sm"
                                                                >
                                                                    Save
                                                                </button>
                                                                <button
                                                                    onClick={handleCancelEdit}
                                                                    className="text-gray-500 hover:text-gray-700 font-medium text-sm"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleEditClick(record)}
                                                                className="text-primary-600 hover:text-primary-900 font-medium text-sm"
                                                            >
                                                                Edit
                                                            </button>
                                                        )}
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
