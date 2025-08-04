import axios from 'axios';

const API_URL = 'http://172.16.15.115:5000/api/v1/users'; // Replace with your backend URL

const usersApi = {
    /**
     * Get all users with comprehensive filtering, pagination, and sorting.
     * @param {object} [params={}] - Query parameters for filtering, pagination, and sorting.
     * @returns {Promise<object>} - A promise that resolves with the list of users.
     */
    getAllUsers: async (params = {}) => {
        try {
            const response = await axios.get(API_URL, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get a user by ID.
     * @param {string|number} id - The ID of the user.
     * @returns {Promise<object>} - A promise that resolves with the user data.
     */
    getUserById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Create a new user.
     * @param {object} userData - Data for the new user.
     * @returns {Promise<object>} - A promise that resolves with the created user data.
     */
    createUser: async (userData) => {
        try {
            const response = await axios.post(API_URL, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Update an existing user.
     * @param {string|number} id - The ID of the user to update.
     * @param {object} userData - Data to update for the user.
     * @returns {Promise<object>} - A promise that resolves with the updated user data.
     */
    updateUser: async (id, userData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Soft delete (deactivate) a user.
     * @param {string|number} id - The ID of the user to soft delete.
     * @returns {Promise<object>} - A promise that resolves with the deletion confirmation.
     */
    deleteUser: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Permanently delete a user.
     * @param {string|number} id - The ID of the user to permanently delete.
     * @returns {Promise<object>} - A promise that resolves with the permanent deletion confirmation.
     */
    permanentDeleteUser: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}/permanent`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Reactivate a soft-deleted user.
     * @param {string|number} id - The ID of the user to reactivate.
     * @returns {Promise<object>} - A promise that resolves with the reactivation confirmation.
     */
    reactivateUser: async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/reactivate`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default usersApi;
