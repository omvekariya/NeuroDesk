import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from './Dashboard/DashboardHeader';

export const TechnicianPage = () => {
    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const userData = JSON.parse(userString);
                setLoggedInUser(userData);
                
                // Redirect if user is not a technician
                if (userData.role && userData.role.toLowerCase() !== 'technician') {
                    navigate(`/${userData.role.toLowerCase()}`);
                }
            } catch (error) {
                console.error("Error parsing user data:", error);
                navigate('/login');
            }
        } else {
            navigate('/login');
        }
    }, [navigate]);

    if (!loggedInUser) {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }

    return (
        <div className="antialiased bg-gray-50 min-h-screen">
            <DashboardHeader user={loggedInUser} />
            
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Technician Dashboard</h1>
                        <p className="text-gray-600 mb-4">
                            Welcome, {loggedInUser.name}! Manage your assigned tickets and update their status.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {/* My Assigned Tickets Card */}
                            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">My Assigned Tickets</h3>
                                <p className="text-blue-700 mb-4">View and manage tickets assigned to you</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    View Tickets
                                </button>
                            </div>

                            {/* Available Tickets Card */}
                            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                                <h3 className="text-lg font-semibold text-green-900 mb-2">Available Tickets</h3>
                                <p className="text-green-700 mb-4">Pick up new tickets from the queue</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Browse Queue
                                </button>
                            </div>

                            {/* My Profile Card */}
                            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                                <h3 className="text-lg font-semibold text-purple-900 mb-2">My Profile</h3>
                                <p className="text-purple-700 mb-4">Update your skills and availability</p>
                                <button 
                                    onClick={() => navigate('/technicians/' + loggedInUser.id)}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Edit Profile
                                </button>
                            </div>

                            {/* Work Schedule Card */}
                            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Work Schedule</h3>
                                <p className="text-yellow-700 mb-4">View your work schedule and availability</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                                >
                                    View Schedule
                                </button>
                            </div>

                            {/* Performance Stats Card */}
                            <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
                                <h3 className="text-lg font-semibold text-indigo-900 mb-2">Performance Stats</h3>
                                <p className="text-indigo-700 mb-4">View your performance metrics</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    View Stats
                                </button>
                            </div>

                            {/* Knowledge Base Card */}
                            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                                <h3 className="text-lg font-semibold text-red-900 mb-2">Knowledge Base</h3>
                                <p className="text-red-700 mb-4">Access troubleshooting guides</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Browse KB
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Statistics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-blue-100 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-blue-900">Active Tickets</h3>
                                    <p className="text-2xl font-bold text-blue-600">8</p>
                                </div>
                                <div className="bg-green-100 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-green-900">Resolved Today</h3>
                                    <p className="text-2xl font-bold text-green-600">5</p>
                                </div>
                                <div className="bg-yellow-100 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-yellow-900">Avg Response Time</h3>
                                    <p className="text-2xl font-bold text-yellow-600">2.3h</p>
                                </div>
                                <div className="bg-purple-100 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-purple-900">Customer Rating</h3>
                                    <p className="text-2xl font-bold text-purple-600">4.8★</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Resolved ticket #TKT-2024-001 - Network connectivity issue</span>
                                        <span className="text-xs text-gray-400">2 hours ago</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Assigned ticket #TKT-2024-015 - Software installation</span>
                                        <span className="text-xs text-gray-400">4 hours ago</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Updated ticket #TKT-2024-008 - Waiting for user response</span>
                                        <span className="text-xs text-gray-400">6 hours ago</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}; 