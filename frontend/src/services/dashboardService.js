import api from './api';

// Get admin dashboard stats
export const getDashboardStats = async () => {
    const response = await api.get('/dashboard/stats');
    return response.data;
};

export default {
    getDashboardStats,
};
