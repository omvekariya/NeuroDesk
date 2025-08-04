import React from "react";
import { motion } from "framer-motion";

const AnalyticsCard = ({ 
  title, 
  value, 
  change, 
  changeType = "positive", 
  icon, 
  color = "blue",
  description 
}) => {
  const colorClasses = {
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    green: "bg-green-50 border-green-200 text-green-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    orange: "bg-orange-50 border-orange-200 text-orange-700",
    indigo: "bg-indigo-50 border-indigo-200 text-indigo-700"
  };

  const changeColorClasses = {
    positive: "text-green-600",
    negative: "text-red-600",
    neutral: "text-gray-600"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className={`text-sm font-medium ${changeColorClasses[changeType]}`}>
          {changeType === "positive" && "+"}
          {change}
        </div>
      </div>
      
      <div className="mb-2">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        <p className="text-gray-600 text-sm">{title}</p>
      </div>
      
      {description && (
        <p className="text-gray-500 text-xs">{description}</p>
      )}
    </motion.div>
  );
};

export default AnalyticsCard; 