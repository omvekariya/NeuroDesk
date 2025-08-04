import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, ComposedChart, ScatterChart, Scatter, ZAxis,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
    Treemap
} from 'recharts';
import {
    RefreshCw, Settings, Filter, Calendar, Clock, Users,
    TrendingUp, AlertTriangle, CheckCircle, Activity,
    Eye, EyeOff, RotateCcw, Download, Share2
} from 'lucide-react';
import ticketsApi from '../../api/tickets';
import techniciansApi from '../../api/technician';
import { TicketsTable } from './TicketsTable'; // Import reusable table component

// Helper functions (could be moved to a utilities file if shared across many components)
//
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


export const OverviewTab = ({ loading, setLoading, error, setError, overviewStats, setOverviewStats, recentTickets, setRecentTickets }) => {
    const [chartData, setChartData] = useState({
        ticketTrends: [],
        statusDistribution: [],
        priorityDistribution: [],
        technicianWorkload: [],
        skillLevelDistribution: [],
        availabilityDistribution: [],
        topPerformerRadar: [],
        workloadDistribution: [],
        realTimeStatusFlow: []
    });

    // Real-time data configuration
    const [config, setConfig] = useState({
        autoRefresh: true,
        refreshInterval: 30000, // 30 seconds
        showRealTimeIndicators: true,
        chartAnimations: true,
        dataTimeRange: '7d', // 7 days, 24h, 30d
        technicianFilter: 'all', // all, available, busy, offline
        priorityFilter: 'all', // all, critical, high, normal, low
        statusFilter: 'all' // all, open, resolved, closed
    });

    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showConfig, setShowConfig] = useState(false);

    const fetchOverviewData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const allTicketsResponse = await ticketsApi.getAllTicketsSimple();
            const totalTicketsCount = allTicketsResponse.data?.total || allTicketsResponse.total || allTicketsResponse.data?.length || 0;

            let openTicketsCount = 0;
            const openStatuses = ['new', 'assigned', 'in_progress', 'on_hold'];
            for (const status of openStatuses) {
                const response = await ticketsApi.getAllTickets({ status: status });
                openTicketsCount += response.data?.total || response.total || response.data?.tickets?.length || 0;
            }

            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const endOfToday = new Date();
            endOfToday.setHours(23, 59, 59, 999);

            let resolvedTodayCount = 0;
            const resolvedStatuses = ['resolved', 'closed'];
            for (const status of resolvedStatuses) {
                const response = await ticketsApi.getAllTickets({
                    status: status,
                    resolved_at_gte: today.toISOString(),
                    resolved_at_lte: endOfToday.toISOString(),
                });
                resolvedTodayCount += response.data?.total || response.total || response.data?.tickets?.length || 0;
            }

            const allTechniciansOverviewResponse = await techniciansApi.getAllTechniciansSimple();
            const totalTechniciansCountOverview = allTechniciansOverviewResponse.data?.pagination?.total || allTechniciansOverviewResponse.data?.total || allTechniciansOverviewResponse.total || 0;

            const availableTechniciansResponse = await techniciansApi.getAllTechniciansSimple();
            const availableTechsArray = availableTechniciansResponse.data?.technicians || availableTechniciansResponse.data || [];
            const availableTechsCount = availableTechsArray.filter(tech =>
                tech.status === 'online' || tech.availability_status === 'available'
            ).length;

            const recentTicketsResponse = await ticketsApi.getAllTickets({
                sort_by: 'created_at',
                sort_order: 'desc',
                limit: 4,
                include: 'requester,assigned_technician'
            });
            setRecentTickets(recentTicketsResponse.data?.tickets || recentTicketsResponse.data || []);

            // Calculate chart data based on database schema
            const allTickets = allTicketsResponse.data?.tickets || allTicketsResponse.data || [];
            const allTechnicians = availableTechniciansResponse.data?.technicians || availableTechniciansResponse.data || [];

            // Enhanced ticket trends with real-time data and proper tagging
            const ticketTrends = [];
            const timeRangeDays = config.dataTimeRange === '24h' ? 1 : config.dataTimeRange === '30d' ? 30 : 7;

            for (let i = timeRangeDays - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const dayTickets = allTickets.filter(ticket => {
                    const ticketDate = new Date(ticket.created_at);
                    return ticketDate.toDateString() === date.toDateString();
                });

                // Enhanced data with proper tagging
                const dayData = {
                    date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    fullDate: date.toISOString(),
                    tickets: dayTickets.length,
                    resolved: dayTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
                    critical: dayTickets.filter(t => t.priority === 'critical').length,
                    high: dayTickets.filter(t => t.priority === 'high').length,
                    normal: dayTickets.filter(t => t.priority === 'normal').length,
                    low: dayTickets.filter(t => t.priority === 'low').length,
                    avgResponseTime: dayTickets.length > 0 ?
                        dayTickets.reduce((sum, t) => sum + (t.response_time || 0), 0) / dayTickets.length : 0,
                    slaViolations: dayTickets.filter(t => t.sla_violated).length,
                    tags: {
                        'high-priority': dayTickets.filter(t => t.priority === 'critical' || t.priority === 'high').length,
                        'sla-violated': dayTickets.filter(t => t.sla_violated).length,
                        'urgent': dayTickets.filter(t => t.urgency === 'critical').length
                    }
                };
                ticketTrends.push(dayData);
            }

            // Enhanced status distribution with proper tagging and filtering
            const statusCounts = {};
            const filteredTickets = allTickets.filter(ticket => {
                if (config.statusFilter !== 'all') {
                    if (config.statusFilter === 'open') {
                        return ['new', 'assigned', 'in_progress', 'on_hold'].includes(ticket.status);
                    } else if (config.statusFilter === 'resolved') {
                        return ['resolved', 'closed'].includes(ticket.status);
                    }
                }
                return true;
            });

            filteredTickets.forEach(ticket => {
                statusCounts[ticket.status] = (statusCounts[ticket.status] || 0) + 1;
            });

            const statusDistribution = Object.entries(statusCounts).map(([status, count]) => {
                // Map status to proper display names
                const statusDisplayNames = {
                    'new': 'New',
                    'assigned': 'Assigned',
                    'in_progress': 'In Progress',
                    'on_hold': 'On Hold',
                    'resolved': 'Resolved',
                    'closed': 'Closed',
                    'cancelled': 'Cancelled'
                };

                // Map status to proper tags
                const statusTags = {
                    'new': 'pending',
                    'assigned': 'active',
                    'in_progress': 'active',
                    'on_hold': 'paused',
                    'resolved': 'completed',
                    'closed': 'completed',
                    'cancelled': 'cancelled'
                };

                // Map status to colors
                const statusColors = {
                    'new': '#0088FE',
                    'assigned': '#00C49F',
                    'in_progress': '#FFBB28',
                    'on_hold': '#FF8042',
                    'resolved': '#82CA9D',
                    'closed': '#8884D8',
                    'cancelled': '#FF6B6B'
                };

                return {
                    name: statusDisplayNames[status] || status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
                    value: count,
                    percentage: ((count / filteredTickets.length) * 100).toFixed(1),
                    tag: statusTags[status] || 'active',
                    color: statusColors[status] || '#8884D8',
                    status: status
                };
            });

            // Priority distribution
            const priorityCounts = {};
            allTickets.forEach(ticket => {
                priorityCounts[ticket.priority] = (priorityCounts[ticket.priority] || 0) + 1;
            });
            const priorityDistribution = Object.entries(priorityCounts).map(([priority, count]) => ({
                priority: priority.charAt(0).toUpperCase() + priority.slice(1),
                count
            }));

            // Enhanced technician workload with configuration and filtering
            let filteredTechnicians = allTechnicians;

            // Apply technician filter
            if (config.technicianFilter !== 'all') {
                filteredTechnicians = allTechnicians.filter(tech => {
                    if (config.technicianFilter === 'available') {
                        return tech.availability_status === 'available';
                    } else if (config.technicianFilter === 'busy') {
                        return ['busy', 'in_meeting', 'focus_mode'].includes(tech.availability_status);
                    } else if (config.technicianFilter === 'offline') {
                        return ['end_of_shift', 'on_break'].includes(tech.availability_status);
                    }
                    return true;
                });
            }

            const technicianWorkload = filteredTechnicians.map(tech => {
                const performance = (tech.tickets_solved || 0) * (tech.avg_rating || 1);
                const workloadStatus = tech.workload >= 80 ? 'overloaded' :
                    tech.workload >= 60 ? 'moderate' : 'optimal';

                return {
                    id: tech.id,
                    name: tech.name || tech.username,
                    workload: tech.workload || 0,
                    assignedTickets: tech.assigned_tickets_total || 0,
                    resolvedTickets: tech.tickets_solved || 0,
                    avgRating: tech.avg_rating || 0,
                    availability: tech.availability_status,
                    skillLevel: tech.skill_level,
                    performance: performance,
                    workloadStatus: workloadStatus,
                    tags: {
                        'high-performer': performance > 50 ? 'high-performer' : '',
                        'overloaded': workloadStatus === 'overloaded' ? 'overloaded' : '',
                        'available': tech.availability_status === 'available' ? 'available' : '',
                        'senior': tech.skill_level === 'senior' || tech.skill_level === 'expert' ? 'senior' : ''
                    },
                    lastActive: tech.updated_at,
                    specialization: tech.specialization
                };
            }).sort((a, b) => b.performance - a.performance);

            // Enhanced skill level distribution with proper tagging and real-time data
            const skillLevelCounts = {};
            allTechnicians.forEach(tech => {
                skillLevelCounts[tech.skill_level] = (skillLevelCounts[tech.skill_level] || 0) + 1;
            });

            // Map skill levels to proper display names and tags
            const skillLevelMapping = {
                'junior': {
                    name: 'Junior',
                    tag: 'entry-level',
                    color: '#FF6B6B',
                    description: 'Entry level technicians'
                },
                'mid': {
                    name: 'Mid-Level',
                    tag: 'intermediate',
                    color: '#FFBB28',
                    description: 'Intermediate technicians'
                },
                'senior': {
                    name: 'Senior',
                    tag: 'experienced',
                    color: '#00C49F',
                    description: 'Experienced technicians'
                },
                'expert': {
                    name: 'Expert',
                    tag: 'specialist',
                    color: '#0088FE',
                    description: 'Specialist technicians'
                }
            };

            const skillLevelDistribution = Object.entries(skillLevelCounts).map(([level, count]) => {
                const mapping = skillLevelMapping[level] || {
                    name: level.charAt(0).toUpperCase() + level.slice(1),
                    tag: 'other',
                    color: '#8884D8',
                    description: 'Other skill level'
                };

                // Calculate real-time metrics for this skill level
                const techniciansInLevel = allTechnicians.filter(tech => tech.skill_level === level);
                const avgWorkload = techniciansInLevel.length > 0 ?
                    techniciansInLevel.reduce((sum, tech) => sum + (tech.workload || 0), 0) / techniciansInLevel.length : 0;
                const totalTicketsResolved = techniciansInLevel.reduce((sum, tech) => sum + (tech.resolvedTickets || 0), 0);
                const avgRating = techniciansInLevel.length > 0 ?
                    techniciansInLevel.reduce((sum, tech) => sum + (tech.avgRating || 0), 0) / techniciansInLevel.length : 0;
                const availableCount = techniciansInLevel.filter(tech => tech.availability === 'available').length;

                return {
                    name: mapping.name,
                    value: count,
                    percentage: ((count / allTechnicians.length) * 100).toFixed(1),
                    tag: mapping.tag,
                    color: mapping.color,
                    description: mapping.description,
                    skillLevel: level,
                    // Real-time metrics
                    avgWorkload: avgWorkload.toFixed(1),
                    totalTicketsResolved: totalTicketsResolved,
                    avgRating: avgRating.toFixed(1),
                    availableCount: availableCount,
                    totalTechnicians: allTechnicians.length,
                    technicians: techniciansInLevel.map(tech => ({
                        name: tech.name,
                        workload: tech.workload || 0,
                        resolvedTickets: tech.resolvedTickets || 0,
                        avgRating: tech.avgRating || 0,
                        availability: tech.availability,
                        performance: tech.performance || 0
                    }))
                };
            }).sort((a, b) => {
                // Sort by skill level hierarchy
                const levelOrder = { 'junior': 1, 'mid': 2, 'senior': 3, 'expert': 4 };
                return (levelOrder[a.skillLevel] || 5) - (levelOrder[b.skillLevel] || 5);
            });

            // Availability distribution
            const availabilityCounts = {};
            allTechnicians.forEach(tech => {
                availabilityCounts[tech.availability_status] = (availabilityCounts[tech.availability_status] || 0) + 1;
            });
            const availabilityDistribution = Object.entries(availabilityCounts).map(([status, count]) => ({
                status: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
                count
            }));

            // Generate radar chart data for top 5 performers
            const topPerformerRadar = generateTopPerformerRadarData(technicianWorkload);

            // Generate workload distribution data
            const workloadDistribution = generateWorkloadDistribution(technicianWorkload);

            // Generate real-time status flow data
            const realTimeStatusFlow = generateRealTimeStatusFlow(allTickets);

            setChartData({
                ticketTrends,
                statusDistribution,
                priorityDistribution,
                technicianWorkload,
                skillLevelDistribution,
                availabilityDistribution,
                topPerformerRadar,
                workloadDistribution,
                realTimeStatusFlow
            });

            setOverviewStats(prevStats => ({
                ...prevStats,
                totalTickets: totalTicketsCount,
                openTickets: openTicketsCount,
                resolvedToday: resolvedTodayCount,
                totalTechniciansOverview: totalTechniciansCountOverview,
                availableTechsOverview: availableTechsCount,
                avgResponseTime: 'N/A' // Still a placeholder
            }));

        } catch (err) {
            console.error("Failed to fetch overview data:", err.response?.data || err.message);
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, setOverviewStats, setRecentTickets]); // Dependencies for useCallback

    // Real-time auto-refresh functionality
    useEffect(() => {
        fetchOverviewData();
        setLastUpdated(new Date());
    }, [fetchOverviewData]);

    // Auto-refresh timer
    useEffect(() => {
        if (!config.autoRefresh) return;

        const interval = setInterval(() => {
            setIsRefreshing(true);
            fetchOverviewData().finally(() => {
                setIsRefreshing(false);
                setLastUpdated(new Date());
            });
        }, config.refreshInterval);

        return () => clearInterval(interval);
    }, [config.autoRefresh, config.refreshInterval, fetchOverviewData]);

    // Manual refresh function
    const handleManualRefresh = () => {
        setIsRefreshing(true);
        fetchOverviewData().finally(() => {
            setIsRefreshing(false);
            setLastUpdated(new Date());
        });
    };

    // Generate radar chart data for top 5 performers
    const generateTopPerformerRadarData = (technicians) => {
        const topPerformers = technicians
            .sort((a, b) => b.performance - a.performance)
            .slice(0, 5); // Top 5 performers

        const radarData = topPerformers.map((tech, index) => {
            // Calculate performance metrics (normalized to 0-100)
            const workloadScore = Math.min(tech.workload || 0, 100);
            const productivityScore = Math.min(((tech.resolvedTickets || 0) / Math.max(tech.assignedTickets || 1, 1)) * 100, 100);
            const qualityScore = Math.min(((tech.avgRating || 0) / 5) * 100, 100);
            const efficiencyScore = Math.min(((tech.performance || 0) / Math.max(...topPerformers.map(t => t.performance || 0))) * 100, 100);
            const availabilityScore = tech.availability === 'available' ? 100 :
                tech.availability === 'busy' ? 70 :
                    tech.availability === 'focus_mode' ? 60 : 30;
            const skillScore = tech.skillLevel === 'expert' ? 100 :
                tech.skillLevel === 'senior' ? 85 :
                    tech.skillLevel === 'mid' ? 70 : 50;

            // Generate performance tags
            const tags = [];
            if (workloadScore >= 80) tags.push('high-workload');
            if (productivityScore >= 80) tags.push('high-productivity');
            if (qualityScore >= 80) tags.push('high-quality');
            if (efficiencyScore >= 80) tags.push('high-efficiency');
            if (availabilityScore >= 80) tags.push('highly-available');
            if (skillScore >= 80) tags.push('expert-level');
            if (tech.tags?.highPerformer) tags.push('top-performer');
            if (tech.tags?.overloaded) tags.push('overloaded');
            if (tech.tags?.available) tags.push('available-now');

            return {
                technician: tech.name,
                workload: workloadScore,
                productivity: productivityScore,
                quality: qualityScore,
                efficiency: efficiencyScore,
                availability: availabilityScore,
                skillLevel: skillScore,
                fullMark: 100,
                rank: index + 1,
                performance: tech.performance || 0,
                resolvedTickets: tech.resolvedTickets || 0,
                avgRating: tech.avgRating || 0,
                availability: tech.availability,
                skillLevel: tech.skillLevel,
                tags: tags,
                color: ['#ff4444', '#ff8800', '#ffcc00', '#88cc00', '#44cc44'][index % 5]
            };
        });

        return radarData;
    };

    // Generate workload distribution data for treemap
    const generateWorkloadDistribution = (technicians) => {
        // Group technicians by workload categories
        const workloadCategories = {
            'Overloaded (80-100%)': { range: [80, 100], color: '#1e3a8a', technicians: [] }, // Deep Blue
            'High Load (60-80%)': { range: [60, 80], color: '#3b82f6', technicians: [] }, // Light Blue
            'Moderate (40-60%)': { range: [40, 60], color: '#0d9488', technicians: [] }, // Teal
            'Light Load (20-40%)': { range: [20, 40], color: '#059669', technicians: [] }, // Green
            'Available (0-20%)': { range: [0, 20], color: '#10b981', technicians: [] } // Light Green
        };

        technicians.forEach(tech => {
            const workload = tech.workload || 0;
            for (const [category, config] of Object.entries(workloadCategories)) {
                if (workload >= config.range[0] && workload <= config.range[1]) {
                    config.technicians.push({
                        name: tech.name,
                        workload: workload,
                        assignedTickets: tech.assignedTickets || 0,
                        resolvedTickets: tech.resolvedTickets || 0,
                        avgRating: tech.avgRating || 0,
                        availability: tech.availability,
                        skillLevel: tech.skillLevel,
                        performance: tech.performance || 0,
                        tags: tech.tags
                    });
                    break;
                }
            }
        });

        // Convert to treemap format
        const treemapData = Object.entries(workloadCategories).map(([category, config]) => ({
            name: category,
            size: config.technicians.length,
            color: config.color,
            technicians: config.technicians,
            totalWorkload: config.technicians.reduce((sum, tech) => sum + tech.workload, 0),
            avgWorkload: config.technicians.length > 0 ?
                config.technicians.reduce((sum, tech) => sum + tech.workload, 0) / config.technicians.length : 0
        })).filter(item => item.size > 0);

        return treemapData;
    };

    // Generate real-time status flow data for line chart
    const generateRealTimeStatusFlow = (tickets) => {
        const now = new Date();
        const dataPoints = [];
        
        // Generate data points for the last 24 hours, every 2 hours
        for (let i = 23; i >= 0; i -= 2) {
            const timePoint = new Date(now);
            timePoint.setHours(now.getHours() - i, 0, 0, 0);
            
            // Filter tickets for this time period
            const periodStart = new Date(timePoint);
            const periodEnd = new Date(timePoint);
            periodEnd.setHours(periodEnd.getHours() + 2);
            
            const periodTickets = tickets.filter(ticket => {
                const ticketTime = new Date(ticket.created_at || ticket.updated_at);
                return ticketTime >= periodStart && ticketTime < periodEnd;
            });
            
            // Count tickets by status for this period
            const openCount = periodTickets.filter(t => 
                ['new', 'assigned', 'on_hold'].includes(t.status)
            ).length;
            
            const inProgressCount = periodTickets.filter(t => 
                t.status === 'in_progress'
            ).length;
            
            const resolvedCount = periodTickets.filter(t => 
                t.status === 'resolved'
            ).length;
            
            const closedCount = periodTickets.filter(t => 
                t.status === 'closed'
            ).length;
            
            dataPoints.push({
                time: timePoint.toISOString(),
                open: openCount,
                inProgress: inProgressCount,
                resolved: resolvedCount,
                closed: closedCount
            });
        }
        
        return dataPoints;
    };


    return (
        <div className="space-y-6">
            {/* Real-time Header with Configuration */}
            <div className="bg-white shadow rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            {config.showRealTimeIndicators && (
                                <div className="flex items-center space-x-2">
                                    <div className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                    <span className="text-sm text-gray-600">
                                        {isRefreshing ? 'Live' : 'Real-time'}
                                    </span>
                                </div>
                            )}
                            <span className="text-sm text-gray-500">
                                Last updated: {lastUpdated.toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={handleManualRefresh}
                            disabled={isRefreshing}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Refresh data"
                        >
                            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => setShowConfig(!showConfig)}
                            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                            title="Configuration"
                        >
                            <Settings className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Configuration Panel */}
            {showConfig && (
                <div className="bg-white shadow rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Configuration</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Auto Refresh</label>
                            <select
                                value={config.refreshInterval}
                                onChange={(e) => setConfig(prev => ({ ...prev, refreshInterval: parseInt(e.target.value) }))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value={10000}>10 seconds</option>
                                <option value={30000}>30 seconds</option>
                                <option value={60000}>1 minute</option>
                                <option value={300000}>5 minutes</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
                            <select
                                value={config.dataTimeRange}
                                onChange={(e) => setConfig(prev => ({ ...prev, dataTimeRange: e.target.value }))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="24h">Last 24 Hours</option>
                                <option value="7d">Last 7 Days</option>
                                <option value="30d">Last 30 Days</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Technician Filter</label>
                            <select
                                value={config.technicianFilter}
                                onChange={(e) => setConfig(prev => ({ ...prev, technicianFilter: e.target.value }))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="all">All Technicians</option>
                                <option value="available">Available Only</option>
                                <option value="busy">Busy Only</option>
                                <option value="offline">Offline Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
                            <select
                                value={config.statusFilter}
                                onChange={(e) => setConfig(prev => ({ ...prev, statusFilter: e.target.value }))}
                                className="w-full border border-gray-300 rounded-md px-3 py-2"
                            >
                                <option value="all">All Statuses</option>
                                <option value="open">Open Only</option>
                                <option value="resolved">Resolved Only</option>
                            </select>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-4">
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={config.autoRefresh}
                                onChange={(e) => setConfig(prev => ({ ...prev, autoRefresh: e.target.checked }))}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Auto Refresh</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={config.showRealTimeIndicators}
                                onChange={(e) => setConfig(prev => ({ ...prev, showRealTimeIndicators: e.target.checked }))}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Show Real-time Indicators</span>
                        </label>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={config.chartAnimations}
                                onChange={(e) => setConfig(prev => ({ ...prev, chartAnimations: e.target.checked }))}
                                className="mr-2"
                            />
                            <span className="text-sm text-gray-700">Chart Animations</span>
                        </label>
                    </div>
                </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Tickets</dt>
                                    <dd className="text-lg font-medium text-gray-900">{overviewStats.totalTickets}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Open Tickets</dt>
                                    <dd className="text-lg font-medium text-gray-900">{overviewStats.openTickets}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Resolved Today</dt>
                                    <dd className="text-lg font-medium text-gray-900">{overviewStats.resolvedToday}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Response Time</dt>
                                    <dd className="text-lg font-medium text-gray-900">{overviewStats.avgResponseTime}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* KPI Visualizations */}
            <div className="space-y-6">
                {/* First Row - Ticket Trends and Status Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Enhanced Line Chart - Ticket Trends */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Ticket Trends ({config.dataTimeRange === '24h' ? 'Last 24 Hours' : config.dataTimeRange === '30d' ? 'Last 30 Days' : 'Last 7 Days'})</h3>
                            <div className="flex items-center space-x-2">
                                {config.showRealTimeIndicators && (
                                    <div className="flex items-center space-x-1">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-xs text-gray-500">Live</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <ComposedChart data={chartData.ticketTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                    <p className="font-semibold">{label}</p>
                                                    {payload.map((entry, index) => (
                                                        <p key={index} style={{ color: entry.color }}>
                                                            {entry.name}: {entry.value}
                                                        </p>
                                                    ))}
                                                    {payload[0]?.payload?.tags && (
                                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                                            <p className="text-xs text-gray-600">Tags:</p>
                                                            {Object.entries(payload[0].payload.tags).map(([tag, value]) => (
                                                                <span key={tag} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1">
                                                                    {tag}: {value}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <Area type="monotone" dataKey="tickets" fill="#8884d8" fillOpacity={0.3} stroke="#8884d8" strokeWidth={2} name="Total Tickets" />
                                <Line type="monotone" dataKey="resolved" stroke="#82ca9d" strokeWidth={2} name="Resolved" />
                                <Line type="monotone" dataKey="critical" stroke="#ff4444" strokeWidth={1} name="Critical" />
                                <Line type="monotone" dataKey="high" stroke="#ff8800" strokeWidth={1} name="High Priority" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Donut Chart - Status Distribution */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Status Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData.statusDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {chartData.statusDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                    <p className="font-semibold">{data.name}</p>
                                                    <p className="text-sm text-gray-600">Count: {data.value}</p>
                                                    <p className="text-sm text-gray-600">Percentage: {data.percentage}%</p>
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                            {data.tag}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Second Row - Priority Distribution and Technician Workload */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar Chart - Priority Distribution */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ticket Priority Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.priorityDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="priority" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Real-Time Ticket Status Flow */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Real-Time Ticket Status Flow</h3>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                    Live Status Transitions (Last 24 Hours)
                                </span>
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData.realTimeStatusFlow}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="time" 
                                    stroke="#666"
                                    fontSize={12}
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return date.toLocaleTimeString('en-US', { 
                                            hour: '2-digit', 
                                            minute: '2-digit',
                                            hour12: false 
                                        });
                                    }}
                                />
                                <YAxis stroke="#666" fontSize={12} />
                                <Tooltip
                                    content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            const time = new Date(label).toLocaleTimeString('en-US', {
                                                hour: '2-digit',
                                                minute: '2-digit',
                                                second: '2-digit',
                                                hour12: false
                                            });
                                            return (
                                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                    <p className="font-semibold text-gray-900 mb-2">{time}</p>
                                                    <div className="space-y-1">
                                                        {payload.map((entry, index) => (
                                                            <div key={index} className="flex items-center justify-between">
                                                                <div className="flex items-center space-x-2">
                                                                    <div 
                                                                        className="w-3 h-3 rounded-full" 
                                                                        style={{ backgroundColor: entry.color }}
                                                                    ></div>
                                                                    <span className="text-sm font-medium">{entry.name}</span>
                                                                </div>
                                                                <span className="text-sm font-semibold">{entry.value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="open" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                                    name="Open Tickets"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="inProgress" 
                                    stroke="#f59e0b" 
                                    strokeWidth={3}
                                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                                    name="In Progress"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="resolved" 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                                    name="Resolved"
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="closed" 
                                    stroke="#6b7280" 
                                    strokeWidth={3}
                                    dot={{ fill: '#6b7280', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#6b7280', strokeWidth: 2 }}
                                    name="Closed"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                                         </div>
                </div>

                {/* Third Row - Skill Level and Availability Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Enhanced Pie Chart - Skill Level Distribution */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Technician Skill Level Distribution</h3>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-500">
                                    Real-time skill metrics
                                </span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData.skillLevelDistribution}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {chartData.skillLevelDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.color }}></div>
                                                        <p className="font-semibold">{data.name}</p>
                                                    </div>
                                                    <div className="space-y-1 text-sm">
                                                        <p><span className="font-medium">Technicians:</span> {data.value}</p>
                                                        <p><span className="font-medium">Percentage:</span> {data.percentage}%</p>
                                                        <p><span className="font-medium">Avg Workload:</span> {data.avgWorkload}%</p>
                                                        <p><span className="font-medium">Tickets Resolved:</span> {data.totalTicketsResolved}</p>
                                                        <p><span className="font-medium">Avg Rating:</span> {data.avgRating}/5</p>
                                                        <p><span className="font-medium">Available:</span> {data.availableCount}</p>
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                            {data.tag}
                                                        </span>
                                                    </div>
                                                    {data.technicians && data.technicians.length > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-gray-200">
                                                            <p className="text-xs text-gray-600 mb-1">Technicians:</p>
                                                            <div className="max-h-20 overflow-y-auto">
                                                                {data.technicians.slice(0, 5).map((tech, index) => (
                                                                    <div key={index} className="text-xs mb-1">
                                                                        <span className="font-medium">{tech.name}</span>
                                                                        <span className="text-gray-500"> - {tech.workload}% • {tech.avgRating.toFixed(1)}★</span>
                                                                    </div>
                                                                ))}
                                                                {data.technicians.length > 5 && (
                                                                    <p className="text-xs text-gray-500">+{data.technicians.length - 5} more</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Bar Chart - Availability Distribution */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Technician Availability Status</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.availabilityDistribution}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="status" angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="count" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Technician Workload Distribution */}
            <div className="bg-white p-6 rounded-lg shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Technician Workload Distribution</h3>
                    <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                            Workload Categories & Capacity Planning
                        </span>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <Treemap
                        data={chartData.workloadDistribution}
                        dataKey="size"
                        aspectRatio={4 / 3}
                        stroke="#fff"
                        fill={(entry) => entry.color}
                    >
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                            <p className="font-semibold">{data.name}</p>
                                            <p className="text-sm text-gray-600">Technicians: {data.size}</p>
                                            <p className="text-sm text-gray-600">Avg Workload: {data.avgWorkload.toFixed(1)}%</p>

                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                    </Treemap>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                    {chartData.workloadDistribution.map((category, index) => (
                        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded border border-gray-200">
                            <div className="w-4 h-4 rounded" style={{ backgroundColor: category.color }}></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{category.name}</p>
                                <p className="text-xs text-gray-500">{category.size} technicians</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Tickets */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Tickets</h3>
                    {loading && <p className="text-center text-gray-500">Loading recent tickets...</p>}
                    {error && <p className="text-center text-red-500">Error loading recent tickets: {error}</p>}
                    {!loading && !error && recentTickets.length === 0 && (
                        <p className="text-center text-gray-500">No recent tickets found.</p>
                    )}
                    {!loading && !error && recentTickets.length > 0 && (
                        <TicketsTable tickets={recentTickets} getPriorityColor={getPriorityColor} getStatusColor={getStatusColor} />
                    )}
                </div>
            </div>
        </div>
    );
};
