import React, { useState } from 'react';
import { X } from 'lucide-react';

export const CloseTicketModal = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
        feedback: '',
        satisfaction_rating: '',
        resolution_notes: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="bg-red fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Close Ticket</h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Satisfaction Rating (1-5)
                        </label>
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={formData.satisfaction_rating}
                            onChange={(e) => setFormData({...formData, satisfaction_rating: e.target.value})}
                            className="w-full border rounded p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Feedback
                        </label>
                        <textarea
                            value={formData.feedback}
                            onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                            maxLength={1000}
                            className="w-full border rounded p-2"
                            rows={3}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Resolution Notes
                        </label>
                        <textarea
                            value={formData.resolution_notes}
                            onChange={(e) => setFormData({...formData, resolution_notes: e.target.value})}
                            maxLength={1000}
                            className="w-full border rounded p-2"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 border rounded"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 text-white rounded"
                        >
                            Close Ticket
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};