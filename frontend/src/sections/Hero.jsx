import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";

import arrowIcon from "../assets/arrow-right.svg";
import cogImage from "../assets/cog.png";
import cylinderImage from "../assets/cylinder.png";
import noodleImage from "../assets/noodle.png";

export const Hero = ({ onGetStartedClick }) => {
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start end", "end start"],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  useMotionValueEvent(translateY, "change", (latestValue) =>
    console.log(latestValue)
  );

  return (
    <section
      ref={heroRef}
      className="pt-8 pb-20 md:pt-5 md:pb-10 bg-[radial-gradient(ellipse_200%_100%_at_bottom_left,#183ec2,#eaeefe_100%)] overflow-x-clip justify-items-center"
    >
      <div className="container">
        <div className="md:flex items-center">
          <div className="md:w-[490px] px-8">
            <div className="tag">AI-Powered ITSM Solution</div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tigher bg-gradient-to-b from-black to-[#001e80] text-transparent bg-clip-text mt-6">
              Gamified Skill Intelligence for Smart Ticket Assignment
            </h1>
            <p className="text-xl text-[#010d3e] tracking-tight mt-6">
              Transform your IT support with AI-powered ticket routing that matches skills, tracks performance, and evolves technician profiles dynamically for optimal SLA compliance.
            </p>
            <div className="flex gap-1 items-center mt-[30px]">
              <button 
                onClick={onGetStartedClick}
                className="btn btn-primary hover:bg-[#001e80] transition-colors"
              >
                Get Started
              </button>
              <button className="btn btn-text gap-1 flex items-center">
                <span>See How It Works</span>
                <img
                  src={arrowIcon}
                  alt="Arrow icon"
                  className="h-5 w-5"
                />
              </button>
            </div>
          </div>

          <div className="mt-20 md:mt-0 md:h-[648px] md:flex-1 relative">
            <motion.img
              src={cogImage}
              alt="Cog image"
              className="md:absolute md:h-full md:w-auto md:max-w-none md:-left-6 lg:left-0"
              animate={{ translateY: [-30, 30] }}
              transition={{
                repeat: Infinity,
                repeatType: "mirror",
                duration: 3,
                ease: "easeInOut",
              }}
            />
            <motion.img
              src={cylinderImage}
              alt="Cylinder image"
              width={220}
              height={220}
              className="hidden md:block -top-8 -left-32 md:absolute"
              style={{ translateY }}
            />
            <motion.img
              src={noodleImage}
              alt="Noodle image"
              width={220}
              className="hidden lg:block absolute top-[524px] left-[448px] rotate-[30deg]"
              style={{
                translateY,
                rotate: 30,
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
