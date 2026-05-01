import { useState } from 'react';

const AttendanceCalendar = ({ attendanceRecords, leaveRecords = [] }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    // Get month and year
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and total days
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Month names
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    // Helper: local date string YYYY-MM-DD (avoids UTC timezone shift)
    const toLocalDateString = (date) => {
        const d = new Date(date);
        const yr = d.getFullYear();
        const mo = String(d.getMonth() + 1).padStart(2, '0');
        const dy = String(d.getDate()).padStart(2, '0');
        return `${yr}-${mo}-${dy}`;
    };

    // Create attendance map for quick lookup
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
        const dateKey = toLocalDateString(new Date(record.date));
        attendanceMap[dateKey] = record.status;
    });

    // Build leave date set — expand each leave's date range, skip Sundays
    // Only show Pending and Approved leaves (not Rejected)
    const leaveDateMap = {}; // dateKey -> leave status (Approved / Pending)
    leaveRecords.forEach(leave => {
        if (!['Approved', 'Pending'].includes(leave.status)) return;

        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        let cur = new Date(start);
        while (cur <= end) {
            if (cur.getDay() !== 0) { // skip Sundays
                const dk = toLocalDateString(cur);
                // Approved takes priority over Pending
                if (!leaveDateMap[dk] || leave.status === 'Approved') {
                    leaveDateMap[dk] = leave.status;
                }
            }
            cur.setDate(cur.getDate() + 1);
        }
    });

    // Navigate months
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const goToday  = () => setCurrentDate(new Date());

    // Today's local date string for comparison
    const todayDateString = toLocalDateString(new Date());

    // Generate calendar days
    const calendarDays = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dateKey = toLocalDateString(dateObj);
        const attendStatus = attendanceMap[dateKey];
        const leaveStatus  = leaveDateMap[dateKey];
        const isToday  = dateKey === todayDateString;
        const isSunday = dateObj.getDay() === 0;

        let bgColor    = 'bg-gray-50 hover:bg-gray-100';
        let textColor  = 'text-gray-700';
        let statusDot  = null;

        // Priority: Sunday > Leave > Present > Absent > default
        if (isSunday) {
            bgColor   = 'bg-gray-100';
            textColor = 'text-gray-400';
        } else if (leaveStatus) {
            // Orange for Approved, amber-yellow for Pending
            const isApproved = leaveStatus === 'Approved';
            bgColor   = isApproved
                ? 'bg-orange-100 hover:bg-orange-200'
                : 'bg-amber-100 hover:bg-amber-200';
            textColor = isApproved ? 'text-orange-800' : 'text-amber-800';
            statusDot = (
                <div
                    className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                        isApproved ? 'bg-orange-500' : 'bg-amber-400'
                    }`}
                ></div>
            );
        } else if (attendStatus === 'Present') {
            bgColor   = 'bg-green-100 hover:bg-green-200';
            textColor = 'text-green-800';
            statusDot = <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>;
        } else if (attendStatus === 'Absent') {
            bgColor   = 'bg-red-100 hover:bg-red-200';
            textColor = 'text-red-800';
            statusDot = <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mt-1"></div>;
        }

        calendarDays.push(
            <div
                key={day}
                className={`h-12 flex flex-col items-center justify-center rounded-lg transition-colors ${bgColor} ${
                    isToday ? 'ring-2 ring-primary-500' : ''
                }`}
            >
                <span className={`text-sm font-medium ${textColor} ${isToday ? 'font-bold' : ''}`}>{day}</span>
                {statusDot}
            </div>
        );
    }

    return (
        <div className="card">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    {monthNames[month]} {year}
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Previous Month"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <button
                        onClick={goToday}
                        className="px-3 py-1 text-sm font-medium text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                        Today
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Next Month"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                    <div key={d} className="text-center text-xs font-semibold text-gray-600 py-2">
                        {d}
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
                {calendarDays}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs font-semibold text-gray-600 mb-3">Legend:</p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-green-100 rounded mr-2 flex items-center justify-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-700">Present</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-red-100 rounded mr-2 flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-700">Absent</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-orange-100 rounded mr-2 flex items-center justify-center">
                            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-700">Leave (Approved)</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-amber-100 rounded mr-2 flex items-center justify-center">
                            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                        </div>
                        <span className="text-sm text-gray-700">Leave (Pending)</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                        <span className="text-sm text-gray-700">Sunday</span>
                    </div>
                    <div className="flex items-center">
                        <div className="w-4 h-4 bg-gray-50 rounded mr-2 ring-2 ring-primary-500"></div>
                        <span className="text-sm text-gray-700">Today</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttendanceCalendar;
