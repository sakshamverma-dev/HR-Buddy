import { useState } from 'react';

const AttendanceCalendar = ({ attendanceRecords }) => {
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

    // Create attendance map for quick lookup
    const attendanceMap = {};
    attendanceRecords.forEach(record => {
        const dateKey = new Date(record.date).toISOString().split('T')[0];
        attendanceMap[dateKey] = record.status;
    });

    // Navigate months
    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const today = () => {
        setCurrentDate(new Date());
    };

    // Generate calendar days
    const calendarDays = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
        calendarDays.push(<div key={`empty-${i}`} className="h-12"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dateObj = new Date(year, month, day);
        const dateKey = dateObj.toISOString().split('T')[0];
        const status = attendanceMap[dateKey];
        const isToday = dateKey === new Date().toISOString().split('T')[0];
        const isSunday = dateObj.getDay() === 0;

        let bgColor = 'bg-gray-50 hover:bg-gray-100';
        let textColor = 'text-gray-700';
        let statusDot = null;

        if (status === 'Present') {
            bgColor = 'bg-green-100 hover:bg-green-200';
            textColor = 'text-green-800';
            statusDot = <div className="w-2 h-2 bg-green-500 rounded-full mx-auto mt-1"></div>;
        } else if (status === 'Absent') {
            bgColor = 'bg-red-100 hover:bg-red-200';
            textColor = 'text-red-800';
            statusDot = <div className="w-2 h-2 bg-red-500 rounded-full mx-auto mt-1"></div>;
        } else if (isSunday) {
            bgColor = 'bg-gray-100';
            textColor = 'text-gray-400';
        }

        calendarDays.push(
            <div
                key={day}
                className={`h-12 flex flex-col items-center justify-center rounded-lg transition-colors ${bgColor} ${isToday ? 'ring-2 ring-primary-500' : ''
                    }`}
            >
                <span className={`text-sm font-medium ${textColor}`}>{day}</span>
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
                        onClick={today}
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
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2">
                        {day}
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
