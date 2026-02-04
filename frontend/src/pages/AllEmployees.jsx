import { useState, useEffect } from 'react';
import { getAllEmployees } from '../services/employeeService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AllEmployees = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const data = await getAllEmployees();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
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
                        <h1 className="text-3xl font-bold text-gray-900">Employee Directory</h1>
                        <p className="text-gray-600 mt-2">View all registered employees</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {employees.length > 0 ? (
                            employees.map((employee, index) => (
                                <div key={employee._id} className="card hover-lift animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                                    <div className="flex items-center mb-4">
                                        <div className="bg-primary-100 rounded-full p-3">
                                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4">
                                            <h3 className="text-lg font-semibold text-gray-900">{employee.fullName}</h3>
                                            <p className="text-sm text-gray-500">{employee.email}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Role:</span>
                                            <span className="font-medium text-primary-600">{employee.jobRole || 'Not Specified'}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Joined:</span>
                                            <span className="font-medium text-gray-900">
                                                {employee.dateOfJoining
                                                    ? new Date(employee.dateOfJoining).toLocaleDateString('en-GB', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })
                                                    : 'N/A'
                                                }
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Leave Balance:</span>
                                            <span className="font-medium text-gray-900">{employee.leaveBalance} days</span>
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Attendance Stats</h4>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div>
                                                <p className="text-xs text-gray-600">Total</p>
                                                <p className="text-lg font-bold text-gray-900">{employee.totalDays || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Present</p>
                                                <p className="text-lg font-bold text-green-600">{employee.presentDays || 0}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-600">Absent</p>
                                                <p className="text-lg font-bold text-red-600">{employee.absentDays || 0}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-600">No employees found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default AllEmployees;
