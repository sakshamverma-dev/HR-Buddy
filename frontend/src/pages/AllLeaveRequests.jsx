import { useState, useEffect } from 'react';
import { getAllLeaves, updateLeaveStatus } from '../services/leaveService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AllLeaveRequests = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const data = await getAllLeaves();
            setLeaves(data);
        } catch (error) {
            console.error('Error fetching leaves:', error);
            setError('Failed to fetch leave requests');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await updateLeaveStatus(id, status);
            setSuccess(`Leave ${status.toLowerCase()} successfully!`);
            fetchLeaves();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update leave status');
            setTimeout(() => setError(''), 3000);
        }
    };

    const filteredLeaves = leaves.filter((leave) => {
        if (filter === 'all') return true;
        return leave.status === filter;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);

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

    // Reset to page 1 when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

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
                        <h1 className="text-3xl font-bold text-gray-900">All Leave Requests</h1>
                        <p className="text-gray-600 mt-2">Manage employee leave requests</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
                            {success}
                        </div>
                    )}

                    <div className="card">
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
                                onClick={() => setFilter('Pending')}
                                className={`px-4 py-2 rounded-lg ${filter === 'Pending' ? 'bg-yellow-600 text-white' : 'bg-gray-200 text-gray-700'
                                    }`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => setFilter('Approved')}
                                className={`px-4 py-2 rounded-lg ${filter === 'Approved' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
                                    }`}
                            >
                                Approved
                            </button>
                            <button
                                onClick={() => setFilter('Rejected')}
                                className={`px-4 py-2 rounded-lg ${filter === 'Rejected' ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-700'
                                    }`}
                            >
                                Rejected
                            </button>
                        </div>

                        {filteredLeaves.length > 0 ? (
                            <div className="table-container">
                                <table className="modern-table striped">
                                    <thead>
                                        <tr>
                                            <th>Employee</th>
                                            <th>Type</th>
                                            <th>Start Date</th>
                                            <th>End Date</th>
                                            <th>Days</th>
                                            <th>Reason</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentItems.map((leave, index) => (
                                            <tr key={leave._id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                                <td>
                                                    <div className="text-sm font-medium text-gray-900">{leave.userId?.fullName}</div>
                                                    <div className="text-sm text-gray-500">{leave.userId?.email}</div>
                                                </td>
                                                <td>{leave.leaveType}</td>
                                                <td>
                                                    {new Date(leave.startDate).toLocaleDateString('en-GB')}
                                                </td>
                                                <td>
                                                    {new Date(leave.endDate).toLocaleDateString('en-GB')}
                                                </td>
                                                <td>{leave.totalDays}</td>
                                                <td className="max-w-xs truncate">{leave.reason}</td>
                                                <td>
                                                    <span className={`badge-${leave.status.toLowerCase()}`}>{leave.status}</span>
                                                </td>
                                                <td className="space-x-2">
                                                    {leave.status === 'Pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                                                className="btn-success px-3 py-1 text-xs hover:scale-105 active:scale-95 transition-transform"
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                                                className="btn-danger px-3 py-1 text-xs hover:scale-105 active:scale-95 transition-transform"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
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
                                                    {Math.min(indexOfLastItem, filteredLeaves.length)}
                                                </span>{' '}
                                                of <span className="font-medium">{filteredLeaves.length}</span> results
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
                                <p className="text-gray-600">No leave requests found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AllLeaveRequests;
