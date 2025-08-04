import React, { useState } from 'react';

const statusOptions = ['new', 'assigned', 'in_progress', 'on_hold', 'resolved', 'closed', 'cancelled'];
const priorityOptions = ['low', 'normal', 'high', 'critical'];
const impactOptions = ['low', 'medium', 'high', 'critical'];
const urgencyOptions = ['low', 'normal', 'high', 'critical'];
const satisfactionOptions = [1, 2, 3, 4, 5];

export const TicketForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        status: '',
        priority: 'normal',
        impact: 'medium',
        urgency: 'normal',
        tags: '',
        requester_id: '',
        assigned_technician_id: '',
        satisfaction_rating: '',
        feedback: '',
        requestOnBehalf: false,
        requester_name: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const processedData = {
            ...formData,
            tags: formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0),
            requester_id: formData.requester_id ? parseInt(formData.requester_id, 10) : null,
            assigned_technician_id: formData.assigned_technician_id ? parseInt(formData.assigned_technician_id, 10) : null,
            satisfaction_rating: formData.satisfaction_rating ? parseInt(formData.satisfaction_rating, 10) : null
        };
        onSubmit(processedData);
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-4xl font-extrabold mb-8 text-indigo-700 tracking-wide">Create New Support Ticket</h2>

            <label className="block mb-3 text-sm font-semibold text-indigo-900" htmlFor="subject">Subject</label>
            <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                minLength={5}
                maxLength={500}
                autoComplete="off"
                spellCheck="false"
                className="w-full rounded-lg border-2 border-indigo-300 bg-indigo-50 px-5 py-4 text-lg text-indigo-900 placeholder-indigo-400 shadow-lg transition duration-300 ease-in-out focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
                placeholder="Enter a clear and concise subject"
            />

            <label className="block mb-3 mt-6 text-sm font-semibold text-indigo-900" htmlFor="description">Description</label>
            <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                spellCheck="true"
                className="w-full resize-none rounded-lg border-2 border-indigo-300 bg-indigo-50 px-5 py-4 text-lg text-indigo-900 placeholder-indigo-400 shadow-lg transition duration-300 ease-in-out focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
                placeholder="Describe your issue with relevant details"
            />

            <div className="grid grid-cols-1 gap-8 mt-8">
                <div className="flex items-center space-x-4">
                    <input
                        type="checkbox"
                        id="requestOnBehalf"
                        name="requestOnBehalf"
                        checked={formData.requestOnBehalf}
                        onChange={handleChange}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="requestOnBehalf" className="text-indigo-900 font-semibold text-sm">
                        Request on behalf of someone else
                    </label>
                </div>

                {formData.requestOnBehalf && (
                    <div className="mt-4">
                        <label htmlFor="requester_name" className="block mb-2 text-sm font-semibold text-indigo-900">
                            Requester Name
                        </label>
                        <input
                            type="text"
                            id="requester_name"
                            name="requester_name"
                            value={formData.requester_name}
                            onChange={handleChange}
                            placeholder="Enter the name of the person you are requesting on behalf of"
                            className="w-full rounded-lg border-2 border-indigo-300 bg-indigo-50 px-5 py-4 text-lg text-indigo-900 placeholder-indigo-400 shadow-md transition duration-300 ease-in-out focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
                        />
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
                <div>
                    <label className="block mb-3 text-sm font-semibold text-indigo-900" htmlFor="priority">Priority</label>
                    <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full rounded-lg border-2 border-indigo-300 bg-indigo-50 px-5 py-4 text-lg text-indigo-900 shadow-md transition duration-300 ease-in-out focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
                    >
                        {priorityOptions.map(opt => (
                            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block mb-3 text-sm font-semibold text-indigo-900" htmlFor="impact">Impact</label>
                    <select
                        id="impact"
                        name="impact"
                        value={formData.impact}
                        onChange={handleChange}
                        className="w-full rounded-lg border-2 border-indigo-300 bg-indigo-50 px-5 py-4 text-lg text-indigo-900 shadow-md transition duration-300 ease-in-out focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
                    >
                        {impactOptions.map(opt => (
                            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block mb-3 text-sm font-semibold text-indigo-900" htmlFor="urgency">Urgency</label>
                    <select
                        id="urgency"
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleChange}
                        className="w-full rounded-lg border-2 border-indigo-300 bg-indigo-50 px-5 py-4 text-lg text-indigo-900 shadow-md transition duration-300 ease-in-out focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600"
                    >
                        {urgencyOptions.map(opt => (
                            <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                type="submit"
                className="mt-10 w-full rounded-lg bg-gradient-to-r from-indigo-700 to-indigo-600 px-8 py-4 text-center text-xl font-bold text-white shadow-xl hover:from-indigo-800 hover:to-indigo-700 focus:outline-none focus:ring-6 focus:ring-indigo-400 focus:ring-offset-2 transition"
            >
                Submit Ticket
            </button>
        </form>
    );
};

export default TicketForm;

