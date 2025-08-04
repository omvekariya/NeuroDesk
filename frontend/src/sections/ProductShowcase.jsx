import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// Use relative paths based on your file structure
import productImage from "../assets/product-image.png";
import pyramidImage from "../assets/pyramid.png";
import tubeImage from "../assets/tube.png";

export const ProductShowcase = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const translateY = useTransform(scrollYProgress, [0, 1], [150, -150]);

  return (
    <section
      ref={sectionRef}
      className="bg-gradient-to-b from-[#FFFFFF] to-[#D2DCFF] py-24 overflow-x-clip justify-items-center"
    >
      <div className="container">
        <div className="section-heading">
          <div className="flex justify-center items-center">
            <div className="tag">Skill-Tag Auto-Assign</div>
          </div>
          <h2 className="section-title mt-5">
            Intelligent ticket routing that evolves with your team
          </h2>
          <p className="section-description mt-5">
            Our AI-powered system analyzes ticket content, maps required skills, and automatically assigns tickets to the most qualified technicians while tracking performance and evolving skill profiles dynamically.
          </p>
        </div>

        <div className="relative">
          <img src={productImage} alt="Product" className="mt-10" />
          
          <motion.img
            src={pyramidImage}
            alt="Pyramid"
            width={262}
            height={262}
            className="hidden md:block absolute -right-36 -top-32"
            style={{ translateY }}
          />

          <motion.img
            src={tubeImage}
            alt="Tube"
            width={248}
            height={248}
            className="hidden md:block absolute bottom-24 -left-36"
            style={{ translateY }}
          />
        </div>
      </div>
    </section>
  );
};
