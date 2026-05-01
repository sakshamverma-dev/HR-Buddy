import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { markAttendance, cleanLeaveConflicts } from '../services/attendanceService';
import { getProfile } from '../services/authService';
import { getMyLeaves } from '../services/leaveService';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Helper: local date string
const toLocalStr = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

const getContinuousLeaveBlock = (leavesData, targetDateStr) => {
    const onLeave = leavesData.find(leave => {
        if (leave.status !== 'Approved') return false;
        return targetDateStr >= toLocalStr(new Date(leave.startDate)) &&
               targetDateStr <= toLocalStr(new Date(leave.endDate));
    });
    
    if (!onLeave) return null;

    const leaveDatesSet = new Set();
    leavesData.forEach(leave => {
        if (leave.status !== 'Approved') return;
        const start = new Date(leave.startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(leave.endDate);
        end.setHours(0, 0, 0, 0);
        let cur = new Date(start);
        while (cur <= end) {
            if (cur.getDay() !== 0) {
                leaveDatesSet.add(toLocalStr(cur));
            }
            cur.setDate(cur.getDate() + 1);
        }
    });

    const sortedDates = Array.from(leaveDatesSet).sort();
    const targetIndex = sortedDates.indexOf(targetDateStr);
    if (targetIndex === -1) return null;

    let startIndex = targetIndex;
    while (startIndex > 0) {
        const prevDateObj = new Date(sortedDates[startIndex - 1]);
        const currDateObj = new Date(sortedDates[startIndex]);
        const diffDays = Math.round((currDateObj - prevDateObj) / 86400000);
        
        if (diffDays === 1 || (diffDays === 2 && currDateObj.getDay() === 1)) {
            startIndex--;
        } else {
            break;
        }
    }

    let endIndex = targetIndex;
    while (endIndex < sortedDates.length - 1) {
        const nextDateObj = new Date(sortedDates[endIndex + 1]);
        const currDateObj = new Date(sortedDates[endIndex]);
        const diffDays = Math.round((nextDateObj - currDateObj) / 86400000);
        
        if (diffDays === 1 || (diffDays === 2 && nextDateObj.getDay() === 1)) {
            endIndex++;
        } else {
            break;
        }
    }

    return {
        ...onLeave,
        startDate: new Date(sortedDates[startIndex]).toISOString(),
        endDate: new Date(sortedDates[endIndex]).toISOString(),
        totalDays: endIndex - startIndex + 1
    };
};

const MarkAttendance = () => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        status: 'Present',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [joiningDate, setJoiningDate] = useState('');
    const [activeLeave, setActiveLeave] = useState(null); // approved leave covering today

    const navigate = useNavigate();

    // ── Page Load: detect leave immediately + run cleanup in background ──
    useEffect(() => {
        // Check if today falls in any approved leave — runs IMMEDIATELY on page load
        const checkLeaveStatus = async () => {
            try {
                const leavesData = await getMyLeaves();
                const todayStr = toLocalStr(new Date());
                const continuousLeave = getContinuousLeaveBlock(leavesData, todayStr);
                setActiveLeave(continuousLeave || null);
            } catch (err) {
                console.error('Leave check failed:', err);
            }
        };

        // Fetch joining date for date validation
        const fetchProfile = async () => {
            try {
                const profileRes = await getProfile();
                setJoiningDate(profileRes.data.dateOfJoining.split('T')[0]);
            } catch (err) {
                console.error('Profile fetch failed:', err);
            }
        };

        // Fire-and-forget cleanup (runs in background, does NOT block leave detection)
        cleanLeaveConflicts().catch(() => {});

        // Run leave check + profile fetch immediately in parallel
        checkLeaveStatus();
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
        const todayISO = new Date().toISOString().split('T')[0];
        if (formData.date !== todayISO) {
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
            // ── LEAVE GUARD: re-check leaves fresh before marking ──
            // This catches the case where page-load check missed the leave
            const todayStr = toLocalStr(new Date());

            let freshLeaves = [];
            try {
                freshLeaves = await getMyLeaves();
            } catch (_) { /* if fetch fails, proceed and let backend reject */ }

            const leaveToday = getContinuousLeaveBlock(freshLeaves, todayStr);

            if (leaveToday) {
                const endDate = new Date(leaveToday.endDate).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });
                setActiveLeave(leaveToday); // show the leave banner too
                setError(`You are already on ${leaveToday.leaveType} leave till ${endDate}. Attendance cannot be marked.`);
                setLoading(false);
                return;
            }
            // ── END LEAVE GUARD ──

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
                        {/* ── On Leave Banner ── show this instead of the form */}
                        {activeLeave ? (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                    <svg className="w-10 h-10 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-bold text-orange-700 mb-2">You're Currently on Leave</h2>
                                <p className="text-gray-600 mb-4">
                                    You cannot mark attendance while on an approved leave.
                                </p>
                                <div className="inline-block bg-orange-50 border border-orange-200 rounded-xl px-6 py-4 text-left">
                                    <p className="text-sm text-orange-800">
                                        <span className="font-semibold">Leave Type:</span> {activeLeave.leaveType}
                                    </p>
                                    <p className="text-sm text-orange-800 mt-1">
                                        <span className="font-semibold">From:</span> {new Date(activeLeave.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-sm text-orange-800 mt-1">
                                        <span className="font-semibold">To:</span> {new Date(activeLeave.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                    <p className="text-sm text-orange-800 mt-1">
                                        <span className="font-semibold">Total Days:</span> {activeLeave.totalDays} day{activeLeave.totalDays > 1 ? 's' : ''}
                                    </p>
                                </div>
                                <p className="text-sm text-gray-500 mt-5">
                                    Attendance will resume automatically after your leave ends.
                                </p>
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MarkAttendance;
