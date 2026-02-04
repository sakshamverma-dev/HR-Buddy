import api from './api';

// Get all employees (Admin only)
export const getAllEmployees = async () => {
    const response = await api.get('/employees');
    return response.data;
};

export default {
    getAllEmployees,
};
