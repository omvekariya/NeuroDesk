import FeatureCard from "../components/FeatureCard";
import Tag from "../components/Tag";
import avatar1 from "../assets/images/avatar-ashwin-santiago.jpg";
import avatar2 from "../assets/images/avatar-florence-shaw.jpg";
import avatar3 from "../assets/images/avatar-lula-meyers.jpg";
// import ellipsis from "../assets/icons/ellipsis.svg";
import Key from "../components/Key";
import Avatar from "../components/Avatar";
import ComparisonTable from "../components/ComparisonTable";
import { motion } from "framer-motion";

const features = [
  "Smart Routing",
  "Skill Tracking",
  "Performance Analytics",
  "Gamification",
  "AI Insights",
  "SLA Optimization",
  "Dynamic Profiles",
];

const parentVariants = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.7,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export function Features() {
  return (
    <section className="py-24 justify-items-center">
      <div className="container">
        <div className="flex justify-center">
          <Tag>Key Features</Tag>
        </div>

        <h2 className="text-6xl font-medium text-center mt-6 max-w-2xl m-auto">
          Where AI meets <span className="text-blue-600">efficiency</span>
        </h2>

        <motion.div variants={parentVariants} initial="hidden" animate="visible">
          <div className="mt-12 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-8">

            {/* Smart Ticket Routing */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <FeatureCard
                title="Smart Ticket Routing"
                description="AI-powered matching that assigns tickets to the best-fit technician based on live skill tags and performance history"
                className="md:col-span-2 lg:col-span-1"
              >
                <div className="aspect-video flex items-center justify-center">
                  <Avatar className="z-40">
                    <img src={avatar1} alt="Avatar 1" className="rounded-full" />
                  </Avatar>
                  <Avatar className="-ml-6 border-blue-500 z-30">
                    <img src={avatar2} alt="Avatar 2" className="rounded-full" />
                  </Avatar>
                  <Avatar className="-ml-6 border-indigo-500 z-20">
                    <img src={avatar3} alt="Avatar 3" className="rounded-full" />
                  </Avatar>
                  <Avatar className="-ml-6 border-transparent z-10">
                    <div className="rounded-full flex justify-center items-center size-full bg-gray-300">
                      {/* <img src={ellipsis} alt="Ellipsis" className="w-6 h-6" /> */}
                    </div>
                  </Avatar>
                </div>
              </FeatureCard>
            </motion.div>

            {/* Performance Analytics */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <FeatureCard
                title="Performance Analytics"
                description="Track resolution quality, depth, and outcomes with AI-driven insights for continuous improvement"
                className="md:col-span-2 lg:col-span-1 group transition duration-500"
              >
                <div className="aspect-video flex items-center justify-center">
                  <p className="group-hover:text-gray-600 transition duration-500 text-4xl font-extrabold text-gray-400 text-center">
                    Achieve{" "}
                    <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      optimal
                    </span>{" "}
                    SLA compliance
                  </p>
                </div>
              </FeatureCard>
            </motion.div>

            {/* Skill Evolution */}
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
            >
              <FeatureCard
                title="Dynamic Skill Evolution"
                description="Automatically update technician profiles with every ticket closed for intelligent growth tracking"
                className="group md:col-span-2 md:col-start-2 lg:col-span-1 lg:col-start-auto"
              >
                <div className="aspect-video flex justify-center items-center gap-4">
                  <Key className="w-28 outline outline-2 outline-transparent group-hover:outline-blue-400 transition-all duration-500 outline-offset-2 group-hover:translate-y-1">
                    skill
                  </Key>
                  <Key className="outline outline-2 outline-transparent group-hover:outline-blue-400 transition-all duration-500 outline-offset-2 group-hover:translate-y-1 delay-150">
                    +
                  </Key>
                  <Key className="outline outline-2 outline-transparent group-hover:outline-blue-400 transition-all duration-500 outline-offset-2 group-hover:translate-y-1 delay-300">
                    grow
                  </Key>
                </div>
              </FeatureCard>
            </motion.div>
          </div>
        </motion.div>

        {/* Feature badges */}
        <div className="my-8 flex items-center justify-center flex-wrap gap-2 max-w-3xl m-auto">
          {features.map((feature) => (
            <div
              className="bg-white border border-gray-200 inline-flex px-3 md:px-5 md:py-2 py-1.5 rounded-2xl gap-3 items-center hover:scale-105 transition duration-500 group shadow-sm"
              key={feature}
            >
              <span className="bg-blue-500 text-white size-5 rounded-full inline-flex items-center justify-center text-xl group-hover:rotate-45 transition duration-500">
                &#10038;
              </span>
              <span className="font-medium md:text-lg text-gray-800">{feature}</span>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mt-16">
          <ComparisonTable />
        </div>
      </div>
    </section>
  );
}
