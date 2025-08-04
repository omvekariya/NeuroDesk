import React from "react";
import { motion } from "framer-motion";

// Import new SVG logos from custImg folder
import suzukiLogo from "../assets/custImg/suzuki.svg";
import vodafoneLogo from "../assets/custImg/vodafone.svg";
import jswSteelLogo from "../assets/custImg/jsw_steel.svg";
import kotakLogo from "../assets/custImg/kotak.svg";
import unionBankLogo from "../assets/custImg/union-bank.svg";
import bandhanBankLogo from "../assets/custImg/bandhan_bank.svg";
import redwinLogo from "../assets/custImg/redwin.svg";
import airtelLogo from "../assets/custImg/airtel.svg";
import necLogo from "../assets/custImg/nec.svg";
import uabLogo from "../assets/custImg/UAB.svg";

export const LogoTicker = () => {
    return (
        <div className="py-8 md:py-12 bg-white justify-items-center">
            <div className="container">
                <div className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black,transparent)]">
                    <motion.div
                        className="flex gap-14 flex-none pr-14"
                        animate={{
                            translateX: "-50%",
                        }}
                        transition={{
                            duration: 20,
                            repeat: Infinity,
                            ease: "linear",
                            repeatType: "loop",
                        }}
                    >
                        {[suzukiLogo, vodafoneLogo, jswSteelLogo, kotakLogo, unionBankLogo, bandhanBankLogo, redwinLogo, airtelLogo, necLogo, uabLogo]
                            .concat([suzukiLogo, vodafoneLogo, jswSteelLogo, kotakLogo, unionBankLogo, bandhanBankLogo, redwinLogo, airtelLogo, necLogo, uabLogo]) // second set
                            .map((logo, index) => (
                                <img
                                    key={index}
                                    src={logo}
                                    alt={`Logo ${index}`}
                                    className="logo-ticker-image"
                                />
                            ))}
                    </motion.div>
                </div>
            </div>
        </div>
    );
};
