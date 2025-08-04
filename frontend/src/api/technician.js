import axios from 'axios';

const API_URL = 'http://172.16.15.115:5000/api/v1/technicians'; // Replace with your backend URL

const techniciansApi = {
    /**
     * Get all technicians without pagination (simple list).
     * @param {object} [params={}] - Query parameters for filtering and sorting.
     * @returns {Promise<object>} - A promise that resolves with the list of technicians.
     */
    getAllTechniciansSimple: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/all`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get technicians by skills (union filter).
     * @param {object} params - Query parameters including 'skills' (array of skill IDs).
     * @returns {Promise<object>} - A promise that resolves with the list of technicians.
     */
    getTechniciansBySkills: async (params) => {
        try {
            const response = await axios.get(`${API_URL}/by-skills`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get all technicians with comprehensive filtering, pagination, and sorting.
     * @param {object} [params={}] - Query parameters for filtering, pagination, and sorting.
     * @returns {Promise<object>} - A promise that resolves with the list of technicians.
     */
    getAllTechnicians: async (params = {}) => {
        try {
            const response = await axios.get(API_URL, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get a technician by ID.
     * @param {string|number} id - The ID of the technician.
     * @returns {Promise<object>} - A promise that resolves with the technician data.
     */
    getTechnicianById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Create a new technician.
     * @param {object} technicianData - Data for the new technician.
     * @returns {Promise<object>} - A promise that resolves with the created technician data.
     */
    createTechnician: async (technicianData) => {
        try {
            const response = await axios.post(API_URL, technicianData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Update an existing technician.
     * @param {string|number} id - The ID of the technician to update.
     * @param {object} technicianData - Data to update for the technician.
     * @returns {Promise<object>} - A promise that resolves with the updated technician data.
     */
    updateTechnician: async (id, technicianData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, technicianData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Soft delete (deactivate) a technician.
     * @param {string|number} id - The ID of the technician to soft delete.
     * @returns {Promise<object>} - A promise that resolves with the deletion confirmation.
     */
    deleteTechnician: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Permanently delete a technician.
     * @param {string|number} id - The ID of the technician to permanently delete.
     * @returns {Promise<object>} - A promise that resolves with the permanent deletion confirmation.
     */
    permanentDeleteTechnician: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}/permanent`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Reactivate a soft-deleted technician.
     * @param {string|number} id - The ID of the technician to reactivate.
     * @returns {Promise<object>} - A promise that resolves with the reactivation confirmation.
     */
    reactivateTechnician: async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/reactivate`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default techniciansApi;
