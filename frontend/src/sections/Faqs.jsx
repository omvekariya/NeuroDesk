import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import { twMerge } from "tailwind-merge";

import Tag from "../components/Tag";

const faqs = [
  {
    question: "How does the AI determine the best technician for a ticket?",
    answer:
      "Our AI analyzes ticket content using NLP, maps required skills, and matches them with technician skill profiles. It considers historical performance, resolution quality, and current workload to ensure optimal assignment.",
  },
  {
    question: "How quickly can we see improvements in SLA compliance?",
    answer:
      "Most organizations see significant improvements within the first 30 days. Our clients typically report 60-85% improvement in SLA compliance and 70% reduction in ticket assignment time.",
  },
  {
    question: "Does the system work with our existing ITSM tools?",
    answer:
      "Yes! Our platform integrates seamlessly with popular ITSM tools like ServiceNow, Jira Service Management, Zendesk, and others. We can also provide custom integrations for proprietary systems.",
  },
  {
    question: "How does the gamification system motivate technicians?",
    answer:
      "The system tracks resolution quality, provides skill badges, offers performance insights, and creates transparent career growth paths. Technicians can see their progress and receive recognition for quality work.",
  },
  {
    question: "What kind of training is required for our team?",
    answer:
      "Minimal training is required. The system is designed to work alongside your existing processes. We provide onboarding support and can customize the interface to match your team's workflow preferences.",
  },
];

export function Faqs() {
  const [selectedIndex, setSelectedIndex] = useState(0);

  return (
    <section className="py-24 justify-items-center">
      <div className="container">
        <div className="flex justify-center">
          <Tag>Frequently Asked Questions</Tag>
        </div>

        <h2 className="text-6xl font-medium mt-6 text-center max-w-xl mx-auto">
          Questions? We've got <span className="text-blue-600">answers</span>
        </h2>

        <div className="mt-12 flex flex-col gap-6 max-w-xl mx-auto">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              onClick={() => setSelectedIndex(index)}
              className="bg-white rounded-2xl border border-gray-200 p-6 cursor-pointer shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium m-0 text-gray-900">{faq.question}</h3>
                <Plus
                  size={30}
                  className={twMerge(
                    "text-blue-500 flex-shrink-0 transition duration-300",
                    selectedIndex === index && "rotate-45"
                  )}
                />
              </div>

              <AnimatePresence>
                {selectedIndex === index && (
                  <motion.div
                    initial={{ height: 0, marginTop: 0 }}
                    animate={{ height: "auto", marginTop: 24 }}
                    exit={{ height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-gray-600">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
