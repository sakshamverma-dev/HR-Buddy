import api from './api';

export const markAttendance = async (attendanceData) => {
    const response = await api.post('/attendance/mark', attendanceData);
    return response.data;
};

export const getMyAttendance = async () => {
    const response = await api.get('/attendance/my');
    return response.data;
};

export const getAllAttendance = async () => {
    const response = await api.get('/attendance/all');
    return response.data;
};

export const adminUpdateAttendance = async (userId, date, newStatus) => {
    const response = await api.put('/attendance/admin-update', { userId, date, newStatus });
    return response.data;
};

// Cleans up attendance records that conflict with approved leaves
export const cleanLeaveConflicts = async () => {
    const response = await api.delete('/attendance/clean-leave-conflicts');
    return response.data;
};

