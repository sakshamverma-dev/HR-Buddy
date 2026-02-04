import api from './api';

// Get monthly attendance report
export const getMonthlyReport = async (month, year) => {
    const response = await api.get(`/reports/monthly?month=${month}&year=${year}`);
    return response.data;
};
