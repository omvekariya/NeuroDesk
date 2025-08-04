import React from "react";
import { motion } from "framer-motion";

const ComparisonTable = () => {
  const features = [
    {
      feature: "Ticket Assignment",
      traditional: "Manual assignment by managers",
      aiPowered: "AI-powered automatic routing based on skills",
      benefit: "70% faster assignment"
    },
    {
      feature: "Skill Assessment",
      traditional: "Static skill profiles, manual updates",
      aiPowered: "Dynamic skill evolution with every ticket",
      benefit: "Real-time skill tracking"
    },
    {
      feature: "Performance Tracking",
      traditional: "Basic metrics (speed, volume)",
      aiPowered: "Quality-based scoring with depth analysis",
      benefit: "Quality over quantity focus"
    },
    {
      feature: "Team Motivation",
      traditional: "Limited recognition systems",
      aiPowered: "Gamified achievements and leaderboards",
      benefit: "34% higher engagement"
    },
    {
      feature: "SLA Compliance",
      traditional: "Reactive monitoring",
      aiPowered: "Proactive optimization with AI insights",
      benefit: "85% improvement in compliance"
    },
    {
      feature: "Training & Development",
      traditional: "Generic training programs",
      aiPowered: "Personalized learning paths based on gaps",
      benefit: "Targeted skill development"
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-soft"
    >
      <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
        Traditional vs AI-Powered ITSM
      </h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-4 font-semibold text-gray-900">Feature</th>
              <th className="text-center py-4 px-4 font-semibold text-gray-600">Traditional Approach</th>
              <th className="text-center py-4 px-4 font-semibold text-blue-600">AI-Powered Solution</th>
              <th className="text-center py-4 px-4 font-semibold text-green-600">Benefit</th>
            </tr>
          </thead>
          <tbody>
            {features.map((item, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-4 px-4 font-medium text-gray-900">
                  {item.feature}
                </td>
                <td className="py-4 px-4 text-center text-gray-600">
                  <div className="flex items-center justify-center">
                    <span className="text-red-500 mr-2">✗</span>
                    {item.traditional}
                  </div>
                </td>
                <td className="py-4 px-4 text-center text-blue-600 font-medium">
                  <div className="flex items-center justify-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {item.aiPowered}
                  </div>
                </td>
                <td className="py-4 px-4 text-center text-green-600 font-semibold">
                  {item.benefit}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
        <div className="flex items-center justify-center gap-2 text-blue-700 font-semibold">
          <span className="text-2xl">📈</span>
          <span>Average improvement: 65% across all metrics</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ComparisonTable; 