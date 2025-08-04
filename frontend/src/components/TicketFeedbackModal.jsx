import React, { useState, useEffect } from 'react';
import { XCircle, Star, Loader2 } from 'lucide-react';
import ticketsApi from '../api/tickets'; // Import your tickets API

export const TicketFeedbackModal = ({ isOpen, onClose, ticketId, onFeedbackSubmitted }) => {
    const [rating, setRating] = useState(0); // 0 means no star selected
    const [comments, setComments] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Reset form when modal opens or ticketId changes
    useEffect(() => {
        if (isOpen) {
            setRating(0);
            setComments('');
            setSubmitError(null);
            setSubmitSuccess(false);
        }
    }, [isOpen, ticketId]);

    if (!isOpen) return null; // Don't render if not open

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (rating === 0) {
            setSubmitError('Please select a satisfaction rating.');
            return;
        }

        setSubmitting(true);
        setSubmitError(null);
        setSubmitSuccess(false);

        try {
            const feedbackPayload = {
                satisfaction_rating: rating,
                feedback: comments, // This maps to the 'feedback' field in your Ticket model
            };

            const response = await ticketsApi.updateTicket(ticketId, feedbackPayload); //

            if (response.success) { //
                setSubmitSuccess(true);
                // Call parent callback if needed, e.g., to refresh ticket details
                if (onFeedbackSubmitted) {
                    onFeedbackSubmitted(response.data); // Pass updated ticket data
                }
                // Close modal after a short delay to show success message
                setTimeout(() => {
                    onClose();
                }, 1500);
            } else {
                setSubmitError(response.message || 'Failed to submit feedback.'); //
            }
        } catch (err) {
            console.error('Feedback submission error:', err);
            setSubmitError(err.response?.data?.message || err.message || 'An unexpected error occurred during feedback submission.'); //
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <h3 className="text-xl font-semibold text-gray-900">Provide Ticket Feedback</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XCircle className="h-6 w-6" />
                    </button>
                </div>

                {submitSuccess && (
                    <div className="p-3 mb-4 rounded-md text-sm bg-green-100 text-green-800">
                        Thank you for your feedback!
                    </div>
                )}
                {submitError && (
                    <div className="p-3 mb-4 rounded-md text-sm bg-red-100 text-red-800">
                        Error: {submitError}
                    </div>
                )}
                {submitting && (
                    <div className="p-3 mb-4 rounded-md text-sm bg-blue-100 text-blue-800 flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" /> Submitting feedback...
                    </div>
                )}

                <p className="text-sm text-gray-600 mb-4">Please let us know about your experience with ticket #{ticketId}.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Overall Satisfaction:</label>
                        <div className="flex items-center gap-1"> {/* Adjusted gap for stars */}
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={`h-8 w-8 cursor-pointer transition-colors duration-150 ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                                    fill="currentColor"
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                        {rating === 0 && <p className="text-red-500 text-xs mt-1">Rating is required.</p>}
                    </div>

                    <div>
                        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">Additional Comments (Optional):</label>
                        <textarea
                            id="comments"
                            rows="4"
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Type your feedback here..."
                        ></textarea>
                    </div>

                    <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={submitting}
                        >
                            Submit Feedback
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
