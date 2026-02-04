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
