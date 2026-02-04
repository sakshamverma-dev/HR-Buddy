import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reports';

// Get monthly attendance report
export const getMonthlyReport = async (month, year) => {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/monthly?month=${month}&year=${year}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data;
};
