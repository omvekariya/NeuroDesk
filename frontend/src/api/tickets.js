import axios from 'axios';

const API_URL = 'http://172.16.15.115:5000/api/v1/tickets'; // Replace with your backend URL

const ticketsApi = {
    /**
     * Get all tickets without pagination (simple list).
     * @param {object} [params={}] - Query parameters for filtering and sorting.
     * @returns {Promise<object>} - A promise that resolves with the list of tickets.
     */
    getAllTicketsSimple: async (params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/all`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get tickets by required skills (union filter).
     * @param {object} params - Query parameters including 'skills' (array of skill IDs).
     * @returns {Promise<object>} - A promise that resolves with the list of tickets.
     */
    getTicketsBySkills: async (params) => {
        try {
            const response = await axios.get(`${API_URL}/by-skills`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get tickets by user ID (requester).
     * @param {string|number} userId - The ID of the requester.
     * @param {object} [params={}] - Query parameters for pagination and filtering.
     * @returns {Promise<object>} - A promise that resolves with the list of tickets.
     */
    getTicketsByUserId: async (userId, params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/user/${userId}`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get tickets by technician ID (assigned).
     * @param {string|number} technicianId - The ID of the assigned technician.
     * @param {object} [params={}] - Query parameters for pagination and filtering.
     * @returns {Promise<object>} - A promise that resolves with the list of tickets.
     */
    getTicketsByTechnicianId: async (technicianId, params = {}) => {
        try {
            const response = await axios.get(`${API_URL}/technician/${technicianId}`, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get all tickets with comprehensive filtering, pagination, and sorting.
     * @param {object} [params={}] - Query parameters for filtering, pagination, and sorting.
     * @returns {Promise<object>} - A promise that resolves with the list of tickets.
     */
    getAllTickets: async (params = {}) => {
        try {
            const response = await axios.get(API_URL, { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Get a ticket by ID.
     * @param {string|number} id - The ID of the ticket.
     * @returns {Promise<object>} - A promise that resolves with the ticket data.
     */
    getTicketById: async (id) => {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Create a new ticket.
     * @param {object} ticketData - Data for the new ticket.
     * @returns {Promise<object>} - A promise that resolves with the created ticket data.
     */
    createTicket: async (ticketData) => {
        try {
            const response = await axios.post(API_URL, ticketData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Update an existing ticket.
     * @param {string|number} id - The ID of the ticket to update.
     * @param {object} ticketData - Data to update for the ticket.
     * @returns {Promise<object>} - A promise that resolves with the updated ticket data.
     */
    updateTicket: async (id, ticketData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}`, ticketData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    closeTicket: async (id, closeData) => {
        try {
            const response = await axios.put(`${API_URL}/${id}/close`, {
                feedback: closeData.feedback || null,
                satisfaction_rating: closeData.satisfaction_rating ? parseInt(closeData.satisfaction_rating) : null,
                resolution_notes: closeData.resolution_notes || null
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
    /**
     * Soft delete (cancel) a ticket.
     * @param {string|number} id - The ID of the ticket to soft delete.
     * @returns {Promise<object>} - A promise that resolves with the deletion confirmation.
     */
    deleteTicket: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Permanently delete a ticket.
     * @param {string|number} id - The ID of the ticket to permanently delete.
     * @returns {Promise<object>} - A promise that resolves with the permanent deletion confirmation.
     */
    permanentDeleteTicket: async (id) => {
        try {
            const response = await axios.delete(`${API_URL}/${id}/permanent`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    /**
     * Reactivate a soft-deleted ticket.
     * @param {string|number} id - The ID of the ticket to reactivate.
     * @returns {Promise<object>} - A promise that resolves with the reactivation confirmation.
     */
    reactivateTicket: async (id) => {
        try {
            const response = await axios.patch(`${API_URL}/${id}/reactivate`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default ticketsApi;
