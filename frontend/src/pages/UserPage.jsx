import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from './Dashboard/DashboardHeader';
import ticketsApi from '../api/tickets';

export const UserPage = () => {
    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [renderError, setRenderError] = useState(null);

    // Function to fetch user tickets
    const fetchUserTickets = async (userId) => {
        try {
            console.log("fetchUserTickets called with userId:", userId); // Debug log
            setLoading(true);
            setError(null);
            
            const response = await ticketsApi.getTicketsByUserId(userId);
            console.log("Fetched tickets response:", response);
            
            // Handle different response structures
            let ticketsData = [];
            
            if (response) {
                if (response.success && response.data) {
                    // Standard API response format
                    ticketsData = Array.isArray(response.data) ? response.data : [];
                } else if (Array.isArray(response)) {
                    // Direct array response
                    ticketsData = response;
                } else if (response.data && Array.isArray(response.data)) {
                    // Alternative response format
                    ticketsData = response.data;
                } else {
                    console.log("Unexpected response format, setting empty array");
                    ticketsData = [];
                }
            }
            
            console.log("Setting tickets:", ticketsData); // Debug log
            setTickets(ticketsData);
            
        } catch (error) {
            console.error("Error fetching tickets:", error);
            setError("Failed to load tickets. Please try again.");
            setTickets([]);
        } finally {
            console.log("Setting loading to false"); // Debug log
            setLoading(false);
        }
    };

    useEffect(() => {
        const userString = localStorage.getItem('user');
        console.log("UserPage useEffect - userString:", userString); // Debug log
        
        if (userString) {
            try {
                const userData = JSON.parse(userString);
                console.log("UserPage useEffect - parsed userData:", userData); // Debug log
                setLoggedInUser(userData);
                
                // Redirect if user is not a regular user
                if (userData.role && userData.role.toLowerCase() !== 'user') {
                    console.log("UserPage useEffect - redirecting to:", userData.role.toLowerCase()); // Debug log
                    navigate(`/${userData.role.toLowerCase()}`);
                } else {
                    // Set loading to false immediately to show the dashboard
                    setLoading(false);
                    
                    // Fetch tickets for the user (but don't block the UI)
                    if (userData.id) {
                        console.log("UserPage useEffect - fetching tickets for user ID:", userData.id); // Debug log
                        // Use setTimeout to avoid blocking the render
                        setTimeout(() => {
                            fetchUserTickets(userData.id);
                        }, 100);
                    }
                }
            } catch (error) {
                console.error("Error parsing user data:", error);
                navigate('/login');
            }
        } else {
            console.log("UserPage useEffect - no user string found, redirecting to login"); // Debug log
            navigate('/login');
        }
    }, [navigate]);

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) return 'Just now';
        if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        
        return date.toLocaleDateString();
    };

    // Helper function to get status badge styling
    const getStatusBadge = (status) => {
        const statusMap = {
            'open': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Open' },
            'in_progress': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'In Progress' },
            'resolved': { bg: 'bg-green-100', text: 'text-green-800', label: 'Resolved' },
            'closed': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Closed' },
            'cancelled': { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' }
        };
        
        const statusConfig = statusMap[status?.toLowerCase()] || statusMap['open'];
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
            </span>
        );
    };

    // Helper function to get priority badge styling
    const getPriorityBadge = (priority) => {
        const priorityMap = {
            'low': { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Low' },
            'medium': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Medium' },
            'high': { bg: 'bg-red-100', text: 'text-red-800', label: 'High' },
            'urgent': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Urgent' }
        };
        
        const priorityConfig = priorityMap[priority?.toLowerCase()] || priorityMap['medium'];
        return (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${priorityConfig.bg} ${priorityConfig.text}`}>
                {priorityConfig.label}
            </span>
        );
    };

    console.log("UserPage render - loggedInUser:", loggedInUser); // Debug log
    console.log("UserPage render - loading:", loading); // Debug log
    console.log("UserPage render - error:", error); // Debug log
    console.log("UserPage render - tickets:", tickets); // Debug log
    console.log("UserPage render - tickets type:", typeof tickets); // Debug log
    console.log("UserPage render - tickets isArray:", Array.isArray(tickets)); // Debug log

    if (!loggedInUser) {
        console.log("UserPage render - showing loading screen"); // Debug log
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    // Ensure tickets is always an array
    const safeTickets = Array.isArray(tickets) ? tickets : [];

    // Error boundary for rendering
    if (renderError) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
                    <p className="text-gray-600 mb-4">{renderError}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }

    try {
        return (
        <div className="antialiased bg-gray-50 min-h-screen">
            <DashboardHeader user={loggedInUser} />
            
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">User Dashboard</h1>
                        <p className="text-gray-600 mb-4">
                            Welcome, {loggedInUser?.name || 'User'}! This is your user dashboard where you can:
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            {/* Create Ticket Card */}
                            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">Create Ticket</h3>
                                <p className="text-blue-700 mb-4">Submit a new support ticket for assistance</p>
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {loggedInUser?.name ? loggedInUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-blue-900">{loggedInUser?.name || 'User'}</p>
                                        <p className="text-xs text-blue-600">{loggedInUser?.email || 'No email'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate('/ticket')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Create Ticket
                                </button>
                            </div>

                            {/* Profile Card */}
                            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                                <h3 className="text-lg font-semibold text-purple-900 mb-2">Profile</h3>
                                <p className="text-purple-700 mb-4">Update your profile information</p>
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-sm font-medium">
                                            {loggedInUser?.name ? loggedInUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-purple-900">{loggedInUser?.name || 'User'}</p>
                                        <p className="text-xs text-purple-600">Role: {loggedInUser?.role ? loggedInUser.role.charAt(0).toUpperCase() + loggedInUser.role.slice(1) : 'User'}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => navigate('/users/' + loggedInUser.id)}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            </div>
                        </div>

                        {/* My Tickets Section */}
                        <div className="mt-8">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold text-gray-900">My Tickets</h2>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={() => loggedInUser?.id && fetchUserTickets(loggedInUser.id)}
                                        disabled={loading}
                                        className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                    <button 
                                        onClick={() => navigate('/ticket')}
                                        className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition-colors text-sm"
                                    >
                                        + New Ticket
                                    </button>
                                </div>
                            </div>
                            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-not-allowed">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Loading tickets...
                                        </div>
                                    </div>
                                ) : error ? (
                                    <div className="text-center py-8">
                                        <div className="text-red-600 mb-4">{error}</div>
                                        <button 
                                            onClick={() => loggedInUser?.id && fetchUserTickets(loggedInUser.id)}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                ) : safeTickets.length === 0 ? (
                                    <div className="text-center py-8">
                                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {error ? "Unable to load tickets. Please try refreshing." : "You haven't created any tickets yet."}
                                        </p>
                                        <div className="mt-6">
                                            <button 
                                                onClick={() => navigate('/ticket')}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                Create Your First Ticket
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Ticket ID
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Subject
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Status
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Priority
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Created
                                                    </th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {safeTickets.map((ticket, index) => {
                                                    // Ensure ticket is an object
                                                    if (!ticket || typeof ticket !== 'object') {
                                                        console.warn("Invalid ticket data:", ticket);
                                                        return null;
                                                    }
                                                    
                                                    return (
                                                        <tr key={ticket.id || index} className="hover:bg-gray-50">
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                #{ticket.ticket_id || ticket.id || `TKT-${index + 1}`}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                                {ticket.subject || ticket.title || 'No subject'}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {getStatusBadge(ticket.status)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                {getPriorityBadge(ticket.priority)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {formatDate(ticket.created_at || ticket.createdAt)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                                <button 
                                                                    onClick={() => navigate(`/tickets/${ticket.id || index}`)}
                                                                    className="text-indigo-600 hover:text-indigo-900"
                                                                >
                                                                    View
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
        );
    } catch (error) {
        console.error("UserPage render error:", error);
        setRenderError(error.message);
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
                    <p className="text-gray-600 mb-4">There was an error rendering the dashboard.</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        );
    }
}; 