import axios from 'axios';

const API_URL = 'http://172.16.15.115:5000/api/v1/skills'; // Replace with your backend URL

const skillsApi = {
    /**
     * Get all skills without pagination (simple list).
     * @param {object} [params={}] - Query parameters for filtering (is_active, sort_by, sort_order).
     * @returns {Promise<object>} - A promise that resolves with the list of skills.
     */
    getAllSkillsSimple: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/all`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get all skills with comprehensive filtering, pagination, and sorting.
     * @param {object} [params={}] - Query parameters for filtering, pagination, and sorting.
     * @returns {Promise<object>} - A promise that resolves with the list of skills.
     */
    getAllSkills: async (params = {}) => {
        try {
            const response = await axios.get(API_URL, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get a skill by ID.
     * @param {string|number} id - The ID of the skill.
     * @returns {Promise<object>} - A promise that resolves with the skill data.
     */
    getSkillById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Create a new skill.
     * @param {object} skillData - Data for the new skill (name, description, is_active).
     * @returns {Promise<object>} - A promise that resolves with the created skill data.
     */
    createSkill: async (skillData) => {
        try {
            const response = await axios.post(API_URL, skillData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Update an existing skill.
     * @param {string|number} id - The ID of the skill to update.
     * @param {object} skillData - Data to update for the skill.
     * @returns {Promise<object>} - A promise that resolves with the updated skill data.
     */
    updateSkill: async (id, skillData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, skillData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Soft delete (deactivate) a skill.
     * @param {string|number} id - The ID of the skill to soft delete.
     * @returns {Promise<object>} - A promise that resolves with the deletion confirmation.
     */
    deleteSkill: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Permanently delete a skill.
     * @param {string|number} id - The ID of the skill to permanently delete.
     * @returns {Promise<object>} - A promise that resolves with the permanent deletion confirmation.
     */
    permanentDeleteSkill: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}/permanent`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Reactivate a soft-deleted skill.
     * @param {string|number} id - The ID of the skill to reactivate.
     * @returns {Promise<object>} - A promise that resolves with the reactivation confirmation.
     */
    reactivateSkill: async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/reactivate`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default skillsApi;
