import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { markAttendance } from '../services/attendanceService';
import { getProfile } from '../services/authService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MarkAttendance = () => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [joiningDate, setJoiningDate] = useState('');

    const navigate = useNavigate();

    // Fetch user profile to get joining date
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await getProfile();
                setJoiningDate(response.data.dateOfJoining.split('T')[0]);
            } catch (err) {
                console.error('Failed to fetch profile:', err);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate that selected date is today only
        const today = new Date().toISOString().split('T')[0];
        if (formData.date !== today) {
            setError('You can only mark attendance for today!');
            return;
        }

        // Validate that date is not before joining date
        if (joiningDate && formData.date < joiningDate) {
            setError('You cannot mark attendance before your joining date!');
            return;
        }

        setLoading(true);

        try {
            await markAttendance(formData);
            setSuccess('Attendance marked successfully!');
            setTimeout(() => {
                navigate('/attendance-history');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark attendance');
        } finally {
            setLoading(false);
        }
    };

    // Get today's date for validation
    const today = new Date().toISOString().split('T')[0];

    return (
        <>
            <Navbar />
            <div className="min-h-screen py-8">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
                        <p className="text-gray-600 mt-2">Record your attendance for today</p>
                    </div>

                    <div className="card animate-slide-up delay-200">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 animate-fade-in">
                                {success}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    id="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    min={joiningDate || today}
                                    max={today}
                                    required
                                    className="input-field"
                                    disabled
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    You can only mark attendance for today ({new Date().toLocaleDateString('en-GB')})
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-4">
                                    Attendance Status
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'Present' })}
                                        className={`p-6 rounded-lg border-2 transition-all hover-scale ${formData.status === 'Present'
                                            ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                                            : 'border-gray-200 hover:border-green-300'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-lg font-semibold text-gray-900">Present</span>
                                        </div>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status: 'Absent' })}
                                        className={`p-6 rounded-lg border-2 transition-all hover-scale ${formData.status === 'Absent'
                                            ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                                            : 'border-gray-200 hover:border-red-300'
                                            }`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-lg font-semibold text-gray-900">Absent</span>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            <div className="flex space-x-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary flex-1"
                                >
                                    {loading ? 'Marking...' : 'Mark Attendance'}
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

export default MarkAttendance;
