import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Tag, User, Calendar, Clock, MessageSquare, History, CheckCircle, ArrowRight, Layers, Shield, Star, ThumbsUp, GitCommitVertical, ArrowLeft, Loader2, Plus, Edit, Trash2, XCircle
} from 'lucide-react';
import ticketsApi from '../api/tickets';
import skillsApi from '../api/skills';
import techniciansApi from '../api/technician';
import { FaRegCircleQuestion } from "react-icons/fa6";
import usersApi from '../api/users';
import { CloseTicketModal } from '../components/CloseTicketModal';


// --- Helper Functions & Sub-components ---

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

const getStatusColor = (status) => {
    switch (status) {
        case 'new': return 'bg-blue-100 text-blue-800';
        case 'assigned': return 'bg-indigo-100 text-indigo-800';
        case 'in_progress': return 'bg-yellow-100 text-yellow-800';
        case 'on_hold': return 'bg-gray-100 text-gray-800';
        case 'resolved': return 'bg-green-100 text-green-800';
        case 'closed': return 'bg-green-200 text-green-900';
        case 'cancelled': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

const getPriorityColor = (priority) => {
    switch (priority) {
        case 'low': return 'bg-gray-100 text-gray-800';
        case 'normal': return 'bg-blue-100 text-blue-800';
        case 'high': return 'bg-orange-100 text-orange-800';
        case 'critical': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100';
    }
};

const DetailItem = ({ icon: Icon, label, children }) => (
    <div className="flex flex-col">
        <dt className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Icon className="h-4 w-4 text-gray-400" />
            {label}
        </dt>
        <dd className="mt-1 text-sm text-gray-900">{children}</dd>
    </div>
);

const TimelineItem = ({ icon: Icon, color, author, timestamp, children }) => (
    <li className="mb-6 ms-6">
        <span className={`absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full ${color} ring-8 ring-white`}>
            <Icon className="h-3.5 w-3.5" />
        </span>
        <div className="ml-2 items-center justify-between rounded-lg border border-gray-200 bg-white p-4 sm:flex">
            <div className="text-sm font-normal text-gray-600">
                {children}
            </div>
            <div className="mt-2 text-xs font-normal text-gray-400 sm:mt-0 sm:text-right">
                <p>{author}</p>
                <time>{formatDate(timestamp)}</time>
            </div>
        </div>
    </li>
);

const AssignmentModal = ({ isOpen, onClose, justification, technicianDetails, technicianWorkload, ticketSkills, skillNames }) => {
    if (!isOpen || !technicianDetails) return null;

    const matchingSkills = technicianDetails.skills?.filter(techSkill =>
        ticketSkills?.includes(techSkill.id)
    ) || [];

    const currentWorkload = technicianWorkload?.tickets?.length || 0;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-900">Assignment Justification</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>

                <div className="space-y-6">
                    {/* Technician Basic Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-900 mb-3">Technician Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600 mb-1">
                                    <span className="font-medium">Name:</span> {technicianDetails.user?.name || technicianDetails.name || 'N/A'}
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <span className="font-medium">Skill Level:</span> {technicianDetails.skill_level?.replace('_', ' ') || 'N/A'}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Specialization:</span> {technicianDetails.specialization || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600 mb-1">
                                    <span className="font-medium">Current Workload:</span> {currentWorkload} active tickets
                                </p>
                                <p className="text-gray-600 mb-1">
                                    <span className="font-medium">Status:</span>
                                    <span className={`ml-1 px-2 py-1 text-xs rounded ${technicianDetails.availability_status === 'available'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                        {technicianDetails.availability_status?.replace('_', ' ') || 'Unknown'}
                                    </span>
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Email:</span> {technicianDetails.user?.email || 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Matching Skills */}
                    {matchingSkills.length > 0 && (
                        <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-semibold text-green-900 mb-3">Matching Skills ({matchingSkills.length})</h4>
                            <div className="flex flex-wrap gap-2">
                                {matchingSkills.map(skill => (
                                    <span key={skill.id} className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
                                        {skillNames[skill.id] || `Skill ${skill.id}`}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* AI Assignment Justification */}
                    <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100 p-6">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                                <div className="w-3 h-3 bg-indigo-400 rounded-full"></div>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-semibold text-indigo-900 mb-3">AI Assignment Justification</h4>
                                <div className="space-y-3">
                                    {matchingSkills.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                            <span className="text-indigo-700">Perfect skill match: {matchingSkills.length} skills aligned</span>
                                        </div>
                                    )}
                                    {technicianDetails.skill_level === 'senior' && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                            <span className="text-indigo-700">Senior expertise for complex ticket resolution</span>
                                        </div>
                                    )}
                                    {currentWorkload < 5 && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                            <span className="text-indigo-700">Optimal workload balance ({currentWorkload} active tickets)</span>
                                        </div>
                                    )}
                                    {technicianDetails.availability_status === 'available' && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                            <span className="text-indigo-700">Immediate availability for quick response</span>
                                        </div>
                                    )}
                                    {technicianDetails.specialization && (
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                            <span className="text-indigo-700">Specialized in: {technicianDetails.specialization}</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Assignment Score */}
                                <div className="mt-4 pt-4 border-t border-indigo-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-indigo-800">Assignment Score:</span>
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => {
                                                const score = Math.min(
                                                    (matchingSkills.length * 2) + 
                                                    (technicianDetails.skill_level === 'senior' ? 1 : 0) + 
                                                    (currentWorkload < 5 ? 1 : 0) + 
                                                    (technicianDetails.availability_status === 'available' ? 1 : 0),
                                                    5
                                                );
                                                return (
                                                    <div 
                                                        key={i} 
                                                        className={`w-3 h-3 rounded-full ${
                                                            i < score ? 'bg-indigo-500' : 'bg-indigo-200'
                                                        }`}
                                                    ></div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="bg-blue-50 rounded-lg p-4 text-justify">
                        {/* <h4 className="font-semibold text-blue-900 mb-2">Why this technician?</h4>
                        <ul className="space-y-1 text-blue-800">
                            {matchingSkills.length > 0 && (
                                <li>• Has {matchingSkills.length} required skills</li>
                            )}
                            {technicianDetails.skill_level === 'senior' && (
                                <li>• Senior level expertise</li>
                            )}
                            {currentWorkload < 5 && (
                                <li>• Low current workload</li>
                            )}
                            {technicianDetails.availability_status === 'available' && (
                                <li>• Currently available</li>
                            )}
                            {(matchingSkills.length === 0 && technicianDetails.skill_level !== 'senior' && currentWorkload >= 5 && technicianDetails.availability_status !== 'available') && (
                                <li>• No specific strong match found.</li>
                            )}
                        </ul> */}
                        {justification}
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

export default function TicketDetailsPage() {

    const [showCloseModal, setShowCloseModal] = useState(false);
    
    const { id } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('work_logs');
    const [ticket, setTicket] = useState(null);
    const [skillNames, setSkillNames] = useState({});
    const [technicianDetails, setTechnicianDetails] = useState(null);
    const [technicianWorkload, setTechnicianWorkload] = useState(null);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updateMessage, setUpdateMessage] = useState(null);

    // Task management states
    const [showAddTaskModal, setShowAddTaskModal] = useState(false);
    const [showEditTaskModal, setShowEditTaskModal] = useState(false);
    const [newTaskData, setNewTaskData] = useState({ sub: '', description: '', status: 'pending' });
    const [editingTaskIndex, setEditingTaskIndex] = useState(null);

    // Helper to update ticket on server after local changes
    const updateTicketOnServer = async (updatedTicketData) => {
        setLoading(true);
        setError(null);
        try {
            const response = await ticketsApi.updateTicket(id, updatedTicketData);
            if (response.success && response.data) {
                setTicket(response.data);
                setNewTaskData({ sub: '', description: '', status: 'pending' });
                setUpdateMessage('Ticket updated successfully!');
            } else {
                throw new Error(response.message || 'Failed to update ticket on server.');
            }
        } catch (err) {
            console.error('Error updating ticket:', err);
            setError(err.message || 'Failed to update ticket details.');
            setUpdateMessage('Failed to update ticket!');
        } finally {
            setLoading(false);
            setTimeout(() => setUpdateMessage(null), 3000);
        }
    };

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await ticketsApi.getTicketById(id);

                if (response.success && response.data) {
                    const fetchedTicket = response.data;
                    setTicket(fetchedTicket);

                    if (fetchedTicket.required_skills && fetchedTicket.required_skills.length > 0) {
                        const skillNamesMap = {};
                        const fetchPromises = fetchedTicket.required_skills.map(async (skillId) => {
                            try {
                                const skillResponse = await skillsApi.getSkillById(skillId);
                                if (skillResponse.success && skillResponse.data) {
                                    skillNamesMap[skillId] = skillResponse.data.name;
                                }
                            } catch (skillErr) {
                                console.warn(`Failed to fetch skill ${skillId}:`, skillErr);
                                skillNamesMap[skillId] = `Skill ${skillId}`;
                            }
                        });
                        await Promise.all(fetchPromises);
                        setSkillNames(skillNamesMap);
                    }

                    if (fetchedTicket.assigned_technician_id) {
                        fetchTechnicianDetails(fetchedTicket.assigned_technician_id);
                    }
                } else {
                    setError('Invalid response format from server');
                }
            } catch (err) {
                console.error('Error fetching ticket:', err);
                setError(err.message || 'Failed to fetch ticket details');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchTicket();
        }
    }, [id]);

    const fetchTechnicianDetails = async (technicianId) => {
        try {
            const techResponse = await techniciansApi.getTechnicianById(technicianId);
            if (techResponse.success && techResponse.data) {
                setTechnicianDetails(techResponse.data);
            }

            const workloadResponse = await ticketsApi.getTicketsByTechnicianId(technicianId, { status: 'new,assigned,in_progress,on_hold' });
            if (workloadResponse.success && workloadResponse.data) {
                setTechnicianWorkload(workloadResponse.data);
            }
        } catch (err) {
            console.warn('Failed to fetch technician details:', err);
        }
    };

    // --- Task CRUD Operations ---

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskData.sub.trim()) {
            alert('Task subject cannot be empty.');
            return;
        }

        const currentTasks = ticket.tasks || [];
        const updatedTasks = [...currentTasks, {
            ...newTaskData,
            status: newTaskData.status || 'pending',
            created_at: new Date().toISOString()
        }];

        await updateTicketOnServer({ tasks: updatedTasks });
        setShowAddTaskModal(false);
    };

    const handleEditTaskClick = (task, index) => {
        setNewTaskData({
            sub: task.sub || task.name || '',
            description: task.description || '',
            status: task.status || 'pending'
        });
        setEditingTaskIndex(index);
        setShowEditTaskModal(true);
    };

    const handleUpdateTask = async (e) => {
        e.preventDefault();
        if (!newTaskData.sub.trim()) {
            alert('Task subject cannot be empty.');
            return;
        }
        if (editingTaskIndex === null) return;

        const currentTasks = [...(ticket.tasks || [])];
        currentTasks[editingTaskIndex] = {
            ...currentTasks[editingTaskIndex],
            sub: newTaskData.sub,
            description: newTaskData.description,
            status: newTaskData.status,
            updated_at: new Date().toISOString()
        };

        await updateTicketOnServer({ tasks: currentTasks });
        setShowEditTaskModal(false);
        setEditingTaskIndex(null);
        setNewTaskData({ sub: '', description: '', status: 'pending' });
    };

    const handleDeleteTask = async (indexToDelete) => {
        if (!window.confirm('Are you sure you want to delete this task?')) {
            return;
        }
        const updatedTasks = (ticket.tasks || []).filter((_, index) => index !== indexToDelete);
        await updateTicketOnServer({ tasks: updatedTasks });
    };

    const handleToggleTaskStatus = async (indexToToggle) => {
        const currentTasks = [...(ticket.tasks || [])];
        const taskToToggle = currentTasks[indexToToggle];
        if (!taskToToggle) return;

        const newStatus = taskToToggle.status === 'completed' ? 'pending' : 'completed';
        currentTasks[indexToToggle] = {
            ...taskToToggle,
            status: newStatus,
            completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
        };
        await updateTicketOnServer({ tasks: currentTasks });
    };

    const handleCloseTicket = async (closeData) => {
        // if (!ticket || !window.confirm('Are you sure you want to close this ticket? This action cannot be undone.')) {
        //     return;
        // }

        try {

            //  if (ticket.status !== 'resolved') {
            //     toast.error('Ticket must be resolved before closing');
            //     return;
            // }

             setLoading(true);
            const updatedTicketData = {
                ...ticket,
                status: 'closed',
                closed_at: new Date().toISOString()
            };

              const response = await ticketsApi.closeTicket(ticket.id, closeData);
            
            if (response.success) {
                setShowCloseModal(false);
                setTicket(response.data);
                setUpdateMessage('Ticket closed successfully!');
                // Refresh ticket data
                await fetchTicket();
            }

            setTimeout(() => setUpdateMessage(''), 3000);
            // setLoading(true);
            // const updatedTicketData = {
            //     ...ticket,
            //     status: 'closed',
            //     closed_at: new Date().toISOString()
            // };

            // await ticketsApi.closeTicket(ticket.id, updatedTicketData);
            // setTicket(updatedTicketData);
            // setUpdateMessage('Ticket closed successfully!');
            // setTimeout(() => setUpdateMessage(''), 3000);
        } catch (error) {
            console.error('Error closing ticket:', error);
            setUpdateMessage('Failed to close ticket. Please try again.');
            setTimeout(() => setUpdateMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const renderAuditTrail = (log) => {
        const { field, action, from, to } = log.change || {};
        const authorName = log.author || 'System';

        if (action === 'Created' || !field) {
            return <p>Ticket was created by <strong>{authorName}</strong>.</p>
        }
        return (
            <div>
                <span className="font-semibold">{field}</span> changed by <strong>{authorName}</strong> from
                <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span className="rounded bg-red-100 px-2 py-0.5 text-red-800">{from || 'N/A'}</span>
                    <ArrowRight className="h-3 w-3" />
                    <span className="rounded bg-green-100 px-2 py-0.5 text-green-800">{to}</span>
                </div>
            </div>
        );
    }

    if (loading && !ticket) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading ticket details...</p>
                </div>
            </div>
        );
    }

    if (error && !ticket) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
                        <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Ticket</h3>
                        <p className="text-red-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-md">
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">Ticket Not Found</h3>
                        <p className="text-yellow-600 mb-4">The ticket you're looking for doesn't exist or has been removed.</p>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 font-sans">
            <main className="mx-auto max-w-7xl">
                {/* Back Button */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-md transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </button>
                </div>

                {/* Update Message / Error Message (for task operations) */}
                {updateMessage && (
                    <div className={`p-3 mb-4 rounded-md text-sm ${updateMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {updateMessage}
                    </div>
                )}
                {/* Only show loading for task/ticket updates, not initial page load */}
                {loading && updateMessage === null && (
                    <div className="p-3 mb-4 rounded-md text-sm bg-blue-100 text-blue-800 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Updating ticket...
                    </div>
                )}
                {/* Only show general error if updateMessage is not already showing an error */}
                {error && updateMessage === null && (
                    <div className="p-3 mb-4 rounded-md text-sm bg-red-100 text-red-800">Error: {error}</div>
                )}


                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                    {/* Left Column: Ticket Details */}
                    <div className="space-y-6 lg:col-span-2">

                        {/* Header */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <span className="text-sm font-medium text-gray-500">TICKET #{ticket.id}</span>
                                    <h1 className="mt-1 text-2xl font-bold text-gray-900">{ticket.subject}</h1>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                                        {ticket.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                                    </span>
                                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                                        {ticket.priority?.toUpperCase() || 'NORMAL'}
                                    </span>
                                </div>
                            </div>

                            {/* Tags */}
                            {ticket.tags && ticket.tags.length > 0 && (
                                <div className="mt-4 flex flex-wrap items-center gap-2">
                                    <Tag className="h-4 w-4 text-gray-400" />
                                    {ticket.tags.map(tag => (
                                        <span key={tag} className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-md">{tag}</span>
                                    ))}
                                </div>
                            )}

                            {/* Required Skills - MOVED HERE */}
                            {ticket.required_skills && Object.keys(skillNames).length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100"> {/* Added top border for separation */}
                                    <h3 className="font-semibold text-gray-800 mb-2">Required Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {ticket.required_skills.map(skillId => (
                                            <span key={skillId} className="text-xs font-medium bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                                                {skillNames[skillId] || `Skill ${skillId}`}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <h2 className="text-lg font-semibold text-gray-800">Description</h2>
                            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-600">{ticket.description}</p>
                        </div>

                        {/* Details Grid */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Ticket Details</h2>
                            <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2 md:grid-cols-3">
                                <DetailItem icon={User} label="Requester">
                                    {ticket.requester?.name || ticket.requester_id || 'N/A'}
                                </DetailItem>
                                <DetailItem icon={User} label="Assigned To">
                                    <div className="relative">
                                        <button
                                            className="cursor-pointer hover:text-indigo-600 transition-colors flex items-center"
                                            onClick={() => setShowAssignmentModal(true)}
                                        >
                                            {ticket.assigned_technician?.name || ticket.assigned_technician_id || 'Unassigned'}
                                            <FaRegCircleQuestion className='ml-1 my-auto'/>
                                        </button>
                                    </div>
                                </DetailItem>
                                <DetailItem icon={Shield} label="Impact">
                                    {ticket.impact?.toUpperCase() || 'N/A'}
                                </DetailItem>
                                <DetailItem icon={Layers} label="Urgency">
                                    {ticket.urgency?.toUpperCase() || 'N/A'}
                                </DetailItem>
                                <DetailItem icon={Calendar} label="Created Date">
                                    {formatDate(ticket.created_at)}
                                </DetailItem>
                                <DetailItem icon={Clock} label="Resolution Due">
                                    {formatDate(ticket.resolution_due)}
                                </DetailItem>
                                <DetailItem icon={Clock} label="First Response">
                                    {ticket.first_response_at ? formatDate(ticket.first_response_at) : 'N/A'}
                                </DetailItem>
                                <DetailItem icon={Clock} label="Resolved At">
                                    {ticket.resolved_at ? formatDate(ticket.resolved_at) : 'N/A'}
                                </DetailItem>
                                <DetailItem icon={Clock} label="Closed At">
                                    {ticket.closed_at ? formatDate(ticket.closed_at) : 'N/A'}
                                </DetailItem>
                                <DetailItem icon={History} label="Reopened Count">
                                    {ticket.reopened_count !== undefined ? ticket.reopened_count : 'N/A'}
                                </DetailItem>
                                <DetailItem icon={CheckCircle} label="SLA Violated">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${ticket.sla_violated ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                                        {ticket.sla_violated ? 'Yes' : 'No'}
                                    </span>
                                </DetailItem>
                            </dl>
                        </div>

                        {/* Tasks Section (CRUD) - Moved here to be its own section */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">Tasks ({ticket.tasks?.length || 0})</h3>
                                <button
                                    onClick={() => setShowAddTaskModal(true)}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    <Plus className="h-4 w-4 mr-1" /> Add Task
                                </button>
                            </div>

                            {ticket.tasks && ticket.tasks.length > 0 ? (
                                <ul className="mt-3 space-y-3">
                                    {ticket.tasks.map((task, index) => (
                                        <li key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <button onClick={() => handleToggleTaskStatus(index)} className="flex-shrink-0 mt-1">
                                                <CheckCircle className={`h-5 w-5 ${task.status === 'completed' ? 'text-green-500' : 'text-gray-300 hover:text-gray-500'}`} />
                                            </button>
                                            <div className="flex-grow">
                                                <span className={`text-base font-medium ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                                    {task.sub || task.name || 'No Subject'}
                                                </span>
                                                {task.description && (
                                                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                                )}
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {task.created_at && <span>Created: {formatDate(task.created_at)}</span>}
                                                    {task.updated_at && <span> | Last Updated: {formatDate(task.updated_at)}</span>}
                                                    {task.completed_at && <span> | Completed: {formatDate(task.completed_at)}</span>}
                                                </div>
                                            </div>
                                            <div className="flex-shrink-0 flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEditTaskClick(task, index)}
                                                    className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                                                    title="Edit Task"
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTask(index)}
                                                    className="p-1 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                                                    title="Delete Task"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No tasks added yet.</p>
                            )}
                        </div>

                                                 {/* Satisfaction */}
                         {ticket.satisfaction_rating !== null && ticket.satisfaction_rating !== undefined && (
                             <div className="rounded-lg border border-gray-200 bg-white p-6">
                                 <h3 className="font-semibold text-gray-800 flex items-center gap-2"><ThumbsUp className="h-5 w-5 text-indigo-500" /> Customer Feedback</h3>
                                 <div className="mt-3 flex items-center gap-2">
                                     {[...Array(5)].map((_, i) => (
                                         <Star key={i} className={`h-5 w-5 ${i < ticket.satisfaction_rating ? 'text-yellow-400' : 'text-gray-300'}`} fill="currentColor" />
                                     ))}
                                 </div>
                                 {ticket.feedback && (
                                     <p className="mt-2 text-sm italic text-gray-600">"{ticket.feedback}"</p>
                                 )}
                                 {!ticket.feedback && (
                                     <p className="mt-2 text-sm text-gray-500">No written feedback provided.</p>
                                 )}
                             </div>
                         )}

                         {/* Close Ticket Button - Moved here for better positioning */}
                         {/* {ticket && ticket.status !== 'closed' && ticket.status !== 'cancelled' && (
                             <div className="rounded-lg border border-gray-200 bg-white p-6">
                                 <div className="text-center">
                                     <h3 className="text-lg font-semibold text-gray-800 mb-4">Ticket Actions</h3>
                                     <button
                                         onClick={handleCloseTicket}
                                         disabled={loading}
                                         className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 disabled:transform-none flex items-center gap-2 mx-auto"
                                     >
                                         <XCircle className="w-5 h-5" />
                                         Close Ticket
                                     </button>
                                     {updateMessage && (
                                         <div className="mt-4">
                                             <p className={`text-sm ${updateMessage.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                                 {updateMessage}
                                             </p>
                                         </div>
                                     )}
                                 </div>
                             </div>
                         )} */}

            <button
                onClick={() => setShowCloseModal(true)}
                // disabled={ticket.status !== 'resolved'}
                className={`${
                    ticket.status !== 'resolved' 
                    ? 'bg-red-500' 
                    : 'bg-red-500 hover:bg-red-600'
                } text-white px-4 py-2 rounded`}
            >
                Close Ticket
            </button>

            <CloseTicketModal 
                isOpen={showCloseModal}
                onClose={() => setShowCloseModal(false)}
                onSubmit={handleCloseTicket}
            />

                    </div>

                    {/* Right Column: Activity Feed */}
                    <div className="space-y-6 lg:col-span-1">
                        <div className="rounded-lg border border-gray-200 bg-white">
                            {/* Tabs */}
                            <div className="border-b border-gray-200">
                                <nav className="-mb-px flex">
                                    <button onClick={() => setActiveTab('work_logs')} className={`flex-1 whitespace-nowrap border-b-2 py-4 px-1 text-center text-sm font-medium ${activeTab === 'work_logs' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                                        Work Logs
                                    </button>
                                    <button onClick={() => setActiveTab('audit_trail')} className={`flex-1 whitespace-nowrap border-b-2 py-4 px-1 text-center text-sm font-medium ${activeTab === 'audit_trail' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                                        Audit Trail
                                    </button>
                                </nav>
                            </div>

                            {/* Timeline Content */}
                            <div className="p-6">
                                <ol className="relative border-s border-gray-200">
                                    {activeTab === 'work_logs' && (
                                        ticket.work_logs && ticket.work_logs.length > 0 ? ticket.work_logs.map((log, index) => (
                                            <TimelineItem key={log.time || index} icon={MessageSquare} color="bg-blue-100 text-blue-600" author={log.author || 'System'} timestamp={log.time}>
                                                <p>{log.note}</p>
                                            </TimelineItem>
                                        )) : <p className="text-sm text-gray-500">No work logs yet.</p>
                                    )}
                                    {activeTab === 'audit_trail' && (
                                        ticket.audit_trail && ticket.audit_trail.length > 0 ? ticket.audit_trail.map((log, index) => (
                                            <TimelineItem key={log.timestamp || index} icon={GitCommitVertical} color="bg-gray-100 text-gray-600" author={log.author || 'System'} timestamp={log.timestamp}>
                                                {renderAuditTrail(log)}
                                            </TimelineItem>
                                        )) : <p className="text-sm text-gray-500">No audit trail history.</p>
                                    )}
                                </ol>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Add/Edit Task Modal */}
            {(showAddTaskModal || showEditTaskModal) && ( // Combined modal display
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-semibold text-gray-900">{editingTaskIndex !== null ? 'Edit Task' : 'Add New Task'}</h3>
                            <button onClick={() => { setShowAddTaskModal(false); setShowEditTaskModal(false); setNewTaskData({ sub: '', description: '', status: 'pending' }); setEditingTaskIndex(null); }} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <form onSubmit={editingTaskIndex !== null ? handleUpdateTask : handleAddTask}>
                            <div className="mb-4">
                                <label htmlFor="taskSubject" className="block text-sm font-medium text-gray-700">Subject</label>
                                <input
                                    type="text"
                                    id="taskSubject"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={newTaskData.sub}
                                    onChange={(e) => setNewTaskData({ ...newTaskData, sub: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                                <textarea
                                    id="taskDescription"
                                    rows="3"
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    value={newTaskData.description}
                                    onChange={(e) => setNewTaskData({ ...newTaskData, description: e.target.value })}
                                ></textarea>
                            </div>
                            {/* Status dropdown only visible when editing or if you want it on add too */}
                            {(editingTaskIndex !== null || (newTaskData.status && newTaskData.status !== 'pending')) && (
                                <div className="mb-4">
                                    <label htmlFor="taskStatus" className="block text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        id="taskStatus"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                        value={newTaskData.status}
                                        onChange={(e) => setNewTaskData({ ...newTaskData, status: e.target.value })}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            )}
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setShowAddTaskModal(false); setShowEditTaskModal(false); setNewTaskData({ sub: '', description: '', status: 'pending' }); setEditingTaskIndex(null); }}
                                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    {editingTaskIndex !== null ? 'Save Changes' : 'Add Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

                         {/* Assignment Justification Modal */}
             <AssignmentModal
                 isOpen={showAssignmentModal}
                 onClose={() => setShowAssignmentModal(false)}
                 justification={ticket?.justification}
                 technicianDetails={technicianDetails}
                 technicianWorkload={technicianWorkload}
                 ticketSkills={ticket?.required_skills}
                 skillNames={skillNames}
             />
         </div>
     );
}
