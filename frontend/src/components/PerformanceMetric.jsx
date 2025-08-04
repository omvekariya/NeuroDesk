import React from "react";
import { motion } from "framer-motion";

const PerformanceMetric = ({ 
  metric, 
  value, 
  target, 
  trend, 
  icon, 
  color = "blue",
  size = "medium" 
}) => {
  const sizeClasses = {
    small: "p-4",
    medium: "p-6",
    large: "p-8"
  };

  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700"
  };

  const progressPercentage = Math.min((value / target) * 100, 100);
  const isOnTarget = value >= target;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`bg-white rounded-2xl border border-gray-200 ${sizeClasses[size]} shadow-sm hover:shadow-md transition-all duration-300`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className={`text-sm font-medium ${isOnTarget ? 'text-green-600' : 'text-orange-600'}`}>
          {trend}
        </div>
      </div>
      
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{metric}</h3>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-gray-900">{value}</span>
          <span className="text-sm text-gray-500">/ {target}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1 }}
            className={`h-2 rounded-full ${isOnTarget ? 'bg-green-500' : 'bg-orange-500'}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceMetric; 