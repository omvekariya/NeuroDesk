import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Loader2 } from 'lucide-react';
import authApi from '../api/auth';
import logo from "../assets/logosaas.png";

export const LoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!formData.email || !formData.password) {
            setError('Please enter both email and password.');
            setLoading(false);
            return;
        }

        try {
            const response = await authApi.login(formData); // This response is already response.data from Axios

            if (response.success) { // Check response.success directly
                setSuccessMessage('Login successful! Redirecting to dashboard...');

                // Store complete user data
                if (response.data) {
                    const userData = {
                        name: response.data.name || formData.email.split('@')[0], // Use name or email prefix as fallback
                        email: response.data.email || formData.email,
                        role: response.data.role || 'user', // Default role (lowercase to match registration)
                        id: response.data.id || null
                    };
                    console.log("Storing user data:", userData);
                    localStorage.setItem('user', JSON.stringify(userData));
                } else {
                    console.warn("Login response did not contain user data as expected:", response);
                    // Fallback: create user data from form data
                    const fallbackUserData = {
                        name: formData.email.split('@')[0],
                        email: formData.email,
                        role: 'user', // Default role (lowercase)
                        id: null
                    };
                    console.log("Storing fallback user data:", fallbackUserData);
                    localStorage.setItem('user', JSON.stringify(fallbackUserData));
                }

                // If you also get a token, store it (assuming 'response.token')
                // if (response.token) {
                //     localStorage.setItem('authToken', response.token);
                // }

                setTimeout(() => {
                    // Redirect based on user role
                    const storedUser = localStorage.getItem('user');
                    console.log("Stored user data for redirect:", storedUser);
                    
                    if (storedUser) {
                        try {
                            const userData = JSON.parse(storedUser);
                            const userRole = userData.role?.toLowerCase() || 'user';
                            console.log("Redirecting to role:", userRole);
                            
                            // Redirect admin users to dashboard instead of admin page
                            if (userRole === 'admin') {
                                navigate('/dashboard');
                            } else {
                                navigate(`/${userRole}`);
                            }
                        } catch (error) {
                            console.error("Error parsing user data for redirect:", error);
                            navigate('/user'); // Fallback to user page
                        }
                    } else {
                        console.log("No stored user data, redirecting to /user");
                        navigate('/user'); // Fallback to user page
                    }
                }, 1500);
            } else {
                // If response.success is false, the message is likely at response.message
                setError(response.message || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            // For Axios errors, err.response.data might contain the error message from backend
            setError(err.response?.data?.message || err.message || 'An unexpected error occurred during login.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <img className="mx-auto h-12 w-auto" src={logo} alt="ITSM Logo" />
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600 max-w">
                    Or {' '}
                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                        create a new account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="p-3 text-sm text-red-700 bg-red-100 rounded-md" role="alert">
                                {error}
                            </div>
                        )}
                        {successMessage && (
                            <div className="p-3 text-sm text-green-700 bg-green-100 rounded-md" role="alert">
                                {successMessage}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full pl-10 px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Forgot your password?
                                </a>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                ) : (
                                    <LogIn className="h-5 w-5 mr-2" />
                                )}
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
