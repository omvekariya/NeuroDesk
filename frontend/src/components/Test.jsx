import React, { useState, useEffect } from 'react';
import usersApi from '../api/users'; // Adjust path as needed
import ticketsApi from '../api/tickets'; // Adjust path as needed

function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await usersApi.getAllUsers({ page: 1, limit: 100, role: 'user' });
                setUsers(data.data.users); // Assuming your API returns data in a 'data' field
                console.log(data.data)
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleCreateTicket = async (ticketData) => {
        try {
            const newTicket = await ticketsApi.createTicket(ticketData);
            console.log('Ticket created:', newTicket);
            // Optionally update UI or show success message
        } catch (err) {
            console.error('Error creating ticket:', err);
            // Handle error, show error message
        }
    };

    if (loading) return <div>Loading users...</div>;
    if (error) return <div>Error: {error.message || 'Something went wrong'}</div>;

    return (
        <div>
            <h1>Users</h1>
            <ul>
                {users.map((user) => (
                    <li key={user.id}>{user.name} ({user.email})</li>
                ))}
            </ul>
            <button onClick={() => handleCreateTicket({ subject: 'New Issue', description: 'This is a test issue', requester_id: 1 })}>
                Create Sample Ticket
            </button>
        </div>
    );
}

export default UserList;
