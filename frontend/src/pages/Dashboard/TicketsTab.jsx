import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, Filter, X, Plus } from 'lucide-react';
import ticketsApi from '../../api/tickets';
import techniciansApi from '../../api/technician'; // Import for assigned technician filter
import usersApi from '../../api/users'; // Import for requester filter
import { TicketsTable } from './TicketsTable'; // Reusing TicketsTable (presentational only)
import { Pagination } from './DashboardPagination'; // Reusing Pagination

// Helper functions (kept here for self-containment, but ideally in a shared utils file)
const getPriorityColor = (priority) => {
    switch (priority) {
        case 'critical': return 'bg-red-100 text-red-800';
        case 'high': return 'bg-orange-100 text-orange-800';
        case 'normal': return 'bg-yellow-100 text-yellow-800';
        case 'low': return 'bg-green-100 text-green-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getStatusColor = (status) => {
    switch (status) {
        case 'new':
        case 'assigned':
        case 'in_progress': return 'bg-blue-100 text-blue-800';
        case 'on_hold': return 'bg-yellow-100 text-yellow-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        case 'closed':
        case 'cancelled': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};


export const TicketsTab = ({ loading, setLoading, error, setError }) => {
    const [allTickets, setAllTickets] = useState([]);
    const [ticketsCurrentPage, setTicketsCurrentPage] = useState(1);
    const [ticketsTotalCount, setTicketsTotalCount] = useState(0);
    const ticketsLimit = 10;

    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: '',
        priority: '',
        assigned_technician_id: '',
        requester_id: ''
    });
    const [sortConfig, setSortConfig] = useState({
        field: 'created_at',
        direction: 'desc'
    });

    // States for dynamic filter options
    const [technicianOptions, setTechnicianOptions] = useState([]);
    const [requesterOptions, setRequesterOptions] = useState([]);

    // Fetch dynamic filter options (technicians and users)
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const techsResponse = await techniciansApi.getAllTechniciansSimple(); // Assuming this returns { data: {technicians: [...]}, total: X } or just [...]
                const techsData = techsResponse.data?.technicians || techsResponse.data || [];
                setTechnicianOptions(techsData.map(tech => ({ id: tech.id, name: tech.user?.name || tech.name || `Tech ${tech.id}` })));

                const usersResponse = await usersApi.getAllUsers(); // Assuming this returns { data: {users: [...]}, total: X } or just [...]
                const usersData = usersResponse.data?.users || usersResponse.data || [];
                setRequesterOptions(usersData.map(user => ({ id: user.id, name: user.name || `User ${user.id}` })));

            } catch (err) {
                console.error("Failed to fetch filter options:", err);
            }
        };
        fetchFilterOptions();
    }, []);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = {
                limit: ticketsLimit,
                offset: (ticketsCurrentPage - 1) * ticketsLimit, // Correct offset calculation
                include: 'requester,assigned_technician'
            };

            if (filters.status) queryParams.status = filters.status;
            if (filters.priority) queryParams.priority = filters.priority;
            if (filters.assigned_technician_id) queryParams.assigned_technician_id = filters.assigned_technician_id;
            if (filters.requester_id) queryParams.requester_id = filters.requester_id;

            if (sortConfig.field) {
                queryParams.sort_by = sortConfig.field;
                queryParams.sort_order = sortConfig.direction;
            }

            const ticketsResponse = await ticketsApi.getAllTickets(queryParams);
            setAllTickets(ticketsResponse.data?.tickets || []);
            setTicketsTotalCount(ticketsResponse.data?.pagination?.total || ticketsResponse.data?.total || ticketsResponse.total || 0);
        } catch (err) {
            console.error("Failed to fetch tickets:", err.response?.data || err.message);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, [ticketsCurrentPage, ticketsLimit, filters, sortConfig, setLoading, setError]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    const handleTicketsPageChange = (newPage) => {
        // Only update if newPage is valid
        if (newPage > 0 && newPage <= Math.ceil(ticketsTotalCount / ticketsLimit)) {
            setTicketsCurrentPage(newPage);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setTicketsCurrentPage(1); // Reset to first page when filtering
    };

    const handleSort = (field) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setTicketsCurrentPage(1); // Reset to first page when sorting
    };

    const clearFilters = () => {
        setFilters({
            status: '',
            priority: '',
            assigned_technician_id: '',
            requester_id: ''
        });
        setTicketsCurrentPage(1);
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <div className="bg-white shadow-xl rounded-lg p-8 transform transition-all duration-300 hover:scale-[1.005]">
            {/* Header with Filter Toggle and Sort Controls */}
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h2 className="text-3xl font-extrabold text-gray-900">All Tickets</h2>
                <div className="flex items-center gap-4">
                    {/* Sort Controls */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <button
                            onClick={() => handleSort('created_at')}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${sortConfig.field === 'created_at'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Date
                            {sortConfig.field === 'created_at' && (
                                sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                        </button>
                        <button
                            onClick={() => handleSort('priority')}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${sortConfig.field === 'priority'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Priority
                            {sortConfig.field === 'priority' && (
                                sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                        </button>
                        <button
                            onClick={() => handleSort('status')}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${sortConfig.field === 'status'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Status
                            {sortConfig.field === 'status' && (
                                sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                        </button>
                    </div>

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                        {hasActiveFilters && (
                            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-indigo-600 rounded-full">
                                {Object.values(filters).filter(v => v !== '').length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-inner">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="text-base font-semibold text-gray-900">Filter Options</h4>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                            >
                                <X className="h-3 w-3" />
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
                            >
                                <option value="">All Statuses</option>
                                <option value="new">New</option>
                                <option value="assigned">Assigned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="on_hold">On Hold</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                            <select
                                value={filters.priority}
                                onChange={(e) => handleFilterChange('priority', e.target.value)}
                                className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
                            >
                                <option value="">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>

                        {/* Assigned Technician Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                            <select
                                value={filters.assigned_technician_id}
                                onChange={(e) => handleFilterChange('assigned_technician_id', e.target.value)}
                                className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
                            >
                                <option value="">All Technicians</option>
                                <option value="unassigned">Unassigned</option>
                                {/* Populate dynamically */}
                                {technicianOptions.map(tech => (
                                    <option key={tech.id} value={tech.id}>{tech.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Requester Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Requester</label>
                            <select
                                value={filters.requester_id}
                                onChange={(e) => handleFilterChange('requester_id', e.target.value)}
                                className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
                            >
                                <option value="">All Requesters</option>
                                {/* Populate dynamically */}
                                {requesterOptions.map(req => (
                                    <option key={req.id} value={req.id}>{req.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Summary */}
            {!loading && !error && (
                <div className="mb-4 text-sm text-gray-600 px-2">
                    Showing {allTickets.length} of {ticketsTotalCount} tickets
                    {hasActiveFilters && (
                        <span className="ml-2 text-indigo-600">
                            (filtered)
                        </span>
                    )}
                </div>
            )}

            {loading && <p className="text-center text-gray-500 py-8">Loading tickets...</p>}
            {error && <p className="text-center text-red-500 py-8">Error loading tickets: {error}</p>}
            {!loading && !error && allTickets.length === 0 ? (
                <p className="px-6 py-8 text-center text-gray-500">
                    {hasActiveFilters ? 'No tickets match your filters.' : 'No tickets found.'}
                </p>
            ) : (
                <>
                    <TicketsTable tickets={allTickets} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} />
                    <Pagination
                        currentPage={ticketsCurrentPage}
                        totalCount={ticketsTotalCount}
                        limit={ticketsLimit}
                        onPageChange={handleTicketsPageChange}
                    />
                </>
            )}
        </div>
    );
};
