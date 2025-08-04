import React, { useState } from 'react';

import { Link } from 'react-router-dom';

export const TechniciansTable = React.memo(({ technicians, getTechnicianAvailabilityColor }) => {
    const [expandedSkills, setExpandedSkills] = useState({});

    const toggleSkills = (technicianId) => {
        setExpandedSkills(prev => ({
            ...prev,
            [technicianId]: !prev[technicianId]
        }));
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Technician
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Experience
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tickets
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Skills
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {technicians.map((technician) => (
                        <tr key={technician.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    <div className="relative">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <span className="text-sm font-bold text-blue-600">{technician.avatar}</span>
                                        </div>
                                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${technician.status === 'online' ? 'bg-green-500' : technician.status === 'away' ? 'bg-yellow-500' : 'bg-red-500'} rounded-full border-2 border-white`}></div>
                                    </div>
                                    <div className="ml-4">
                                        <Link to={`/technicians/${technician.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-900 hover:underline">
                                            {technician.name}
                                        </Link>
                                        <div className="text-sm text-gray-500">{technician.role}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTechnicianAvailabilityColor(technician.availability_status)}`}>
                                    {technician.availability_status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {technician.experience}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {technician.assigned_tickets_total.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                    {technician.skills && technician.skills.length > 0 ? (
                                        expandedSkills[technician.id]
                                            ? technician.skills.map((skill) => (
                                                <span
                                                    key={skill.id}
                                                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                                                >
                                                    {skill.name}
                                                </span>
                                            ))
                                            : technician.skills.slice(0, 3).map((skill) => (
                                                <span
                                                    key={skill.id}
                                                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                                                >
                                                    {skill.name}
                                                </span>
                                            ))
                                    ) : (
                                        <span className="px-2 py-1 bg-gray-50 text-gray-700 text-xs rounded-full">No Skills</span>
                                    )}
                                    {technician.skills && technician.skills.length > 3 && (
                                        <button
                                            onClick={() => toggleSkills(technician.id)}
                                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                                        >
                                            {expandedSkills[technician.id] ? 'Show Less' : `+${technician.skills.length - 3} more`}
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});
