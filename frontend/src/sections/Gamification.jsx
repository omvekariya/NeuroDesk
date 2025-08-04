import React from "react";
import { motion } from "framer-motion";
import Tag from "../components/Tag";
import avatar1 from "../assets/avatar-1.png";
import avatar2 from "../assets/avatar-2.png";
import avatar3 from "../assets/avatar-3.png";
import avatar4 from "../assets/avatar-4.png";
import avatar5 from "../assets/avatar-5.png";

const BadgeCard = ({ title, description, icon, color, progress, level }) => {
  const colorClasses = {
    gold: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    silver: "bg-gradient-to-br from-gray-300 to-gray-500",
    bronze: "bg-gradient-to-br from-orange-400 to-orange-600",
    blue: "bg-gradient-to-br from-blue-400 to-blue-600",
    purple: "bg-gradient-to-br from-purple-400 to-purple-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className={`w-12 h-12 rounded-full ${colorClasses[color]} flex items-center justify-center text-white text-xl`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">Level {level}</p>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            transition={{ duration: 1 }}
            className={`h-2 rounded-full ${colorClasses[color]}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

const LeaderboardItem = ({ rank, name, score, avatar, department, change }) => {
  const rankColors = {
    1: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    2: "bg-gradient-to-br from-gray-300 to-gray-500", 
    3: "bg-gradient-to-br from-orange-400 to-orange-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
        rank <= 3 ? rankColors[rank] : 'bg-gray-400'
      }`}>
        {rank}
      </div>
      
      <img src={avatar} alt={name} className="w-10 h-10 rounded-full" />
      
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{name}</h4>
        <p className="text-sm text-gray-600">{department}</p>
      </div>
      
      <div className="text-right">
        <div className="font-semibold text-gray-900">{score} pts</div>
        <div className={`text-xs ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? '+' : ''}{change}
        </div>
      </div>
    </motion.div>
  );
};

export const Gamification = () => {
  const badges = [
    {
      title: "Speed Demon",
      description: "Resolve tickets faster than 90% of the team",
      icon: "⚡",
      color: "gold",
      progress: 85,
      level: 3
    },
    {
      title: "Quality Master",
      description: "Maintain 95%+ customer satisfaction rating",
      icon: "🏆",
      color: "purple",
      progress: 92,
      level: 4
    },
    {
      title: "Knowledge Seeker",
      description: "Complete advanced training modules",
      icon: "📚",
      color: "blue",
      progress: 78,
      level: 2
    },
    {
      title: "Team Player",
      description: "Help colleagues with complex issues",
      icon: "🤝",
      color: "silver",
      progress: 95,
      level: 5
    }
  ];

  const leaderboard = [
    { rank: 1, name: "Sarah Chen", score: 2847, avatar: avatar1, department: "Network Support", change: 12 },
    { rank: 2, name: "Mike Rodriguez", score: 2653, avatar: avatar2, department: "Software Support", change: 8 },
    { rank: 3, name: "Lisa Thompson", score: 2489, avatar: avatar3, department: "Hardware Support", change: 15 },
    { rank: 4, name: "David Kumar", score: 2341, avatar: avatar4, department: "Security", change: -3 },
    { rank: 5, name: "Emma Wilson", score: 2218, avatar: avatar5, department: "User Training", change: 6 }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-white to-[#F8FAFF] justify-items-center">
      <div className="container">
        <div className="section-heading">
          <div className="flex justify-center">
            <Tag>Gamification</Tag>
          </div>
          <h2 className="section-title mt-5">
            Motivate your team with intelligent rewards
          </h2>
          <p className="section-description mt-5">
            Transform routine support tasks into engaging challenges with skill badges, performance leaderboards, and achievement recognition that drives continuous improvement.
          </p>
        </div>

        {/* Achievement Badges */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold text-gray-900 text-center mb-8">Achievement Badges</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {badges.map((badge, index) => (
              <BadgeCard key={index} {...badge} />
            ))}
          </div>
        </div>

        {/* Leaderboard and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Leaderboard */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-6">Performance Leaderboard</h3>
            <div className="space-y-3">
              {leaderboard.map((item, index) => (
                <LeaderboardItem key={index} {...item} />
              ))}
            </div>
          </div>

          {/* Gamification Stats */}
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold text-gray-900">Gamification Impact</h3>
            
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">This Month's Achievements</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm text-gray-700">Badges Earned</span>
                  <span className="font-semibold text-blue-600">47</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-gray-700">Skill Points Gained</span>
                  <span className="font-semibold text-green-600">1,284</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm text-gray-700">Training Completed</span>
                  <span className="font-semibold text-purple-600">23</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm text-gray-700">Peer Recognition</span>
                  <span className="font-semibold text-orange-600">156</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Motivation Metrics</h4>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Team Engagement</span>
                    <span className="font-medium text-green-600">+34%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Skill Development</span>
                    <span className="font-medium text-blue-600">+28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Knowledge Sharing</span>
                    <span className="font-medium text-purple-600">+41%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '76%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white"
          >
            <h3 className="text-2xl font-bold mb-4">Ready to gamify your IT support?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Join hundreds of IT teams who have transformed their support operations with intelligent gamification and skill tracking.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Start Free Trial
              </button>
              <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}; 