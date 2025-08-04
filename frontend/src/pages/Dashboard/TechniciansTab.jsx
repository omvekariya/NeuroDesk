import React, { useState, useEffect, useCallback } from 'react';
import { ChevronUp, ChevronDown, Filter, X } from 'lucide-react';
import techniciansApi from '../../api/technician';
import skillsApi from '../../api/skills';
import { TechniciansTable } from './TechniciansTable';
import { Pagination } from './DashboardPagination'; // Corrected path from DashboardPagination

// Helper functions (kept here for self-containment, but ideally in a shared utils file)
const getTechnicianAvailabilityColor = (availabilityStatus) => {
    switch (availabilityStatus) {
        case 'available': return 'bg-green-100 text-green-600';
        case 'busy':
        case 'in_meeting': return 'bg-red-100 text-red-600';
        case 'on_break':
        case 'focus_mode':
        case 'end_of_shift': return 'bg-yellow-100 text-yellow-600';
        default: return 'bg-gray-100 text-gray-600';
    }
};

export const TechniciansTab = ({ loading, setLoading, error, setError, overviewStats, setOverviewStats }) => {
    const [allTechnicians, setAllTechnicians] = useState([]);
    const [techniciansCurrentPage, setTechniciansCurrentPage] = useState(1);
    const [techniciansTotalCount, setTechniciansTotalCount] = useState(0);
    const techniciansLimit = 10;

    const [expandedSkills, setExpandedSkills] = useState({});

    // Filter states
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        skill_level: '',
        availability_status: '',
        specialization: '',
        department: ''
    });
    const [sortConfig, setSortConfig] = useState({
        field: 'name',
        direction: 'asc'
    });

    // States for dynamic filter options
    const [specializationOptions, setSpecializationOptions] = useState([]);
    const [departmentOptions, setDepartmentOptions] = useState([]);

    // Local state for technician stats on this tab
    const [technicianStats, setTechnicianStats] = useState({
        totalTechnicians: 0,
        availableTechs: 0,
        totalTicketsResolved: 0,
    });

    // Fetch dynamic filter options (specializations and departments)
    useEffect(() => {
        const fetchFilterOptions = async () => {
            try {
                const response = await techniciansApi.getAllTechniciansSimple();
                const allTechsData = response.data?.technicians || response.data || [];

                const uniqueSpecializations = [...new Set(allTechsData.map(tech => tech.specialization).filter(Boolean))];
                const uniqueDepartments = [...new Set(allTechsData.map(tech => tech.user?.department).filter(Boolean))];

                setSpecializationOptions(uniqueSpecializations);
                setDepartmentOptions(uniqueDepartments);
            } catch (err) {
                console.error("Failed to fetch dynamic filter options:", err);
            }
        };
        fetchFilterOptions();
    }, []);

    const fetchTechnicians = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const queryParams = {
                limit: techniciansLimit,
                offset: (techniciansCurrentPage - 1) * techniciansLimit,
                include: 'skills,user'
            };

            if (filters.skill_level) queryParams.skill_level = filters.skill_level;
            if (filters.availability_status) queryParams.availability_status = filters.availability_status;
            if (filters.specialization) queryParams.specialization = filters.specialization;
            if (filters.department) queryParams.department = filters.department;

            if (sortConfig.field) {
                queryParams.sort_by = sortConfig.field;
                queryParams.sort_order = sortConfig.direction;
            }

            const techsResponse = await techniciansApi.getAllTechnicians(queryParams);

            const rawTechniciansData = techsResponse.data?.technicians || [];

            const transformedTechnicians = await Promise.all(rawTechniciansData.map(async (tech) => {
                let fullSkillsData = [];
                if (tech.skills && tech.skills.length > 0) {
                    fullSkillsData = await Promise.all(
                        tech.skills.map(async (skillIdAndPercentage) => {
                            try {
                                const skillResponse = await skillsApi.getSkillById(skillIdAndPercentage.id);
                                const skillDetails = skillResponse.data || skillResponse;
                                return {
                                    id: skillDetails.id,
                                    name: skillDetails.name,
                                    percentage: skillIdAndPercentage.percentage
                                };
                            } catch (skillErr) {
                                console.warn(`Failed to fetch skill ${skillIdAndPercentage.id} for technician ${tech.id}:`, skillErr);
                                return {
                                    id: skillIdAndPercentage.id,
                                    name: `Skill ID ${skillIdAndPercentage.id} (Name N/A)`,
                                    percentage: skillIdAndPercentage.percentage
                                };
                            }
                        })
                    );
                }

                return {
                    id: tech.id,
                    name: tech.user?.name || tech.name,
                    role: tech.user?.department || tech.specialization || 'IT Technician',
                    avatar: (tech.user?.name || tech.name)?.split(' ').map(n => n[0]).join('').toUpperCase() || '??',
                    skills: fullSkillsData,
                    experience: tech.skill_level === 'senior' ? '8+ years' :
                        tech.skill_level === 'expert' ? '10+ years' :
                            tech.skill_level === 'mid' ? '4-7 years' :
                                tech.skill_level === 'junior' ? '1-3 years' : 'N/A',
                    availability_status: tech.availability_status || 'offline',
                    status: tech.availability_status === 'available' ? 'online' :
                        tech.availability_status === 'busy' || tech.availability_status === 'in_meeting' ? 'busy' :
                            tech.availability_status === 'focus_mode' || tech.availability_status === 'on_break' || tech.availability_status === 'end_of_shift' ? 'away' : 'offline',
                    assigned_tickets_total: tech.assigned_tickets_total || 0,
                    satisfaction_rating: tech.satisfaction_rating || 0
                };
            }));

            setAllTechnicians(transformedTechnicians);
            setTechniciansTotalCount(techsResponse.data?.pagination?.total || techsResponse.data?.total || techsResponse.total || 0);

            // Calculate local technician stats for display on this tab
            const totalTechs = techsResponse.data?.pagination?.total || techsResponse.data?.total || techsResponse.total || 0;
            const availableTechs = transformedTechnicians.filter(tech =>
                tech.availability_status === 'available' || tech.status === 'online'
            ).length;
            const totalTicketsResolved = transformedTechnicians.reduce((sum, tech) =>
                sum + (tech.assigned_tickets_total || 0), 0);

            // Update local stats
            setTechnicianStats({
                totalTechnicians: totalTechs,
                availableTechs: availableTechs,
                totalTicketsResolved: totalTicketsResolved,
            });

            // Also update the overviewStats prop for the main dashboard's overview tab
            setOverviewStats(prevStats => ({
                ...prevStats,
                totalTechniciansOverview: totalTechs,
                availableTechsOverview: availableTechs,
                totalTicketsResolvedOverall: totalTicketsResolved,
                avgTechnicianRating: 'N/A' // Still N/A as requested
            }));

        } catch (err) {
            console.error("Failed to fetch technicians:", err.response?.data || err.message);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, [techniciansCurrentPage, techniciansLimit, filters, sortConfig, setLoading, setError, setOverviewStats]);

    useEffect(() => {
        fetchTechnicians();
    }, [fetchTechnicians]);

    const handleTechniciansPageChange = (newPage) => {
        if (newPage > 0 && newPage <= Math.ceil(techniciansTotalCount / techniciansLimit)) {
            setTechniciansCurrentPage(newPage);
        }
    };

    // Filter and sort handlers
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
        setTechniciansCurrentPage(1); // Reset to first page when filtering
    };

    const handleSort = (field) => {
        setSortConfig(prev => ({
            field,
            direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
        setTechniciansCurrentPage(1); // Reset to first page when sorting
    };

    const clearFilters = () => {
        setFilters({
            skill_level: '',
            availability_status: '',
            specialization: '',
            department: ''
        });
        setTechniciansCurrentPage(1);
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
        <div className="bg-white shadow-xl rounded-lg p-8 transform transition-all duration-300 hover:scale-[1.005]">
            {/* Header with Filter Toggle and Sort Controls */}
            <div className="flex items-center justify-between mb-6 border-b pb-4">
                <h2 className="text-3xl font-extrabold text-gray-900">All Technicians</h2>
                <div className="flex items-center gap-4">
                    {/* Sort Controls */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">Sort by:</span>
                        <button
                            onClick={() => handleSort('name')}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${sortConfig.field === 'name'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Name
                            {sortConfig.field === 'name' && (
                                sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                        </button>
                        <button
                            onClick={() => handleSort('skill_level')}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${sortConfig.field === 'skill_level'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Level
                            {sortConfig.field === 'skill_level' && (
                                sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                        </button>
                        <button
                            onClick={() => handleSort('availability_status')}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${sortConfig.field === 'availability_status'
                                ? 'bg-indigo-100 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Status
                            {sortConfig.field === 'availability_status' && (
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

            {/* Stats Bar - MOVED HERE, styled to match outer card */}
            <div className="bg-white rounded-lg p-6 shadow-sm mb-6 border border-gray-100">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-center"> {/* Changed to 3 columns as Avg. Rating is removed */}
                    <div>
                        <div className="text-3xl font-bold text-blue-600 mb-1">{technicianStats.totalTechnicians}</div>
                        <p className="text-gray-600 text-sm">Total Technicians</p>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-green-600 mb-1">{technicianStats.availableTechs}</div>
                        <p className="text-gray-600 text-sm">Available Now</p>
                    </div>
                    <div>
                        <div className="text-3xl font-bold text-purple-600 mb-1">{technicianStats.totalTicketsResolved?.toLocaleString() || 'N/A'}</div>
                        <p className="text-gray-600 text-sm">Tickets Resolved</p>
                    </div>
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
                        {/* Skill Level Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                            <select
                                value={filters.skill_level}
                                onChange={(e) => handleFilterChange('skill_level', e.target.value)}
                                className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
                            >
                                <option value="">All Levels</option>
                                <option value="junior">Junior (1-3 years)</option>
                                <option value="mid">Mid-Level (4-7 years)</option>
                                <option value="senior">Senior (8+ years)</option>
                                <option value="expert">Expert (10+ years)</option>
                            </select>
                        </div>

                        {/* Availability Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                            <select
                                value={filters.availability_status}
                                onChange={(e) => handleFilterChange('availability_status', e.target.value)}
                                className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
                            >
                                <option value="">All Statuses</option>
                                <option value="available">Available</option>
                                <option value="busy">Busy</option>
                                <option value="in_meeting">In Meeting</option>
                                <option value="on_break">On Break</option>
                                <option value="focus_mode">Focus Mode</option>
                                <option value="end_of_shift">End of Shift</option>
                            </select>
                        </div>

                        {/* Specialization Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                            <select
                                value={filters.specialization}
                                onChange={(e) => handleFilterChange('specialization', e.target.value)}
                                className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
                            >
                                <option value="">All Specializations</option>
                                {specializationOptions.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                        </div>

                        {/* Department Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <select
                                value={filters.department}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                                className="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 py-2 px-3"
                            >
                                <option value="">All Departments</option>
                                {departmentOptions.map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Results Summary */}
            {!loading && !error && (
                <div className="mb-4 text-sm text-gray-600 px-2">
                    Showing {allTechnicians.length} of {techniciansTotalCount} technicians
                    {hasActiveFilters && (
                        <span className="ml-2 text-indigo-600">
                            (filtered)
                        </span>
                    )}
                </div>
            )}

            {loading && <p className="text-center text-gray-500 py-8">Loading technicians...</p>}
            {error && <p className="text-center text-red-500 py-8">Error loading technicians: {error}</p>}
            {!loading && !error && allTechnicians.length === 0 ? (
                <p className="px-6 py-8 text-center text-gray-500">
                    {hasActiveFilters ? 'No technicians match your filters.' : 'No technicians found.'}
                </p>
            ) : (
                <>
                    <TechniciansTable technicians={allTechnicians} getTechnicianAvailabilityColor={getTechnicianAvailabilityColor} />
                    <Pagination
                        currentPage={techniciansCurrentPage}
                        totalCount={techniciansTotalCount}
                        limit={techniciansLimit}
                        onPageChange={handleTechniciansPageChange}
                    />
                </>
            )}
        </div>
    );
};
