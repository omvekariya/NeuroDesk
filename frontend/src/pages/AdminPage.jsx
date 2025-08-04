import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardHeader } from './Dashboard/DashboardHeader';

export const AdminPage = () => {
    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState(null);

    useEffect(() => {
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const userData = JSON.parse(userString);
                setLoggedInUser(userData);
                
                // Redirect if user is not an admin
                if (userData.role && userData.role.toLowerCase() !== 'admin') {
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
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
                        <p className="text-gray-600 mb-4">
                            Welcome, {loggedInUser.name}! You have administrative access to manage the ITSM system.
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {/* User Management Card */}
                            <div className="bg-red-50 rounded-lg p-6 border border-red-200">
                                <h3 className="text-lg font-semibold text-red-900 mb-2">User Management</h3>
                                <p className="text-red-700 mb-4">Manage users, roles, and permissions</p>
                                <button 
                                    onClick={() => navigate('/test')}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Manage Users
                                </button>
                            </div>

                            {/* System Overview Card */}
                            <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-900 mb-2">System Overview</h3>
                                <p className="text-blue-700 mb-4">View system statistics and analytics</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                                >
                                    View Analytics
                                </button>
                            </div>

                            {/* Ticket Management Card */}
                            <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                                <h3 className="text-lg font-semibold text-green-900 mb-2">Ticket Management</h3>
                                <p className="text-green-700 mb-4">Manage and assign tickets</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                                >
                                    Manage Tickets
                                </button>
                            </div>

                            {/* Technician Management Card */}
                            <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                                <h3 className="text-lg font-semibold text-purple-900 mb-2">Technician Management</h3>
                                <p className="text-purple-700 mb-4">Manage technician assignments and skills</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors"
                                >
                                    Manage Technicians
                                </button>
                            </div>

                            {/* System Settings Card */}
                            <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200">
                                <h3 className="text-lg font-semibold text-yellow-900 mb-2">System Settings</h3>
                                <p className="text-yellow-700 mb-4">Configure system parameters</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                                >
                                    Settings
                                </button>
                            </div>

                            {/* Reports Card */}
                            <div className="bg-indigo-50 rounded-lg p-6 border border-indigo-200">
                                <h3 className="text-lg font-semibold text-indigo-900 mb-2">Reports</h3>
                                <p className="text-indigo-700 mb-4">Generate and view reports</p>
                                <button 
                                    onClick={() => navigate('/dashboard')}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                >
                                    View Reports
                                </button>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Statistics</h2>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-blue-100 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-blue-900">Total Users</h3>
                                    <p className="text-2xl font-bold text-blue-600">150</p>
                                </div>
                                <div className="bg-green-100 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-green-900">Active Tickets</h3>
                                    <p className="text-2xl font-bold text-green-600">45</p>
                                </div>
                                <div className="bg-yellow-100 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-yellow-900">Technicians</h3>
                                    <p className="text-2xl font-bold text-yellow-600">12</p>
                                </div>
                                <div className="bg-purple-100 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold text-purple-900">Resolved Today</h3>
                                    <p className="text-2xl font-bold text-purple-600">23</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}; 