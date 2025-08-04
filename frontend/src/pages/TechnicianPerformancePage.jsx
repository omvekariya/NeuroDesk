import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    TrendingUp,
    X,
    Star,
    Clock,
    Activity,
    Calendar,
    CheckCircle,
    User,
    Download,
    BarChart3,
    Eye
} from 'lucide-react';
import Button from '../components/Button';

export const TechnicianPerformancePage = () => {
    const { id } = useParams();
    const [technician, setTechnician] = useState(null);

    // Mock data based on the Sequelize schema
    const mockTechnician = {
        id: 1,
        name: "Sarah Johnson",
        user_id: 101,
        assigned_tickets_total: 8,
        assigned_tickets: [1, 2, 3, 4, 5, 6, 7, 8],
        skills: [
            { id: 1, percentage: 95, name: "Network Troubleshooting" },
            { id: 2, percentage: 88, name: "Hardware Repair" },
            { id: 3, percentage: 92, name: "Software Installation" },
            { id: 4, percentage: 85, name: "System Administration" },
            { id: 5, percentage: 78, name: "Cloud Services" },
            { id: 6, percentage: 90, name: "Security Protocols" },
            { id: 7, percentage: 82, name: "Database Management" }
        ],
        workload: 75,
        availability_status: "available",
        skill_level: "senior",
        specialization: "Network Infrastructure & Security",
        is_active: true,
        created_at: "2024-01-15T10:00:00Z",
        updated_at: "2024-01-20T14:30:00Z"
    };

    useEffect(() => {
        // In a real app, you would fetch the technician data by ID
        setTechnician(mockTechnician);
    }, [id]);

    const getStatusColor = (status) => {
        const colors = {
            available: 'bg-green-100 text-green-800',
            busy: 'bg-yellow-100 text-yellow-800',
            in_meeting: 'bg-blue-100 text-blue-800',
            on_break: 'bg-orange-100 text-orange-800',
            end_of_shift: 'bg-gray-100 text-gray-800',
            focus_mode: 'bg-purple-100 text-purple-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getWorkloadColor = (workload) => {
        if (workload >= 80) return 'text-red-600';
        if (workload >= 60) return 'text-yellow-600';
        return 'text-green-600';
    };

    const getWorkloadBarColor = (workload) => {
        if (workload >= 80) return 'bg-red-500';
        if (workload >= 60) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const handleExportReport = () => {
        // Create a comprehensive report for export
        const reportData = {
            technician: {
                name: technician.name,
                id: technician.id,
                user_id: technician.user_id,
                specialization: technician.specialization,
                skill_level: technician.skill_level,
                availability_status: technician.availability_status,
                workload: technician.workload,
                assigned_tickets_total: technician.assigned_tickets_total,
                active_tickets: technician.assigned_tickets.length,
                skills: technician.skills,
                created_at: technician.created_at,
                updated_at: technician.updated_at
            },
            metrics: {
                averageSkillLevel: (technician.skills.reduce((sum, skill) => sum + skill.percentage, 0) / technician.skills.length).toFixed(1),
                highLevelSkills: technician.skills.filter(skill => skill.percentage >= 80).length,
                workloadStatus: technician.workload >= 80 ? 'High' : technician.workload >= 60 ? 'Moderate' : 'Optimal'
            }
        };

        // Create downloadable JSON file
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${technician.name.replace(/\s+/g, '_')}_performance_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log('Performance report exported:', reportData);
    };

    if (!technician) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading performance data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between py-6">
                        <div className="flex items-center gap-6">
                            <Link
                                to={`/technician/${id}`}
                                className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                            >
                                <ArrowLeft size={18} />
                                Back to Profile
                            </Link>
                            <div className="h-6 w-px bg-gray-300"></div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <TrendingUp size={20} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">Performance Dashboard</h1>
                                    <p className="text-gray-600">{technician.name}</p>
                                </div>
                            </div>
                        </div>
                        <Button
                            onClick={handleExportReport}
                            className="bg-blue-500 text-white border-0 hover:bg-blue-600 transition-colors duration-200 flex items-center gap-2 px-4 py-2 rounded-lg"
                        >
                            <Download size={16} />
                            Export Report
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                                    <Activity size={20} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{technician.workload}%</div>
                                    <div className="text-sm text-gray-600">Workload</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                                    <Clock size={20} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{technician.assigned_tickets_total}</div>
                                    <div className="text-sm text-gray-600">Total Tickets</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                                    <Star size={20} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">{technician.skills.length}</div>
                                    <div className="text-sm text-gray-600">Skills</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                    <CheckCircle size={20} className="text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900 capitalize">{technician.skill_level}</div>
                                    <div className="text-sm text-gray-600">Level</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Skills Performance */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                        <Star size={16} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Skills Performance
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-4">Top Skills</h4>
                                        <div className="space-y-3">
                                            {technician.skills
                                                .sort((a, b) => b.percentage - a.percentage)
                                                .slice(0, 3)
                                                .map((skill, index) => (
                                                    <div key={skill.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="font-medium text-gray-900">{skill.name}</span>
                                                            <span className="text-lg font-bold text-blue-600">{skill.percentage}%</span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                            <div
                                                                className="bg-blue-500 h-2 rounded-full"
                                                                style={{ width: `${skill.percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-700 mb-4">Summary</h4>
                                        <div className="space-y-4">
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {(technician.skills.reduce((sum, skill) => sum + skill.percentage, 0) / technician.skills.length).toFixed(1)}%
                                                    </div>
                                                    <div className="text-sm text-gray-600">Average Skill Level</div>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="text-center">
                                                    <div className="text-2xl font-bold text-gray-900">
                                                        {technician.skills.filter(skill => skill.percentage >= 80).length}
                                                    </div>
                                                    <div className="text-sm text-gray-600">High-Level Skills (80%+)</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Workload Analysis */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                        <Activity size={16} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        Workload
                                    </h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="font-semibold text-gray-700">Current Workload</span>
                                            <span className={`text-lg font-bold ${getWorkloadColor(technician.workload)}`}>
                                                {technician.workload}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${getWorkloadBarColor(technician.workload)}`}
                                                style={{ width: `${technician.workload}%` }}
                                            ></div>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-600">
                                            {technician.workload >= 80 ? 'High workload' :
                                                technician.workload >= 60 ? 'Moderate workload' :
                                                    'Optimal workload'}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Active Tickets</span>
                                                <span className="font-semibold text-gray-900">{technician.assigned_tickets.length}</span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Availability</span>
                                                <span className={`font-semibold ${getStatusColor(technician.availability_status)}`}>
                                                    {technician.availability_status.replace('_', ' ')}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Specialization</span>
                                                <span className="font-semibold text-gray-900">{technician.specialization}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <CheckCircle size={16} className="text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">
                                Recommendations
                            </h3>
                        </div>
                        <div className="space-y-3">
                            {technician.workload >= 80 && (
                                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 flex items-start gap-3">
                                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs">⚠️</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">High Workload</div>
                                        <div className="text-sm text-gray-600">Consider redistributing some tickets.</div>
                                    </div>
                                </div>
                            )}
                            {(technician.skills.reduce((sum, skill) => sum + skill.percentage, 0) / technician.skills.length) < 70 && (
                                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 flex items-start gap-3">
                                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <span className="text-white text-xs">📚</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900">Skill Development</div>
                                        <div className="text-sm text-gray-600">Focus on skill development.</div>
                                    </div>
                                </div>
                            )}
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200 flex items-start gap-3">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <span className="text-white text-xs">✅</span>
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">Performance Summary</div>
                                    <div className="text-sm text-gray-600">
                                        {technician.name} is performing well with {technician.skills.length} skills.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </div>
    );
}; 
