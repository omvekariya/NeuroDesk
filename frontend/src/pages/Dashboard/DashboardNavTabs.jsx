import React from 'react';

export const DashboardNavTabs = ({ activeTab, onTabChange }) => {
    // Removed 'Reports' tab
    const tabs = [
        { id: 'overview', name: 'Overview' },
        { id: 'tickets', name: 'Tickets' },
        { id: 'technicians', name: 'Technicians' }
    ];

    return (
        <div className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav className="flex space-x-8">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {tab.name}
                        </button>
                    ))}
                </nav>
            </div>
        </div>
    );
};
