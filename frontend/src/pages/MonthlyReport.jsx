import { useState, useEffect } from 'react';
import { getMonthlyReport } from '../services/reportService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MonthlyReport = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Generate last 12 months
    const generateLast12Months = () => {
        const months = [];
        const currentDate = new Date();

        for (let i = 0; i < 12; i++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            months.push({
                month: date.getMonth() + 1,
                year: date.getFullYear(),
                label: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            });
        }

        return months;
    };

    const monthOptions = generateLast12Months();

    // Default to current month
    const [selectedMonthYear, setSelectedMonthYear] = useState(`${monthOptions[0].month}-${monthOptions[0].year}`);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchReport();
    }, [selectedMonthYear]);

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            const [month, year] = selectedMonthYear.split('-');
            const data = await getMonthlyReport(parseInt(month), parseInt(year));
            setReportData(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch report');
        } finally {
            setLoading(false);
        }
    };

    // Filter employees by search term
    const filteredEmployees = reportData?.employees?.filter((emp) =>
        emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    // Pagination calculations
    const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

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

    // Reset to page 1 when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    // Export to CSV
    const exportToCSV = () => {
        if (!reportData || !reportData.employees) return;

        const [month, year] = selectedMonthYear.split('-');
        const selectedOption = monthOptions.find(opt => opt.month === parseInt(month) && opt.year === parseInt(year));

        const headers = ['Employee Name', 'Email', 'Total Days', 'Present Days', 'Absent Days', 'Unrecorded Days', 'Attendance %'];
        const rows = filteredEmployees.map(emp => [
            emp.fullName,
            emp.email,
            emp.totalDays,
            emp.presentDays,
            emp.absentDays,
            emp.unrecordedDays,
            emp.attendancePercentage + '%'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `attendance_report_${selectedOption?.label.replace(' ', '_')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    // Get attendance percentage color
    const getAttendanceColor = (percentage) => {
        if (percentage >= 90) return 'text-green-600 font-semibold';
        if (percentage >= 75) return 'text-yellow-600 font-semibold';
        return 'text-red-600 font-semibold';
    };



    if (loading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-xl">Loading report...</div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Monthly Attendance Report</h1>
                        <p className="text-gray-600 mt-2">View employee attendance statistics by month</p>
                    </div>

                    {/* Month Selector */}
                    <div className="card mb-6">
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">Select Month:</label>
                            <select
                                value={selectedMonthYear}
                                onChange={(e) => setSelectedMonthYear(e.target.value)}
                                className="input-field max-w-xs"
                            >
                                {monthOptions.map((option) => (
                                    <option key={`${option.month}-${option.year}`} value={`${option.month}-${option.year}`}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {reportData && (
                        <>
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                                <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 animate-slide-up delay-100 hover-lift">
                                    <div className="text-sm font-medium text-blue-600">Total Employees</div>
                                    <div className="text-3xl font-bold text-blue-900 mt-2">
                                        {reportData.statistics.totalEmployees}
                                    </div>
                                </div>
                                <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200 animate-slide-up delay-200 hover-lift">
                                    <div className="text-sm font-medium text-green-600">Avg Attendance</div>
                                    <div className="text-3xl font-bold text-green-900 mt-2">
                                        {reportData.statistics.averageAttendance}%
                                    </div>
                                </div>
                                <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 animate-slide-up delay-300 hover-lift">
                                    <div className="text-sm font-medium text-purple-600">Total Present</div>
                                    <div className="text-3xl font-bold text-purple-900 mt-2">
                                        {reportData.statistics.totalPresentDays}
                                    </div>
                                </div>
                                <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200 animate-slide-up delay-400 hover-lift">
                                    <div className="text-sm font-medium text-red-600">Total Absent</div>
                                    <div className="text-3xl font-bold text-red-900 mt-2">
                                        {reportData.statistics.totalAbsentDays}
                                    </div>
                                </div>
                            </div>

                            {/* Search and Export */}
                            <div className="card mb-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            placeholder="Search by employee name or email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="input-field"
                                        />
                                    </div>
                                    <button
                                        onClick={exportToCSV}
                                        className="btn-primary px-6 py-2"
                                    >
                                        📥 Export to CSV
                                    </button>
                                </div>
                            </div>

                            {/* Table */}
                            <div className="card animate-slide-up delay-500">
                                {filteredEmployees.length > 0 ? (
                                    <div className="table-container">
                                        <table className="modern-table striped">
                                            <thead>
                                                <tr>
                                                    <th>Employee</th>
                                                    <th>Total Days</th>
                                                    <th>Present</th>
                                                    <th>Absent</th>
                                                    <th>Unrecorded</th>
                                                    <th>Attendance %</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentItems.map((employee, index) => (
                                                    <tr key={employee.employeeId} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                                                        <td>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {employee.fullName}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {employee.email}
                                                            </div>
                                                        </td>
                                                        <td>{employee.totalDays}</td>
                                                        <td>
                                                            <span className="text-green-600 font-medium">
                                                                {employee.presentDays}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="text-red-600 font-medium">
                                                                {employee.absentDays}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className="text-gray-500">
                                                                {employee.unrecordedDays}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={getAttendanceColor(employee.attendancePercentage)}>
                                                                {employee.attendancePercentage}%
                                                            </span>
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
                                                            {Math.min(indexOfLastItem, filteredEmployees.length)}
                                                        </span>{' '}
                                                        of <span className="font-medium">{filteredEmployees.length}</span> results
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
                                        <p className="text-gray-600">No employees found</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MonthlyReport;
