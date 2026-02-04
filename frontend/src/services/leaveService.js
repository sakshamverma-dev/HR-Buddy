import api from './api';

export const applyLeave = async (leaveData) => {
    const response = await api.post('/leave/apply', leaveData);
    return response.data;
};

export const getMyLeaves = async () => {
    const response = await api.get('/leave/my');
    return response.data;
};

export const editLeave = async (id, leaveData) => {
    const response = await api.put(`/leave/edit/${id}`, leaveData);
    return response.data;
};

export const cancelLeave = async (id) => {
    const response = await api.delete(`/leave/cancel/${id}`);
    return response.data;
};

export const getAllLeaves = async () => {
    const response = await api.get('/leave/all');
    return response.data;
};

export const updateLeaveStatus = async (id, status) => {
    const response = await api.put(`/leave/status/${id}`, { status });
    return response.data;
};
