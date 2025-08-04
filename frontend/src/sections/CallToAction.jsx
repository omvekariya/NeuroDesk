import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

import starImage from "../assets/star.png";
import springImage from "../assets/spring.png";
import arrowRight from "../assets/arrow-right.svg";

export const CallToAction = ({ onGetStartedClick }) => {
  const sectionRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-white to-[#D2DCFF] py-52 overflow-x-clip justify-items-center"
    >
      <div className="container">
        <div className="section-heading relative">
          <h2 className="section-title">Transform your IT support today</h2>
          <p className="section-description mt-5">
            Join the future of intelligent ticket management with AI-powered skill matching, performance tracking, and dynamic technician growth that boosts SLA compliance and team motivation.
          </p>
          <motion.img
            src={starImage}
            alt="Star Image"
            width={360}
            className="absolute -left-[350px] -top-[137px]"
            style={{ translateY }}
          />
          <motion.img
            src={springImage}
            alt="Spring Image"
            width={360}
            className="absolute -right-[331px] -top-[19px]"
            style={{ translateY }}
          />
        </div>
        <div className="flex gap-2 mt-10 justify-center">
          <button 
            onClick={onGetStartedClick}
            className="btn btn-primary hover:bg-[#001e80] transition-colors"
          >
            Get Started
          </button>
          <button className="btn btn-text gap-1 flex items-center">
            <span>Schedule Demo</span>
            <img src={arrowRight} alt="Arrow right" className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};
