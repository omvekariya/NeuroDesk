import React from "react";
import Tag from "../components/Tag";
import AnalyticsCard from "../components/AnalyticsCard";
import SkillChart from "../components/SkillChart";
import PerformanceMetric from "../components/PerformanceMetric";

// Icons (you can replace these with actual icon components)
const TicketIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
  </svg>
);

const TrendingIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const TargetIcon = () => (
  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
  </svg>
);

const skillData = [
  { name: "Network Troubleshooting", value: 85, color: "bg-blue-500" },
  { name: "Software Installation", value: 92, color: "bg-green-500" },
  { name: "Hardware Repair", value: 78, color: "bg-purple-500" },
  { name: "Security Issues", value: 88, color: "bg-orange-500" },
  { name: "User Training", value: 95, color: "bg-indigo-500" },
];

const teamSkills = [
  { name: "Sarah Chen", value: 94, color: "bg-blue-500" },
  { name: "Mike Rodriguez", value: 87, color: "bg-green-500" },
  { name: "Lisa Thompson", value: 91, color: "bg-purple-500" },
  { name: "David Kumar", value: 82, color: "bg-orange-500" },
  { name: "Emma Wilson", value: 89, color: "bg-indigo-500" },
];

export const Analytics = () => {
  return (
    <section className="py-24 pb-0 bg-gradient-to-b from-[#F8FAFF] to-white justify-items-center">
      <div className="container">
        <div className="section-heading">
          <div className="flex justify-center">
            <Tag>Analytics Dashboard</Tag>
          </div>
          <h2 className="section-title mt-5">
            Real-time insights into your IT operations
          </h2>
          <p className="section-description mt-5">
            Monitor performance metrics, track skill development, and optimize your support team's efficiency with AI-powered analytics.
          </p>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <AnalyticsCard
            title="Tickets Resolved"
            value="1,247"
            change="12.5%"
            changeType="positive"
            icon={<TicketIcon />}
            color="blue"
            description="This month"
          />
          <AnalyticsCard
            title="Avg Resolution Time"
            value="2.3h"
            change="8.2%"
            changeType="positive"
            icon={<ClockIcon />}
            color="green"
            description="Down from 2.5h"
          />
          <AnalyticsCard
            title="Team Satisfaction"
            value="4.8/5"
            change="15.3%"
            changeType="positive"
            icon={<StarIcon />}
            color="purple"
            description="Based on surveys"
          />
          <AnalyticsCard
            title="SLA Compliance"
            value="96.2%"
            change="3.1%"
            changeType="positive"
            icon={<TargetIcon />}
            color="orange"
            description="Target: 95%"
          />
        </div>

        {/* Performance Metrics and Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Performance Metrics */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900">Performance Targets</h3>
            <PerformanceMetric
              metric="First Response Time"
              value={15}
              target={20}
              trend="↘️ 25% faster"
              icon={<ClockIcon />}
              color="blue"
            />
            <PerformanceMetric
              metric="Customer Satisfaction"
              value={4.8}
              target={4.5}
              trend="↗️ Above target"
              icon={<StarIcon />}
              color="green"
            />
          </div>

          {/* Skill Distribution */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900">Skill Distribution</h3>
            <SkillChart
              skills={skillData}
              title="Team Skill Coverage"
            />
            <PerformanceMetric
              metric="Knowledge Base Articles"
              value={45}
              target={50}
              trend="↗️ 90% complete"
              icon={<TargetIcon />}
              color="purple"
            />
          </div>
        </div>

        {/* Team Performance */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-gray-900 text-center mb-8">Top Performers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkillChart
              skills={teamSkills}
              title="Individual Performance"
            />
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Achievements</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Sarah Chen resolved 15 critical tickets</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Mike Rodriguez achieved 98% SLA compliance</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-700">Lisa Thompson completed advanced training</span>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Trends</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Ticket Volume</span>
                    <span className="font-medium text-green-600">+12%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Resolution Quality</span>
                    <span className="font-medium text-blue-600">+8%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Team Growth</span>
                    <span className="font-medium text-purple-600">+15%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}; 
