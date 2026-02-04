import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { applyLeave, getMyLeaves } from '../services/leaveService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const ApplyLeave = () => {
    const [formData, setFormData] = useState({
        leaveType: 'Casual',
        startDate: '',
        endDate: '',
        reason: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [existingLeaves, setExistingLeaves] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        fetchExistingLeaves();
    }, []);

    const fetchExistingLeaves = async () => {
        try {
            const leaves = await getMyLeaves();
            // Filter only Pending and Approved leaves
            const activeLeaves = leaves.filter(leave =>
                leave.status === 'Pending' || leave.status === 'Approved'
            );
            setExistingLeaves(activeLeaves);
        } catch (error) {
            console.error('Error fetching leaves:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value,
        });

        // Check if selected date is Sunday
        if ((name === 'startDate' || name === 'endDate') && value) {
            const selectedDate = new Date(value);
            if (selectedDate.getDay() === 0) { // 0 = Sunday
                setError('Sundays are holidays! Please select a working day.');
                return;
            }
        }

        // Clear error if valid date
        if (error && error.includes('Sunday')) {
            setError('');
        }
    };

    const calculateDays = () => {
        if (formData.startDate && formData.endDate) {
            const start = new Date(formData.startDate);
            const end = new Date(formData.endDate);

            let count = 0;
            let currentDate = new Date(start);

            // Loop through each day from start to end
            while (currentDate <= end) {
                // Only count if not Sunday (day 0)
                if (currentDate.getDay() !== 0) {
                    count++;
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }

            return count;
        }
        return 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate that dates don't include Sunday
        const startDate = new Date(formData.startDate);
        const endDate = new Date(formData.endDate);

        if (startDate.getDay() === 0 || endDate.getDay() === 0) {
            setError('Sundays are holidays! Please select working days only.');
            return;
        }

        setLoading(true);

        try {
            await applyLeave(formData);
            setSuccess('Leave application submitted successfully!');
            setTimeout(() => {
                navigate('/leave-history');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to apply for leave');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Navbar />
            <div className="min-h-screen py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Apply for Leave</h1>
                        <p className="text-gray-600 mt-2">Submit a new leave request</p>
                    </div>

                    <div className="card animate-slide-up delay-200">
                        {/* Existing Leaves Indicator */}
                        {existingLeaves.length > 0 && (
                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-start">
                                    <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-semibold text-yellow-800 mb-2">
                                            Already Applied Leave Dates
                                        </h3>
                                        <div className="space-y-2">
                                            {existingLeaves.map((leave) => (
                                                <div key={leave._id} className="flex items-center text-sm">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 ${leave.status === 'Pending'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-green-100 text-green-800'
                                                        }`}>
                                                        {leave.status}
                                                    </span>
                                                    <span className="text-gray-700">
                                                        {new Date(leave.startDate).toLocaleDateString('en-GB')} to {new Date(leave.endDate).toLocaleDateString('en-GB')}
                                                        <span className="text-gray-500 ml-2">({leave.totalDays} days)</span>
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-yellow-700 mt-3">
                                            ⚠️ You cannot apply for leave on dates that overlap with existing pending or approved leaves.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

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

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="leaveType" className="block text-sm font-medium text-gray-700 mb-2">
                                    Leave Type
                                </label>
                                <select
                                    id="leaveType"
                                    name="leaveType"
                                    value={formData.leaveType}
                                    onChange={handleChange}
                                    required
                                    className="input-field"
                                >
                                    <option value="Casual">Casual Leave</option>
                                    <option value="Sick">Sick Leave</option>
                                    <option value="Vacation">Vacation Leave</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        id="startDate"
                                        name="startDate"
                                        value={formData.startDate}
                                        onChange={handleChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        required
                                        className="input-field"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        id="endDate"
                                        name="endDate"
                                        value={formData.endDate}
                                        onChange={handleChange}
                                        min={formData.startDate || new Date().toISOString().split('T')[0]}
                                        required
                                        className="input-field"
                                    />
                                </div>
                            </div>

                            {formData.startDate && formData.endDate && (
                                <div className="bg-primary-50 border border-primary-200 text-primary-700 px-4 py-3 rounded-lg">
                                    Total Days: <strong>{calculateDays()}</strong>
                                </div>
                            )}

                            <div>
                                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason
                                </label>
                                <textarea
                                    id="reason"
                                    name="reason"
                                    value={formData.reason}
                                    onChange={handleChange}
                                    required
                                    rows={4}
                                    className="input-field"
                                    placeholder="Please provide a reason for your leave..."
                                />
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary flex-1"
                                >
                                    {loading ? 'Submitting...' : 'Submit Application'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/dashboard')}
                                    className="btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ApplyLeave;
