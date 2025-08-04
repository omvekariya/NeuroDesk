import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Tag, User, Calendar, Clock, MessageSquare, History, CheckCircle, ArrowRight, Layers, Shield, Star, ThumbsUp, GitCommitVertical, ArrowLeft, Plus, Edit, Trash2, XCircle, Loader2, Send // ADDED Send HERE
} from 'lucide-react';
import ticketsApi from '../api/tickets';
import skillsApi from '../api/skills'; // To fetch available skills
import logo from "../assets/logosaas.png";

export const TicketCreatePage = () => {
    const navigate = useNavigate();
    const [loggedInUser, setLoggedInUser] = useState(null);

    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        status: 'new', // Default status as per your model
        priority: 'normal', // Default priority
        impact: 'medium', // Default impact
        urgency: 'normal', // Default urgency
        tags: '', // Comma-separated string for input, will be converted to array
        required_skills: [], // Array of skill IDs
        requester_id: 1, // FIX: This should be dynamic, e.g., from auth context or selected by admin
        assigned_technician_id: 1 // Initially unassigned
    });

    const [availableSkills, setAvailableSkills] = useState([]); // State to store skills from API
    const [loading, setLoading] = useState(false);
    const [creatingTicket, setCreatingTicket] = useState(false); // New state for ticket creation loading
    const [aiProgress, setAiProgress] = useState(0); // Track AI assignment progress
    const [pageError, setPageError] = useState(null); // Error for initial skill fetch or form submission
    const [submitMessage, setSubmitMessage] = useState(null); // Success/error message after submission

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

        const fetchSkills = async () => {
            setLoading(true);
            try {
                const response = await skillsApi.getAllSkillsSimple(); // Assuming this returns { data: [...], total: X } or just [...]
                setAvailableSkills(response.data || response); // Adjust based on exact response structure
            } catch (err) {
                console.error("Failed to fetch skills:", err);
                setPageError("Failed to load skills. Please try again later.");
            } finally {
                setLoading(false);
            }
        };
        fetchSkills();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked, options } = e.target;

        if (name === 'required_skills') {
            // Handle multi-select for skills
            const selectedSkills = Array.from(options)
                .filter(option => option.selected)
                .map(option => parseInt(option.value)); // Convert to integer IDs
            setFormData(prev => ({ ...prev, [name]: selectedSkills }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setCreatingTicket(true);
        setSubmitMessage(null);
        setPageError(null);

        try {
            // Prepare data for submission
            const dataToSubmit = {
                ...formData,
                tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
                // Ensure requester_id is set. For a real app, this would come from auth context.
                // For now, let's hardcode or make configurable.
                requester_id: formData.requester_id || 1 // Fallback if not set
            };

            const response = await ticketsApi.createTicket(dataToSubmit);

            if (response.success) {
                // Show AI assignment loading for 10 seconds with progress
                const startTime = Date.now();
                const duration = 10000; // 10 seconds
                
                const progressInterval = setInterval(() => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min((elapsed / duration) * 100, 100);
                    setAiProgress(progress);
                }, 100);
                
                await new Promise(resolve => setTimeout(resolve, duration));
                clearInterval(progressInterval);
                
                setSubmitMessage(`Ticket #${response.data.id} created successfully!`);
                setFormData({ // Reset form
                    subject: '',
                    description: '',
                    status: 'new',
                    priority: 'normal',
                    impact: 'medium',
                    urgency: 'normal',
                    tags: '',
                    required_skills: [],
                    requester_id: 1,
                    assigned_technician_id: null
                });
                // Navigate to the new ticket's detail page after 10 seconds
                navigate(`/tickets/${response.data.id}`);
            } else {
                throw new Error(response.message || 'Failed to create ticket.');
            }
        } catch (err) {
            console.error('Error creating ticket:', err);
            setPageError(err.message || 'An unexpected error occurred during submission.');
            setSubmitMessage('Ticket creation failed!');
        } finally {
            setCreatingTicket(false);
            setAiProgress(0); // Reset progress
            setTimeout(() => setSubmitMessage(null), 3000); // Clear message after 3 seconds
        }
    };

    return (
        <div className="antialiased bg-gray-100 min-h-screen flex flex-col">
            {/* Header - Consistent with UserDetails and TechnicianProfilePage */}
            <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center">
                            <img src={logo} alt="Logo" className="h-9 w-9 mr-3" />
                            <h1 className="text-xl font-semibold text-gray-900">New Ticket</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-colors duration-200"
                            >
                                <span className="flex items-center">
                                    <ArrowLeft size={16} className="mr-1.5" />
                                    Back
                                </span>
                            </button>
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

            {/* Main Content Area */}
            <main className="flex-grow max-w-7xl mx-auto py-8 sm:px-6 lg:px-8 w-full">
                <div className="bg-white shadow-xl rounded-lg p-8">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Create New Ticket</h2>

                    {/* Submission Messages */}
                    {submitMessage && (
                        <div className={`p-4 mb-4 rounded-md text-base ${submitMessage.includes('successfully') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {submitMessage}
                        </div>
                    )}
                    {pageError && (
                        <div className="p-4 mb-4 rounded-md text-base bg-red-100 text-red-800">
                            Error: {pageError}
                        </div>
                    )}
                    {creatingTicket && (
                        <div className="p-6 mb-6 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
                            <div className="flex items-center justify-center gap-4">
                                <div className="relative">
                                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                                    <div className="absolute inset-0 rounded-full border-2 border-indigo-200 animate-pulse"></div>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-lg font-semibold text-indigo-900 mb-1">AI is auto-assigning the best technician...</h3>
                                    <p className="text-sm text-indigo-700">
                                        {aiProgress < 30 && "Analyzing ticket requirements and skill matches..."}
                                        {aiProgress >= 30 && aiProgress < 60 && "Evaluating technician availability and workload..."}
                                        {aiProgress >= 60 && aiProgress < 90 && "Calculating optimal assignment based on priority..."}
                                        {aiProgress >= 90 && "Finalizing assignment and preparing notification..."}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Progress Bar */}
                            <div className="mt-4">
                                <div className="w-full bg-indigo-200 rounded-full h-2">
                                    <div 
                                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300 ease-out"
                                        style={{ width: `${aiProgress}%` }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-xs text-indigo-600 mt-1">
                                    <span>0%</span>
                                    <span>{Math.round(aiProgress)}%</span>
                                    <span>100%</span>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex justify-center">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Subject */}
                        <div>
                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                            <input
                                type="text"
                                name="subject"
                                id="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-4 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                                maxLength="500"
                            />
                            <p className="mt-1 text-xs text-gray-500">Max 500 characters.</p>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                id="description"
                                rows="6"
                                value={formData.description}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-4 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                required
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Priority */}
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                <select
                                    name="priority"
                                    id="priority"
                                    value={formData.priority}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-4 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            {/* Impact */}
                            <div>
                                <label htmlFor="impact" className="block text-sm font-medium text-gray-700 mb-1">Impact</label>
                                <select
                                    name="impact"
                                    id="impact"
                                    value={formData.impact}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-4 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>

                            {/* Urgency */}
                            <div>
                                <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                                <select
                                    name="urgency"
                                    id="urgency"
                                    value={formData.urgency}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-4 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="low">Low</option>
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                    <option value="critical">Critical</option>
                                </select>
                            </div>
                        </div>

                        {/* Tags */}
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                            <input
                                type="text"
                                name="tags"
                                id="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-4 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="e.g., network, software, printer"
                            />
                        </div>

                        {/* Required Skills */}
                        <div>
                            <label htmlFor="required_skills" className="block text-sm font-medium text-gray-700 mb-1">Required Skills</label>
                            {loading && <p className="text-gray-500 text-sm">Loading skills...</p>}
                            {pageError && <p className="text-red-500 text-sm">Error loading skills: {pageError}</p>}
                            {!loading && !pageError && availableSkills.length > 0 && (
                                <select
                                    name="required_skills"
                                    id="required_skills"
                                    multiple
                                    value={formData.required_skills}
                                    onChange={handleChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2.5 px-4 text-base focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 h-40 overflow-y-auto"
                                >
                                    {availableSkills.map(skill => (
                                        <option key={skill.id} value={skill.id}>
                                            {skill.name}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {!loading && !pageError && availableSkills.length === 0 && (
                                <p className="text-gray-500 text-sm">No skills available. Please add skills via the admin panel.</p>
                            )}
                            <p className="mt-1 text-xs text-gray-500">Hold Ctrl (Windows) or Cmd (Mac) to select multiple skills.</p>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                disabled={creatingTicket || loading}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creatingTicket ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        Creating Ticket...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-5 w-5 mr-2" />
                                        Create Ticket
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};
