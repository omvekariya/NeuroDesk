import React from "react";
import { Link } from "react-router-dom";

// Replace with your actual relative paths
import logo from "../assets/logosaas.png";
import SocialX from "../assets/social-x.svg";
import SocialInsta from "../assets/social-insta.svg";
import SocialLinkedIn from "../assets/social-linkedin.svg";
import SocialPin from "../assets/social-pin.svg";
import SocialYoutube from "../assets/social-youtube.svg";

export const Footer = () => {
    return (
        <footer className="bg-black text-[#BCBCBC] text-sm py-10 text-center justify-items-center">
            <div className="container">
                <div className="inline-flex relative before:content-[''] before:top-2 before:bottom-0 before:w-full before:blur before:bg-[linear-gradient(to_right,#f87bff,#FB92CF,#FFDD9B,#C2F0B1,#2FD8FE)] before:absolute">
                    <Link to="/">
                        <img src={logo} height={40} alt="SaaS logo" className="relative" />
                    </Link>
                </div>

                <nav className="flex flex-col md:flex-row md:justify-center gap-6 mt-6">
                    <Link to="/about" className="hover:text-white transition-colors">About</Link>
                    <Link to="/" className="hover:text-white transition-colors">Features</Link>
                    <Link to="/" className="hover:text-white transition-colors">Customers</Link>
                    <Link to="/" className="hover:text-white transition-colors">Pricing</Link>
                    <Link to="/" className="hover:text-white transition-colors">Help</Link>
                    <Link to="/" className="hover:text-white transition-colors">Careers</Link>
                </nav>

                <div className="flex justify-center gap-6 mt-6">
                    <img src={SocialX} alt="Social X" />
                    <img src={SocialInsta} alt="Instagram" />
                    <img src={SocialLinkedIn} alt="LinkedIn" />
                    <img src={SocialPin} alt="Pinterest" />
                    <img src={SocialYoutube} alt="YouTube" />
                </div>

                <p className="mt-6">
                    &copy; 2025 Skill Intelligence Platform, All rights reserved.
                    <br />
                    <a
                        className="hover:text-white transition-all"
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Made with love by innoviX
                    </a>
                </p>
            </div>
        </footer>
    );
};
