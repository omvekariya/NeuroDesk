import './App.css'

import { useNavigate } from 'react-router-dom';

import { CallToAction } from "./sections/CallToAction";
import { Features } from './sections/Features';
import { Footer } from "./sections/Footer";
import { Header } from "./sections/Header";
import { Hero } from "./sections/Hero";
import { Integrations } from "./sections/Integrations"
import { LogoTicker } from "./sections/LogoTicker";
import { ProductShowcase } from "./sections/ProductShowcase";
import { Testimonials } from "./sections/Testimonials";
import { Faqs } from './sections/Faqs';
import { Analytics } from './sections/Analytics';

function App() {
    const navigate = useNavigate();
    
    const handleGetStartedClick = () => {
        navigate('/login');
    };


    return (
        <div className='antialiased bg-[#EAEEFE]'>
            <Header onGetStartedClick={handleGetStartedClick} />
            <Hero onGetStartedClick={handleGetStartedClick} />
            <LogoTicker />
            <ProductShowcase />
            <Analytics />
            <Testimonials />
            <Features />
            <Integrations />
            <Faqs />
            <CallToAction onGetStartedClick={handleGetStartedClick} />
            <Footer />
        </div>
    )
}


export default App
