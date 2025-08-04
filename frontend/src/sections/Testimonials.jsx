import React from "react";
import { motion } from "framer-motion";

// Replace these with the correct relative paths in your project
import avatar1 from "../assets/avatar-1.png";
import avatar2 from "../assets/avatar-2.png";
import avatar3 from "../assets/avatar-3.png";
import avatar4 from "../assets/avatar-4.png";
import avatar5 from "../assets/avatar-5.png";
import avatar6 from "../assets/avatar-6.png";
import avatar7 from "../assets/avatar-7.png";
import avatar8 from "../assets/avatar-8.png";
import avatar9 from "../assets/avatar-9.png";

const testimonials = [
  {
    text: "The AI-powered skill matching has reduced our ticket assignment time by 70% while improving resolution quality significantly.",
    imageSrc: avatar1,
    name: "Sarah Chen",
    username: "@sarah_itsm",
  },
  {
    text: "Our technicians are more motivated than ever with the gamified skill tracking and performance recognition system.",
    imageSrc: avatar2,
    name: "Mike Rodriguez",
    username: "@mike_techlead",
  },
  {
    text: "The dynamic skill evolution feature has transformed how we identify training needs and career development opportunities.",
    imageSrc: avatar3,
    name: "Lisa Thompson",
    username: "@lisa_support",
  },
  {
    text: "SLA compliance improved by 85% within the first month of implementing this intelligent routing system.",
    imageSrc: avatar4,
    name: "David Kumar",
    username: "@david_ops",
  },
  {
    text: "The performance analytics provide insights we never had before, helping us optimize our support operations continuously.",
    imageSrc: avatar5,
    name: "Emma Wilson",
    username: "@emma_itsm",
  },
  {
    text: "Finally, a system that recognizes quality over speed. Our best technicians are getting the recognition they deserve.",
    imageSrc: avatar6,
    name: "Alex Johnson",
    username: "@alex_tech",
  },
  {
    text: "The automated skill profile updates save us hours of manual tracking while providing more accurate technician assessments.",
    imageSrc: avatar7,
    name: "Jordan Patel",
    username: "@jordan_support",
  },
  {
    text: "Our team's growth trajectory has accelerated with the AI-driven insights into performance gaps and strengths.",
    imageSrc: avatar8,
    name: "Sam Dawson",
    username: "@sam_itsm",
  },
  {
    text: "The intelligent routing ensures our most skilled technicians handle complex issues while newer team members learn gradually.",
    imageSrc: avatar9,
    name: "Casey Harper",
    username: "@casey_tech",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialsColumn = ({ className = "", testimonials, duration = 10 }) => (
  <div className={className}>
    <motion.div
      animate={{ translateY: "-50%" }}
      transition={{
        duration: duration,
        repeat: Infinity,
        ease: "linear",
        repeatType: "loop",
      }}
      className="flex flex-col gap-6 pb-6"
    >
      {[...new Array(2)].fill(0).map((_, index) => (
        <React.Fragment key={index}>
          {testimonials.map(({ text, imageSrc, name, username }) => (
            <div className="card" key={text}>
              <div>{text}</div>
              <div className="flex items-center gap-2 mt-5">
                <img
                  src={imageSrc}
                  alt={name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full"
                />
                <div className="flex flex-col">
                  <div className="font-medium tracking-tight leading-5">
                    {name}
                  </div>
                  <div className="leading-5 tracking-tight">{username}</div>
                </div>
              </div>
            </div>
          ))}
        </React.Fragment>
      ))}
    </motion.div>
  </div>
);

export const Testimonials = () => {
  return (
    <section className="bg-white justify-items-center py-36">
      <div className="container">
        <div className="section-heading">
          <div className="flex justify-center">
            <div className="tag">Success Stories</div>
          </div>
          <h2 className="section-title mt-5">What IT leaders say</h2>
          <p className="section-description">
            IT support managers and technicians share their experience with our AI-powered skill intelligence platform.
          </p>
        </div>

        <div className="flex justify-center gap-6 mt-10 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[738px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn
            testimonials={secondColumn}
            className="hidden md:block"
            duration={19}
          />
          <TestimonialsColumn
            testimonials={thirdColumn}
            className="hidden lg:block"
            duration={17}
          />
        </div>
      </div>
    </section>
  );
};
