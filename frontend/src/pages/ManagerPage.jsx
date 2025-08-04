import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from './Dashboard/DashboardHeader';

export const ManagerPage = () => {
    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const userData = JSON.parse(userString);
                setLoggedInUser(userData);
                
                // Redirect if user is not a manager
                if (userData.role && userData.role.toLowerCase() !== 'manager') {
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
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Manager Dashboard</h1>
                        <p className="text-gray-600 mb-4">
                            Welcome, {loggedInUser.name}! Manage your team and oversee operations.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {/* Team Management Card */}
                            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">Team Management</h3>
                                <p className="text-blue-700 mb-4">Manage your team members and assignments</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    Manage Team
                                </button>
                            </div>

                            {/* Performance Overview Card */}
                            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                                <h3 className="text-lg font-semibold text-green-900 mb-2">Performance Overview</h3>
                                <p className="text-green-700 mb-4">Monitor team and individual performance</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    View Performance
                                </button>
                            </div>

                            {/* Ticket Escalation Card */}
                            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                                <h3 className="text-lg font-semibold text-red-900 mb-2">Ticket Escalation</h3>
                                <p className="text-red-700 mb-4">Handle escalated tickets and issues</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    View Escalations
                                </button>
                            </div>

                            {/* Resource Allocation Card */}
                            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                                <h3 className="text-lg font-semibold text-purple-900 mb-2">Resource Allocation</h3>
                                <p className="text-purple-700 mb-4">Manage resource distribution and workload</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Allocate Resources
                                </button>
                            </div>

                            {/* Reports & Analytics Card */}
                            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Reports & Analytics</h3>
                                <p className="text-yellow-700 mb-4">Generate reports and analyze trends</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                                >
                                    View Reports
                                </button>
                            </div>

                            {/* SLA Management Card */}
                            <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
                                <h3 className="text-lg font-semibold text-indigo-900 mb-2">SLA Management</h3>
                                <p className="text-indigo-700 mb-4">Monitor and manage service level agreements</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    Manage SLAs
                                </button>
                            </div>
                        </div>

                        {/* Team Performance Stats */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Performance</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-blue-100 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-blue-900">Team Members</h3>
                                    <p className="text-2xl font-bold text-blue-600">12</p>
                                </div>
                                <div className="bg-green-100 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-green-900">Avg Response Time</h3>
                                    <p className="text-2xl font-bold text-green-600">1.8h</p>
                                </div>
                                <div className="bg-yellow-100 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-yellow-900">SLA Compliance</h3>
                                    <p className="text-2xl font-bold text-yellow-600">94%</p>
                                </div>
                                <div className="bg-purple-100 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-purple-900">Customer Satisfaction</h3>
                                    <p className="text-2xl font-bold text-purple-600">4.6★</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Team Activity */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Team Activity</h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">John Doe resolved ticket #TKT-2024-001</span>
                                        <span className="text-xs text-gray-400">30 min ago</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Jane Smith picked up ticket #TKT-2024-015</span>
                                        <span className="text-xs text-gray-400">1 hour ago</span>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                        <span className="text-sm text-gray-600">Mike Johnson escalated ticket #TKT-2024-008</span>
                                        <span className="text-xs text-gray-400">2 hours ago</span>
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