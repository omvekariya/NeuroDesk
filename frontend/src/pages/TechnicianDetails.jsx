import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Edit,
    Save,
    X,
    Star,
    Clock,
    Activity,
    Calendar,
    CheckCircle,
    User,
    TrendingUp,
    Briefcase,
    Award,
    Mail,
    Phone
} from 'lucide-react';
import logo from "../assets/logosaas.png";

// Import API services
import techniciansApi from '../api/technician';
import ticketsApi from '../api/tickets';
import skillsApi from '../api/skills';
import usersApi from '../api/users';

export const TechnicianProfilePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [technician, setTechnician] = useState(null);
    const [user, setUser] = useState(null);
    const [assignedTickets, setAssignedTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({}); // For technician editable fields
    const [userFormData, setUserFormData] = useState({}); // For associated user editable fields
    const [updateMessage, setUpdateMessage] = useState(null);

    useEffect(() => {
        const fetchTechnicianData = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch Technician details
                const techResponse = await techniciansApi.getTechnicianById(id);
                let techData = techResponse.data || techResponse; // Use 'let' to allow modification

                // Fetch Associated User details (if user_id exists)
                if (techData.user_id) {
                    try {
                        const userResponse = await usersApi.getUserById(techData.user_id);
                        const userData = userResponse.data || userResponse;
                        setUser(userData);
                        setUserFormData(userData);
                    } catch (userErr) {
                        console.warn("Could not fetch associated user for technician:", userErr);
                    }
                }

                // --- OPTIMIZATION FOR SKILLS: Fetch skill names ---
                if (techData.skills && techData.skills.length > 0) {
                    const fetchedSkills = await Promise.all(
                        techData.skills.map(async (skillIdAndPercentage) => {
                            try {
                                const skillResponse = await skillsApi.getSkillById(skillIdAndPercentage.id);
                                const skillDetails = skillResponse.data || skillResponse;
                                return {
                                    id: skillDetails.id,
                                    name: skillDetails.name, // The skill name is now fetched
                                    percentage: skillIdAndPercentage.percentage
                                };
                            } catch (skillErr) {
                                console.warn(`Failed to fetch skill ${skillIdAndPercentage.id}:`, skillErr);
                                return {
                                    id: skillIdAndPercentage.id,
                                    name: `Skill ID ${skillIdAndPercentage.id} (Name N/A)`, // Fallback name
                                    percentage: skillIdAndPercentage.percentage
                                };
                            }
                        })
                    );
                    // Update techData directly with full skill details
                    techData = { ...techData, skills: fetchedSkills };
                }

                // --- OPTIMIZATION FOR ASSIGNED TICKETS ---
                // Fetch Assigned Tickets for this technician, directly including requester and assigned_technician
                const ticketsResponse = await ticketsApi.getTicketsByTechnicianId(id, {
                    include: 'requester,assigned_technician' // Assuming backend supports including these relations
                });
                setAssignedTickets(ticketsResponse.data?.tickets || ticketsResponse.data || []);

                // Set final technician data and form data once
                setTechnician(techData);
                setFormData(techData);

            } catch (err) {
                console.error("Failed to fetch technician or related data:", err);
                setError(err.message || 'Error fetching technician details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTechnicianData();
        }
    }, [id]);

    const handleTechnicianChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleUserChange = (e) => {
        const { name, value } = e.target;
        // FIX: Ensure userFormData is updated, not formData
        setUserFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setLoading(true);
        setUpdateMessage(null);
        try {
            const technicianUpdatePayload = {
                specialization: formData.specialization,
                availability_status: formData.availability_status,
                skill_level: formData.skill_level,
                is_active: formData.is_active,
            };
            const updatedTechResponse = await techniciansApi.updateTechnician(id, technicianUpdatePayload);
            setTechnician(updatedTechResponse.data || updatedTechResponse);
            setFormData(updatedTechResponse.data || updatedTechResponse);

            if (user && user.id) {
                const userUpdatePayload = {
                    name: userFormData.name,
                    email: userFormData.email,
                    contact_no: userFormData.contact_no,
                };
                const updatedUserResponse = await usersApi.updateUser(user.id, userUpdatePayload);
                setUser(updatedUserResponse.data || updatedUserResponse);
                setUserFormData(updatedUserResponse.data || updatedUserResponse);
            }

            setUpdateMessage('Technician profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to update technician:", err);
            setError(err.message || 'Error updating technician profile.');
            setUpdateMessage('Failed to update technician profile.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (technician) setFormData(technician);
        if (user) setUserFormData(user);
        setIsEditing(false);
        setError(null);
        setUpdateMessage(null);
    };

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

    const getTechnicianAvailabilityColor = (availabilityStatus) => {
        const colors = {
            available: 'bg-green-100 text-green-600',
            busy: 'bg-red-100 text-red-600',
            in_meeting: 'bg-blue-100 text-blue-600',
            on_break: 'bg-yellow-100 text-yellow-600',
            end_of_shift: 'bg-gray-100 text-gray-600',
            focus_mode: 'bg-purple-100 text-purple-600'
        };
        return colors[availabilityStatus] || 'bg-gray-100 text-gray-600';
    };

    const getSkillLevelColor = (level) => {
        const colors = {
            junior: 'bg-blue-100 text-blue-800',
            mid: 'bg-green-100 text-green-800',
            senior: 'bg-purple-100 text-purple-800',
            expert: 'bg-orange-100 text-orange-800'
        };
        return colors[level] || 'bg-gray-100 text-gray-800';
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

    const handleViewPerformance = () => {
        navigate(`/technicians/${id}/performance`);
    };

    const handleExportReport = () => {
        const reportData = {
            technician: {
                id: technician?.id,
                name: user?.name || technician?.name,
                user_id: technician?.user_id,
                specialization: technician?.specialization,
                skill_level: technician?.skill_level,
                availability_status: technician?.availability_status,
                workload: technician?.workload,
                assigned_tickets_total: technician?.assigned_tickets_total,
                active_tickets: assignedTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed' && t.status !== 'cancelled').length,
                skills: technician?.skills,
                created_at: technician?.created_at,
                updated_at: technician?.updated_at,
                user_email: user?.email,
                user_contact_no: user?.contact_no
            },
            metrics: {
                averageSkillLevel: technician?.skills?.length ? (technician.skills.reduce((sum, skill) => sum + skill.percentage, 0) / technician.skills.length).toFixed(1) : 'N/A',
                highLevelSkills: technician?.skills?.filter(skill => skill.percentage >= 80).length || 0,
                workloadStatus: technician?.workload >= 80 ? 'High' : technician?.workload >= 60 ? 'Moderate' : 'Optimal'
            }
        };

        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${(user?.name || technician?.name || 'Technician').replace(/\s+/g, '_')}_performance_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return (
            <div className="antialiased bg-gray-100 min-h-screen flex flex-col">
                <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center">
                                <img src={logo} alt="Logo" className="h-9 w-9 mr-3" />
                                <h1 className="text-xl font-semibold text-gray-900">Technician Profile</h1>
                            </div>
                            <button className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md animate-pulse">Loading...</button>
                        </div>
                    </div>
                </header>
                <main className="flex-grow max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 w-full">
                    <div className="bg-white shadow rounded-lg p-8 text-center min-h-[200px] flex items-center justify-center">
                        <p className="text-lg text-gray-700">Loading technician details...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error && !technician) {
        return (
            <div className="antialiased bg-gray-100 min-h-screen flex flex-col">
                <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center">
                                <img src={logo} alt="Logo" className="h-9 w-9 mr-3" />
                                <h1 className="text-xl font-semibold text-gray-900">Technician Profile</h1>
                            </div>
                            <button
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </header>
                <main className="flex-grow max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 w-full">
                    <div className="bg-white shadow rounded-lg p-8 text-center min-h-[200px] flex items-center justify-center">
                        <p className="text-red-500 text-lg">Error: {error}</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!technician) {
        return (
            <div className="antialiased bg-gray-100 min-h-screen flex flex-col">
                <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center">
                                <img src={logo} alt="Logo" className="h-9 w-9 mr-3" />
                                <h1 className="text-xl font-semibold text-gray-900">Technician Profile</h1>
                            </div>
                            <button
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200"
                            >
                                Back
                            </button>
                        </div>
                    </div>
                </header>
                <main className="flex-grow max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 w-full">
                    <div className="bg-white shadow rounded-lg p-8 text-center min-h-[200px] flex items-center justify-center">
                        <p className="text-gray-700 text-lg">Technician not found.</p>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="antialiased bg-gray-100 min-h-screen flex flex-col">
            <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <img src={logo} alt="Logo" className="h-9 w-9 mr-3" />
                            <h1 className="text-xl font-semibold text-gray-900">Technician Management</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors duration-200"
                            >
                                <span className="flex items-center">
                                    <ArrowLeft size={16} className="mr-1.5" />
                                    Back to Technicians
                                </span>
                            </button>
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">JD</span>
                                </div>
                                <span className="text-sm font-medium text-gray-700">John Doe</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-grow max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 w-full">
                <div className="bg-white shadow-xl rounded-lg p-10 transform transition-all duration-300 hover:scale-[1.005]">
                    <div className="flex justify-between items-center mb-8 border-b pb-6">
                        <h2 className="text-3xl font-extrabold text-gray-900">Technician Profile</h2>
                        <div>
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleSave}
                                        className="px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200 mr-3"
                                    >
                                        <span className="flex items-center"><Save size={16} className="mr-2" />Save Changes</span>
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-5 py-2.5 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                                    >
                                        <span className="flex items-center"><X size={16} className="mr-2" />Cancel</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-5 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                                >
                                    <span className="flex items-center"><Edit size={16} className="mr-2" />Edit Profile</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {updateMessage && (
                        <div className={`p-4 mb-6 rounded-md text-base ${updateMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {updateMessage}
                        </div>
                    )}
                    {error && <div className="p-4 mb-6 rounded-md text-base bg-red-100 text-red-800">Error: {error}</div>}

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Profile Info */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Profile Card */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                                <div className="flex items-start gap-8">
                                    <div className="relative">
                                        <div className="size-32 ring-4 ring-white/50 shadow-2xl rounded-full overflow-hidden flex items-center justify-center">
                                            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl">
                                                {(user?.name || technician?.name)?.split(' ').map(n => n[0]).join('')}
                                            </div>
                                        </div>
                                        <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white ${technician?.availability_status === 'available' ? 'bg-green-500' :
                                            technician?.availability_status === 'busy' || technician?.availability_status === 'in_meeting' ? 'bg-red-500' :
                                                technician?.availability_status === 'on_break' || technician?.availability_status === 'focus_mode' || technician?.availability_status === 'end_of_shift' ? 'bg-yellow-500' :
                                                    'bg-gray-500'
                                            }`}></div>
                                    </div>
                                    <div className="flex-1">
                                        {isEditing ? (
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                    <input
                                                        type="text"
                                                        name="name"
                                                        value={userFormData.name || ''}
                                                        onChange={handleUserChange}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        value={userFormData.email || ''}
                                                        onChange={handleUserChange}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact No.</label>
                                                    <input
                                                        type="text"
                                                        name="contact_no"
                                                        value={userFormData.contact_no || ''}
                                                        onChange={handleUserChange}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                                                    <input
                                                        type="text"
                                                        name="specialization"
                                                        value={formData.specialization || ''}
                                                        onChange={handleTechnicianChange}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Availability Status</label>
                                                    <select
                                                        name="availability_status"
                                                        value={formData.availability_status || ''}
                                                        onChange={handleTechnicianChange}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="available">Available</option>
                                                        <option value="busy">Busy</option>
                                                        <option value="in_meeting">In Meeting</option>
                                                        <option value="on_break">On Break</option>
                                                        <option value="end_of_shift">End of Shift</option>
                                                        <option value="focus_mode">Focus Mode</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Skill Level</label>
                                                    <select
                                                        name="skill_level"
                                                        value={formData.skill_level || ''}
                                                        onChange={handleTechnicianChange}
                                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                                                    >
                                                        <option value="junior">Junior</option>
                                                        <option value="mid">Mid</option>
                                                        <option value="senior">Senior</option>
                                                        <option value="expert">Expert</option>
                                                    </select>
                                                </div>
                                                <div className="flex items-center">
                                                    <input
                                                        type="checkbox"
                                                        name="is_active"
                                                        checked={formData.is_active || false}
                                                        onChange={(e) => handleTechnicianChange({ target: { name: 'is_active', value: e.target.checked } })}
                                                        className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                    />
                                                    <label htmlFor="is_active" className="ml-2 block text-sm font-medium text-gray-700">Is Active</label>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                                                    {user?.name || technician.name}
                                                </h2>
                                                <p className="text-lg text-gray-600 font-medium mb-4">{technician.specialization}</p>

                                                <div className="flex items-center gap-3 flex-wrap mb-4">
                                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md ${getTechnicianAvailabilityColor(technician.availability_status)}`}>
                                                        {technician.availability_status?.replace('_', ' ')}
                                                    </span>
                                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md ${getSkillLevelColor(technician.skill_level)}`}>
                                                        {technician.skill_level}
                                                    </span>
                                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold shadow-md ${technician.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                        {technician.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base">
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={16} className="text-gray-500" />
                                                        <span className="text-gray-700">{user?.email || 'N/A'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Phone size={16} className="text-gray-500" />
                                                        <span className="text-gray-700">{user?.contact_no || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                            <Star size={16} className="text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                            Skills & Expertise
                                        </h3>
                                    </div>
                                    <button
                                        onClick={handleExportReport}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg transition-all duration-300"
                                    >
                                        <TrendingUp size={18} />
                                        Export Report
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {technician.skills && technician.skills.length > 0 ? (
                                        technician.skills.map((skill) => (
                                            <div key={skill.id} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-lg transition-all duration-200 group">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors duration-200">{skill.name}</span>
                                                    <span className="text-lg font-bold text-blue-600">{skill.percentage}%</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mb-2">
                                                    <div
                                                        className="h-2.5 rounded-full bg-blue-500 transition-all duration-700 ease-out"
                                                        style={{ width: `${skill.percentage}%` }}
                                                    ></div>
                                                </div>
                                                <div className="text-xs text-gray-500 font-medium">
                                                    {skill.percentage >= 90 ? 'Expert Level' :
                                                        skill.percentage >= 80 ? 'Advanced Level' :
                                                            skill.percentage >= 70 ? 'Intermediate Level' : 'Beginner Level'}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 col-span-full text-center py-4">No skills listed for this technician.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Stats & Actions */}
                        <div className="space-y-6">
                            {/* Current Stats */}
                            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                                        <Activity size={16} className="text-white" />
                                    </div>
                                    <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                        Current Stats
                                    </h3>
                                </div>
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-semibold text-gray-700">Workload</span>
                                            <span className={`text-lg font-bold ${getWorkloadColor(technician.workload)}`}>
                                                {technician.workload}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-500 ease-out ${getWorkloadBarColor(technician.workload)}`}
                                                style={{ width: `${technician.workload}%` }}
                                            ></div>
                                        </div>
                                        <div className="mt-2 text-xs text-gray-500">
                                            {technician.workload >= 80 ? 'High workload - Consider redistributing' :
                                                technician.workload >= 60 ? 'Moderate workload' : 'Optimal workload'}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-white rounded-xl p-4 border border-blue-100 text-center">
                                            <div className="text-2xl font-bold text-blue-600">{technician.tickets.length || 0}</div>
                                            <div className="text-sm text-gray-600">Assigned Tickets</div>
                                        </div>
                                        <div className="bg-white rounded-xl p-4 border border-green-100 text-center">
                                            <div className="text-2xl font-bold text-green-600">{technician.skills?.length || 0}</div>
                                            <div className="text-sm text-gray-600">Skills Listed</div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl p-4 border border-purple-100">
                                        <div className="flex items-center gap-3">
                                            <Calendar size={16} className="text-purple-600" />
                                            <div>
                                                <div className="text-sm font-semibold text-gray-700">Member Since</div>
                                                <div className="font-medium text-gray-900">
                                                    {new Date(technician.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <Clock size={16} className="text-gray-500" />
                                            <div>
                                                <div className="text-sm font-semibold text-gray-700">Last Updated</div>
                                                <div className="font-medium text-gray-900">
                                                    {new Date(technician.updated_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-xl p-4 border border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <Award size={16} className="text-orange-600" />
                                            <div>
                                                <div className="text-sm font-semibold text-gray-700">Experience Level</div>
                                                <div className="font-medium text-gray-900">
                                                    {technician.skill_level === 'senior' ? 'Senior (8+ years)' :
                                                        technician.skill_level === 'expert' ? 'Expert (10+ years)' :
                                                            technician.skill_level === 'mid' ? 'Mid-Level (4-7 years)' :
                                                                technician.skill_level === 'junior' ? 'Junior (1-3 years)' : 'Not specified'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assigned Tickets Section - Full Width */}
                    <div className="mt-8">
                        <div className="bg-white shadow-xl rounded-2xl p-10 border border-gray-100 transform transition-all duration-300 hover:scale-[1.005]">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <Clock size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                            Assigned Tickets
                                        </h3>
                                        <p className="text-gray-600 font-medium">Total: {technician.assigned_tickets_total || 0} tickets</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                                        Active: {assignedTickets.filter(t => t.status !== 'resolved' && t.status !== 'closed' && t.status !== 'cancelled').length}
                                    </div>
                                    <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                                        Resolved: {assignedTickets.filter(t => t.status === 'resolved').length}
                                    </div>
                                    <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                                        Closed: {assignedTickets.filter(t => t.status === 'closed').length}
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {assignedTickets.length > 0 ? (
                                    assignedTickets.map((ticket) => (
                                        <div key={ticket.id}
                                            className="bg-white rounded-xl p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 cursor-pointer"
                                            onClick={() => navigate(`/tickets/${ticket.id}`)}
                                        >
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-4 h-4 rounded-full ${getStatusColor(ticket.status).replace('bg-', 'bg-').replace('text-', '')}`}></div>
                                                    <div>
                                                        <span className="font-semibold text-gray-900 text-lg">Ticket #{ticket.id}</span>
                                                        <div className="text-sm text-gray-600 mt-1">{ticket.subject}</div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-sm font-medium px-3 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                                                        {ticket.status?.replace('_', ' ')}
                                                    </span>
                                                    <div className="text-right">
                                                        <div className="text-xs text-gray-500">Created</div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {new Date(ticket.created_at).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                    {ticket.resolution_due && (
                                                        <div className="text-right">
                                                            <div className="text-xs text-gray-500">Due</div>
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {new Date(ticket.resolution_due).toLocaleDateString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-gray-600">
                                                <div className="flex items-center gap-4">
                                                    <span>Requester: {ticket.requester?.name || 'N/A'}</span>
                                                    <span>•</span>
                                                    <span>Priority: <span className={`${getPriorityColor(ticket.priority).replace('bg-', 'text-')}`}>{ticket.priority}</span></span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Clock size={32} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-xl font-medium">No tickets currently assigned</p>
                                        <p className="text-gray-400 text-sm mt-2">This technician has no active tickets at the moment.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
