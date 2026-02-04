import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyLeaves, editLeave, cancelLeave } from '../services/leaveService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LeaveHistory = () => {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingLeave, setEditingLeave] = useState(null);
    const [formData, setFormData] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10); // 10 records per page

    const navigate = useNavigate();

    useEffect(() => {
        fetchLeaves();
    }, []);

    const fetchLeaves = async () => {
        try {
            const data = await getMyLeaves();
            setLeaves(data);
        } catch (error) {
            console.error('Error fetching leaves:', error);
        } finally {
            setLoading(false);
        }
    };

    // Pagination calculations
    const totalPages = Math.ceil(leaves.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = leaves.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const handleEdit = (leave) => {
        setEditingLeave(leave._id);
        setFormData({
            leaveType: leave.leaveType,
            startDate: new Date(leave.startDate).toISOString().split('T')[0],
            endDate: new Date(leave.endDate).toISOString().split('T')[0],
            reason: leave.reason,
        });
        setError('');
        setSuccess('');
    };

    const handleCancelEdit = () => {
        setEditingLeave(null);
        setFormData({});
        setError('');
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpdate = async (id) => {
        try {
            await editLeave(id, formData);
            setSuccess('Leave updated successfully!');
            setEditingLeave(null);
            fetchLeaves();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update leave');
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm('Are you sure you want to cancel this leave request?')) {
            try {
                await cancelLeave(id);
                setSuccess('Leave cancelled successfully!');
                fetchLeaves();
                setTimeout(() => setSuccess(''), 3000);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to cancel leave');
            }
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
                        <h1 className="text-3xl font-bold text-gray-900">Leave History</h1>
                        <p className="text-gray-600 mt-2">View and manage your leave requests</p>
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

                    <div className="card animate-slide-up delay-200">
                        {leaves.length > 0 ? (
                            <div className="table-container">
                                <table className="modern-table striped">
                                    <thead>
                                        <tr>
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
                                                {editingLeave === leave._id ? (
                                                    <>
                                                        <td className="px-6 py-4">
                                                            <select
                                                                name="leaveType"
                                                                value={formData.leaveType}
                                                                onChange={handleChange}
                                                                className="input-field text-sm"
                                                            >
                                                                <option value="Casual">Casual</option>
                                                                <option value="Sick">Sick</option>
                                                                <option value="Vacation">Vacation</option>
                                                            </select>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="date"
                                                                name="startDate"
                                                                value={formData.startDate}
                                                                onChange={handleChange}
                                                                className="input-field text-sm"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="date"
                                                                name="endDate"
                                                                value={formData.endDate}
                                                                onChange={handleChange}
                                                                className="input-field text-sm"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-gray-900">-</td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="text"
                                                                name="reason"
                                                                value={formData.reason}
                                                                onChange={handleChange}
                                                                className="input-field text-sm"
                                                            />
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`badge-${leave.status.toLowerCase()}`}>{leave.status}</span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                                            <button
                                                                onClick={() => handleUpdate(leave._id)}
                                                                className="text-green-600 hover:text-green-900 font-medium hover:underline"
                                                            >
                                                                Save
                                                            </button>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="text-gray-600 hover:text-gray-900 font-medium hover:underline"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
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
                                                                        onClick={() => handleEdit(leave)}
                                                                        className="text-primary-600 hover:text-primary-900 font-medium hover:underline"
                                                                    >
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleCancel(leave._id)}
                                                                        className="text-red-600 hover:text-red-900 font-medium hover:underline"
                                                                    >
                                                                        Cancel
                                                                    </button>
                                                                </>
                                                            )}
                                                        </td>
                                                    </>
                                                )}
                                            </tr>
                                        ))}
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
                                                        {Math.min(indexOfLastItem, leaves.length)}
                                                    </span>{' '}
                                                    of <span className="font-medium">{leaves.length}</span> results
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
                                <p className="text-gray-600 mb-4">No leave requests yet</p>
                                <button onClick={() => navigate('/apply-leave')} className="btn-primary">
                                    Apply for Leave
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default LeaveHistory;
