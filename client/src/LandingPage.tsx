import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, BrainCircuit, Activity, Users } from 'lucide-react';

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <div className="bg-card dark:bg-dark-card rounded-lg p-6 text-center transform hover:-translate-y-2 transition-transform duration-300 shadow-lg border border-border dark:border-dark-border">
    <div className="flex justify-center items-center mb-4 text-primary dark:text-primary-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2 text-text dark:text-dark-text">{title}</h3>
    <p className="text-muted dark:text-dark-muted text-sm">{description}</p>
  </div>
);

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-background dark:bg-dark-background text-text dark:text-dark-text font-sans">
      {/* Header */}
      <header className="container mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <img src="/logo.png" alt="BioVerse Logo" className="h-10 w-10" />
          <span className="text-2xl font-bold tracking-wider text-primary dark:text-primary-300">
            BIOVERSE
          </span>
        </div>
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="hover:text-primary dark:hover:text-primary-300 transition-colors duration-300">
            Features
          </a>
          <a href="#vision" className="hover:text-primary dark:hover:text-primary-300 transition-colors duration-300">
            Vision
          </a>
        </nav>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/login')}
            className="font-bold py-2 px-6 rounded-lg transition-all duration-300"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-primary hover:bg-primary-700 text-primary-text font-bold py-2 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Register
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="text-center md:text-left"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-4 text-text dark:text-dark-text">
              The Future of National Healthcare is Here
            </h1>
            <p className="text-lg md:text-xl text-muted dark:text-dark-muted max-w-xl mx-auto md:mx-0 mb-8">
              Pioneering Zambia's AI-Powered Predictive Health Twin Network to
              transform healthcare from reactive to proactive.
            </p>
            <button
              onClick={() => navigate('/register')}
              className="bg-primary hover:bg-primary-700 text-primary-text font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              Join The Future of Health
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img
              src="/landing.png"
              alt="BioVerse Platform Showcase"
              className="rounded-lg shadow-2xl w-full h-auto"
              style={{ maxHeight: '600px', objectFit: 'cover' }}
            />
          </motion.div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 bg-card dark:bg-dark-card">
        <div className="container mx-auto px-6 md:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-text dark:text-dark-text">
            A Unified Health Ecosystem
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<HeartPulse size={40} />}
              title="AI Symptom Checker"
              description="Get instant, AI-powered analysis of your symptoms to guide your next steps."
            />
            <FeatureCard
              icon={<BrainCircuit size={40} />}
              title="Predictive Health Twin"
              description="Your personal digital twin that predicts health risks and offers personalized advice."
            />
            <FeatureCard
              icon={<Activity size={40} />}
              title="Real-time Monitoring"
              description="Connects health workers, ambulances, and clinics for seamless coordination."
            />
            <FeatureCard
              icon={<Users size={40} />}
              title="National Health Insights"
              description="Aggregated data helps the Ministry of Health predict outbreaks and allocate resources."
            />
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section id="vision" className="py-24 bg-background dark:bg-dark-background">
        <div className="container mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center gap-12">
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-text dark:text-dark-text">
              Our Vision: Proactive, Personalized, Predictive
            </h2>
            <p className="text-lg text-muted dark:text-dark-muted mb-4">
              We are building a revolutionary platform that creates a dynamic,
              continuously learning digital twin for every Zambian. By
              aggregating health data, our AI can predict health risks before
              they manifest.
            </p>
            <p className="text-lg text-muted dark:text-dark-muted">
              This will not only improve individual health outcomes but also
              provide the Ministry of Health with unprecedented insights for
              resource allocation, outbreak prediction, and policy-making.
            </p>
          </motion.div>
          <motion.div
            className="md:w-1/2"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-full h-80 bg-card dark:bg-dark-card rounded-xl flex items-center justify-center shadow-lg border border-border dark:border-dark-border">
              <BrainCircuit size={100} className="text-primary/50 dark:text-primary-300/50" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card dark:bg-dark-card py-10 border-t border-border dark:border-dark-border">
        <div className="container mx-auto px-6 md:px-8 text-center text-muted dark:text-dark-muted">
          <p>
            &copy; {new Date().getFullYear()} BioVerse Zambia. All rights
            reserved.
          </p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-primary dark:hover:text-primary-300 transition-colors">
              Twitter
            </a>
            <a href="#" className="hover:text-primary dark:hover:text-primary-300 transition-colors">
              LinkedIn
            </a>
            <a href="#" className="hover:text-primary dark:hover:text-primary-300 transition-colors">
              Contact Us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;