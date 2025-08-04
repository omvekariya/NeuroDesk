import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../../assets/logosaas.png"; // Adjust path as necessary

export const DashboardHeader = ({ user }) => { // Accept user prop
    const navigate = useNavigate();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const userInitials = user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??';
    const userName = user?.name || 'Guest';
    const userRole = user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User';



    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken'); // Assuming you might store a token
        navigate('/login');
    };
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-4">
                    <div className="flex items-center">
                        <img src={logo} alt="Logo" className="h-8 w-8 mr-3" />
                        <h1 className="text-xl font-semibold text-gray-900">ITSM Dashboard</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button className="text-gray-500 hover:text-gray-700">
                        </button>
                        <div className="relative" ref={dropdownRef}>
                            <div
                                className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">{userInitials}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-700">{userName}</span>
                                    <span className="text-xs text-gray-500">{userRole}</span>
                                </div>
                                <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                                    <div className="font-medium">{userName}</div>
                                    <div className="text-gray-500">{userRole}</div>
                                </div>

                                {/* Role-specific dashboard links */}
                                <button
                                    onClick={() => {
                                        navigate('/dashboard');
                                        setIsDropdownOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                                        </svg>
                                        Main Dashboard
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        // For admin users, stay on dashboard instead of going to /admin
                                        if (userRole.toLowerCase() === 'admin') {
                                            navigate('/dashboard');
                                        } else {
                                            navigate(`/${userRole.toLowerCase()}`);
                                        }
                                        setIsDropdownOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        {userRole.toLowerCase() === 'admin' ? 'Main Dashboard' : `${userRole} Dashboard`}
                                    </div>
                                </button>

                                <div className="border-t border-gray-100 my-1"></div>

                                <button
                                    onClick={handleLogout}
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex items-center">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign out
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header >
    );
};

