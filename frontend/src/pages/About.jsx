import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from "../assets/logosaas.png";

export const About = () => {
  const [expandedSkills, setExpandedSkills] = useState({});

  const toggleSkills = (technicianId) => {
    setExpandedSkills(prev => ({
      ...prev,
      [technicianId]: !prev[technicianId]
    }));
  };

  // Sample technicians data
  const technicians = [
    {
      id: 1,
      name: "John Smith",
      role: "Senior IT Technician",
      avatar: "JS",
      skills: ["Network Troubleshooting", "Hardware Repair", "Software Installation", "System Administration"],
      experience: "8 years",
      availability: "Available",
      status: "online",
      rating: 4.8,
      completedTickets: 1247
    },
    {
      id: 2,
      name: "Sarah Johnson",
      role: "Network Specialist",
      avatar: "SJ",
      skills: ["Network Security", "Cisco Systems", "VPN Configuration", "Firewall Management"],
      experience: "6 years",
      availability: "Available",
      status: "online",
      rating: 4.9,
      completedTickets: 892
    },
    {
      id: 3,
      name: "Mike Chen",
      role: "Software Support Engineer",
      avatar: "MC",
      skills: ["Database Management", "API Integration", "Cloud Services", "DevOps"],
      experience: "5 years",
      availability: "On Break",
      status: "away",
      rating: 4.7,
      completedTickets: 756
    },
    {
      id: 4,
      name: "Emily Davis",
      role: "Hardware Technician",
      avatar: "ED",
      skills: ["PC Repair", "Laptop Maintenance", "Printer Support", "Hardware Upgrades"],
      experience: "4 years",
      availability: "Available",
      status: "online",
      rating: 4.6,
      completedTickets: 634
    },
    {
      id: 5,
      name: "David Wilson",
      role: "System Administrator",
      avatar: "DW",
      skills: ["Server Management", "Active Directory", "Backup Solutions", "Virtualization"],
      experience: "10 years",
      availability: "Busy",
      status: "busy",
      rating: 4.9,
      completedTickets: 1567
    },
    {
      id: 6,
      name: "Lisa Rodriguez",
      role: "Help Desk Specialist",
      avatar: "LR",
      skills: ["User Support", "Ticket Management", "Remote Assistance", "Documentation"],
      experience: "3 years",
      availability: "Available",
      status: "online",
      rating: 4.5,
      completedTickets: 445
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available': return 'text-green-600';
      case 'On Break': return 'text-yellow-600';
      case 'Busy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="antialiased bg-[#EAEEFE] min-h-screen">
      {/* Header */}
      <header className="sticky top-0 backdrop-blur-sm z-20">
        <div className="flex justify-center items-center py-3 bg-black text-white text-sm gap-3">
          <p className="text-white/60 hidden md:block">
            Streamline your workflow and boost your productivity
          </p>
          <div className="inline-flex gap-1 items-center">
            <p>Get started for free</p>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        <div className="py-5 justify-items-center">
          <div className="container">
            <div className="flex items-center justify-between">
              <Link to="/">
                <img src={logo} alt="Saas Logo" height={40} width={40} />
              </Link>
              <nav className="hidden md:flex gap-6 text-black/60 items-center">
                <Link to="/about" className="text-black font-medium">About</Link>
                <Link to="/" className="hover:text-black transition-colors">Features</Link>
                <Link to="/" className="hover:text-black transition-colors">Customers</Link>
                <Link to="/" className="hover:text-black transition-colors">Updates</Link>
                <Link to="/" className="hover:text-black transition-colors">Help</Link>
                <Link to="/" className="bg-black text-white px-4 py-2 rounded-lg font-medium inline-flex align-items justify-center tracking-tight hover:bg-[#001e80] transition-colors">
                  Get Started
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-16">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
              Our <span className="text-blue-600">Technicians</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Meet our expert team of IT technicians who are ready to resolve your technical issues 
              and provide exceptional support services.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-1">{technicians.length}</div>
                <p className="text-gray-600 text-sm">Total Technicians</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {technicians.filter(t => t.status === 'online').length}
                </div>
                <p className="text-gray-600 text-sm">Available Now</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {technicians.reduce((sum, t) => sum + t.completedTickets, 0).toLocaleString()}
                </div>
                <p className="text-gray-600 text-sm">Tickets Resolved</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {(technicians.reduce((sum, t) => sum + t.rating, 0) / technicians.length).toFixed(1)}
                </div>
                <p className="text-gray-600 text-sm">Avg. Rating</p>
              </div>
            </div>
          </div>

                    {/* Technicians Table */}
          <div className="flex justify-center">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden w-full max-w-7xl">
              <div className="overflow-x-auto">
                <table className="w-full">
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
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {technicians.map((technician) => (
                    <tr key={technician.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="relative">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-blue-600">{technician.avatar}</span>
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(technician.status)} rounded-full border-2 border-white`}></div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{technician.name}</div>
                            <div className="text-sm text-gray-500">{technician.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(technician.availability).replace('text-', 'bg-').replace('-600', '-100')} ${getAvailabilityColor(technician.availability)}`}>
                          {technician.availability}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {technician.experience}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {technician.completedTickets.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {expandedSkills[technician.id] 
                            ? technician.skills.map((skill, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))
                            : technician.skills.slice(0, 3).map((skill, index) => (
                                <span 
                                  key={index}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))
                          }
                          {technician.skills.length > 3 && (
                            <button 
                              onClick={() => toggleSkills(technician.id)}
                              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                            >
                              {expandedSkills[technician.id] ? 'Show Less' : `+${technician.skills.length - 3} more`}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs font-medium hover:bg-gray-200 transition-colors">
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                              </table>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <h2 className="text-3xl font-bold text-black mb-4">Need Technical Support?</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our technicians are ready to help you resolve any IT issues. Create a ticket and get connected with the right expert.
            </p>
            <Link 
              to="/"
              className="bg-black text-white px-8 py-4 rounded-lg font-medium inline-flex align-items justify-center tracking-tight hover:bg-[#001e80] transition-colors text-lg"
            >
              Create Support Ticket
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black text-[#BCBCBC] text-sm py-10 text-center justify-items-center">
        <div className="container">
          <div className="inline-flex relative before:content-[''] before:top-2 before:bottom-0 before:w-full before:blur before:bg-[linear-gradient(to_right,#f87bff,#FB92CF,#FFDD9B,#C2F0B1,#2FD8FE)] before:absolute">
            <Link to="/">
              <img src={logo} height={40} alt="SaaS logo" className="relative" />
            </Link>
          </div>

          <nav className="flex flex-col md:flex-row md:justify-center gap-6 mt-6">
            <Link to="/about" className="text-white">About</Link>
            <Link to="/" className="hover:text-white transition-colors">Features</Link>
            <Link to="/" className="hover:text-white transition-colors">Customers</Link>
            <Link to="/" className="hover:text-white transition-colors">Pricing</Link>
            <Link to="/" className="hover:text-white transition-colors">Help</Link>
            <Link to="/" className="hover:text-white transition-colors">Careers</Link>
          </nav>

          <p className="mt-6">
            &copy; 2025 mind array private limited, All rights reserved.
            <br />
            <a
              className="hover:text-white transition-all"
              href="https://github.com/MiladJoodi/Light-Saas-Landing-Page"
              target="_blank"
              rel="noopener noreferrer"
            >
              Copied with ❤️ by Gunjan
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}; 