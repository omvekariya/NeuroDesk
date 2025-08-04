import React, { useState, useEffect, useCallback } from 'react';
import { DashboardHeader } from './Dashboard/DashboardHeader';
import { DashboardNavTabs } from './Dashboard/DashboardNavTabs';
import { OverviewTab } from './Dashboard/OverviewTab';
import { TicketsTab } from './Dashboard/TicketsTab';
import { TechniciansTab } from './Dashboard/TechniciansTab';

export const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [loggedInUser, setLoggedInUser] = useState(null); // State to store logged-in user info

    // States that might be needed across tabs (like overview stats)
    const [overviewStats, setOverviewStats] = useState({
        totalTickets: 0,
        openTickets: 0,
        resolvedToday: 0,
        avgResponseTime: 'N/A',
        totalTechniciansOverview: 0,
        availableTechsOverview: 0,
        totalTicketsResolvedOverall: 0,
        avgTechnicianRating: 'N/A'
    });
    const [recentTickets, setRecentTickets] = useState([]);

    // Effect to load user info from localStorage
    useEffect(() => {
        const userString = localStorage.getItem('user');
        console.log("Raw user string from localStorage:", userString);
        
        if (userString) {
            try {
                const userData = JSON.parse(userString);
                setLoggedInUser(userData);
                console.log("Parsed user data:", userData);
            } catch (error) {
                console.error("Error parsing user data:", error);
                // Handle legacy string format
                const legacyUser = { name: userString, role: 'User' };
                setLoggedInUser(legacyUser);
                console.log("Using legacy user format:", legacyUser);
            }
        } else {
            console.log("No user data found in localStorage");
            // Optionally redirect to login if no user is found
            // navigate('/login');
        }
    }, []);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
    };

    return (
        <div className="antialiased bg-gray-50 min-h-screen">
            <DashboardHeader user={loggedInUser} /> {/* Pass loggedInUser to Header */}
            <DashboardNavTabs activeTab={activeTab} onTabChange={handleTabChange} />

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {activeTab === 'overview' && (
                    <OverviewTab
                        loading={loading}
                        setLoading={setLoading}
                        error={error}
                        setError={setError}
                        overviewStats={overviewStats}
                        setOverviewStats={setOverviewStats}
                        recentTickets={recentTickets}
                        setRecentTickets={setRecentTickets}
                    />
                )}

                {activeTab === 'tickets' && (
                    <TicketsTab
                        loading={loading}
                        setLoading={setLoading}
                        error={error}
                        setError={setError}
                    />
                )}

                {activeTab === 'technicians' && (
                    <TechniciansTab
                        loading={loading}
                        setLoading={setLoading}
                        error={error}
                        setError={setError}
                        overviewStats={overviewStats}
                        setOverviewStats={setOverviewStats}
                    />
                )}
            </main>
        </div>
    );
};
