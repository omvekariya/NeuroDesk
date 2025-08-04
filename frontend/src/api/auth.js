import axios from 'axios';

const API_URL = 'http://172.16.15.115:5000/api/v1/auth'; // Replace with your backend URL

const authApi = {
    /**
     * Register a new user.
     * @param {object} userData - User data for registration (name, email, password, contact_no, role, department).
     * @returns {Promise<object>} - A promise that resolves with the registration response.
     */
    register: async (userData) => {
        try {
            const response = await axios.post(`${API_URL}/register`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Log in a user.
     * @param {object} credentials - User credentials for login (email, password).
     * @returns {Promise<object>} - A promise that resolves with the login response.
     */
    login: async (credentials) => {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get user profile by ID.
     * @param {string|number} userId - The ID of the user.
     * @returns {Promise<object>} - A promise that resolves with the user profile data.
     */
    getProfile: async (userId) => {
        try {
            const response = await axios.get(`${API_URL}/profile/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default authApi;
