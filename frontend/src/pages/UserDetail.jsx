import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import usersApi from '../api/users';
// No need for authApi if only fetching user details, but keep if header user profile is dynamic
import logo from "../assets/logosaas.png"; // Import logo for the header

export const UserDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState(null);

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [updateMessage, setUpdateMessage] = useState(null);

    useEffect(() => {
        // Load logged-in user data
        const userString = localStorage.getItem('user');
        if (userString) {
            try {
                const userData = JSON.parse(userString);
                setLoggedInUser(userData);
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }

        const fetchUser = async () => {
            setLoading(true);
            setError(null);
            try {
                const userData = await usersApi.getUserById(id);
                // Assuming API returns { success: true, data: userObject }
                // or just the userObject if the API response structure changes
                setUser(userData.data || userData);
                setFormData(userData.data || userData);
            } catch (err) {
                console.error("Failed to fetch user details:", err);
                setError(err.message || 'Error fetching user details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setUpdateMessage(null);
        try {
            const updatePayload = {
                name: formData.name,
                email: formData.email,
                contact_no: formData.contact_no,
                role: formData.role,
                department: formData.department,
                // Add other editable fields from your user model here
            };
            const updatedUser = await usersApi.updateUser(id, updatePayload);
            setUser(updatedUser.data || updatedUser);
            setFormData(updatedUser.data || updatedUser);
            setUpdateMessage('User updated successfully!');
            setIsEditing(false); // Exit edit mode
        } catch (err) {
            console.error("Failed to update user:", err);
            setError(err.message || 'Error updating user.');
            setUpdateMessage('Failed to update user.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="antialiased bg-gray-100 min-h-screen flex flex-col"> {/* Use gray-100 for a softer background, flex-col for full height */}
            {/* Header - Adapted for a dedicated page */}
            <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0"> {/* flex-shrink-0 to keep header fixed height */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <img src={logo} alt="Logo" className="h-9 w-9 mr-3" /> {/* Slightly larger logo */}
                            <h1 className="text-xl font-semibold text-gray-900">User Management</h1> {/* More specific title */}
                        </div>
                        <div className="flex items-center space-x-4">
                            {/* Back to Users button */}
                            <button
                                onClick={() => navigate(-1)} // Navigates back to the previous page (e.g., /users)
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors duration-200"
                            >
                                <span className="flex items-center">
                                    <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                                    Back to Users
                                </span>
                            </button>
                            {/* User profile (optional) - can be removed if not needed on detail pages */}
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {loggedInUser?.name ? loggedInUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-700">{loggedInUser?.name || 'User'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area - Taking full available height */}
            <main className="flex-grow max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 w-full"> {/* flex-grow to take remaining height */}
                {loading && (
                    <div className="bg-white shadow rounded-lg p-8 text-center min-h-[200px] flex items-center justify-center">
                        <p className="text-lg text-gray-700">Loading user details...</p>
                    </div>
                )}

                {error && !user && (
                    <div className="bg-white shadow rounded-lg p-8 text-center min-h-[200px] flex items-center justify-center">
                        <p className="text-red-500 text-lg">Error: {error}</p>
                    </div>
                )}

                {!loading && !error && !user && (
                    <div className="bg-white shadow rounded-lg p-8 text-center min-h-[200px] flex items-center justify-center">
                        <p className="text-gray-700 text-lg">User not found.</p>
                    </div>
                )}

                {!loading && !error && user && (
                    <div className="bg-white shadow-xl rounded-lg p-10 transform transition-all duration-300 hover:scale-[1.005]"> {/* Enhanced shadow and subtle hover effect */}
                        <div className="flex justify-between items-center mb-8 border-b pb-6"> {/* Larger bottom padding for border */}
                            <h2 className="text-3xl font-extrabold text-gray-900">User Profile</h2> {/* More prominent title */}
                            <div>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200
                                                ${isEditing ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}
                                                focus:outline-none focus:ring-2 focus:ring-offset-2 ${isEditing ? 'focus:ring-red-500' : 'focus:ring-blue-500'}`}
                                >
                                    {isEditing ? 'Cancel' : 'Edit User'}
                                </button>
                                {isEditing && (
                                    <button
                                        onClick={handleUpdate}
                                        className="ml-3 px-5 py-2.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
                                    >
                                        Save Changes
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

                        {isEditing ? (
                            <form onSubmit={handleUpdate} className="space-y-6 py-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={formData.name || ''}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-4 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email || ''}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-4 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="contact_no" className="block text-sm font-medium text-gray-700 mb-1">Contact No.</label>
                                    <input
                                        type="text"
                                        name="contact_no"
                                        id="contact_no"
                                        value={formData.contact_no || ''}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-4 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                    <input
                                        type="text"
                                        name="role"
                                        id="role"
                                        value={formData.role || ''}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-4 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                    <input
                                        type="text"
                                        name="department"
                                        id="department"
                                        value={formData.department || ''}
                                        onChange={handleChange}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-4 text-base focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </form>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 py-4">
                                <div className="col-span-1">
                                    <dt className="text-base font-semibold text-gray-600">User ID</dt>
                                    <dd className="mt-2 text-lg text-gray-900">{user.id}</dd>
                                </div>
                                <div className="col-span-1">
                                    <dt className="text-base font-semibold text-gray-600">Name</dt>
                                    <dd className="mt-2 text-lg text-gray-900">{user.name}</dd>
                                </div>
                                <div className="col-span-1">
                                    <dt className="text-base font-semibold text-gray-600">Email</dt>
                                    <dd className="mt-2 text-lg text-gray-900">{user.email}</dd>
                                </div>
                                <div className="col-span-1">
                                    <dt className="text-base font-semibold text-gray-600">Contact No.</dt>
                                    <dd className="mt-2 text-lg text-gray-900">{user.contact_no || 'N/A'}</dd>
                                </div>
                                <div className="col-span-1">
                                    <dt className="text-base font-semibold text-gray-600">Role</dt>
                                    <dd className="mt-2 text-lg text-gray-900">{user.role || 'N/A'}</dd>
                                </div>
                                <div className="col-span-1">
                                    <dt className="text-base font-semibold text-gray-600">Department</dt>
                                    <dd className="mt-2 text-lg text-gray-900">{user.department || 'N/A'}</dd>
                                </div>
                                <div className="col-span-1">
                                    <dt className="text-base font-semibold text-gray-600">Created At</dt>
                                    <dd className="mt-2 text-lg text-gray-900">{new Date(user.created_at).toLocaleString()}</dd>
                                </div>
                                <div className="col-span-1">
                                    <dt className="text-base font-semibold text-gray-600">Last Updated</dt>
                                    <dd className="mt-2 text-lg text-gray-900">{new Date(user.updated_at).toLocaleString()}</dd>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};
