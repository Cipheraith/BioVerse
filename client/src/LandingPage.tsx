import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen overflow-hidden bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1532938911079-bfc1ff0238ae?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")' }}>
      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 bg-black bg-opacity-60" />
      {/* Subtle Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/70" />

      {/* Header with Logo */}
      <header className="relative z-10 w-full fixed top-0 left-0 py-4">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.img 
              src="/bio.png" 
              alt="BioVerse Logo" 
              className="h-24 w-24 drop-shadow-xl hover:scale-110 transition-transform duration-300" 
              initial={{ rotate: 0 }} 
              animate={{ rotate: [0, 10, -10, 0] }} 
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            />
            <span className="text-3xl font-extrabold tracking-tight text-white drop-shadow-lg">
              BIOVERSE
            </span>
          </div>
          
          
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="max-w-3xl w-full bg-white/20 backdrop-blur-xl rounded-3xl shadow-2xl px-8 py-16 flex flex-col items-center border border-white/30"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 drop-shadow-lg text-white text-center">
            The Future of National Healthcare
          </h1>
          <p className="text-lg md:text-2xl mb-8 drop-shadow-md text-gray-200 text-center">
            BioVerse: Revolutionizing Healthcare with Zambia's AI-Powered Predictive Health Twin Network. We are building a dynamic, continuously learning digital twin for every citizen, transforming healthcare from reactive to proactive, predictive, and personalized. Experience real-time coordination, AI-driven insights, and a future where health is managed with unprecedented intelligence.
          </p>
          <motion.button
            onClick={() => navigate("/about")}
            className="mt-4 px-12 py-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl shadow-2xl hover:scale-110 hover:from-blue-400 hover:to-purple-500 transition-transform duration-300 border-2 border-white/50"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.97 }}
          >
            Learn More
          </motion.button>
        </motion.div>
      </main>

      {/* About BioVerse Section */}
      <section id="about-bioverse" className="relative z-10 py-20 px-4 bg-gray-900 bg-opacity-80 text-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Unveiling the Future of Healthcare
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-bold mb-4">What is BioVerse?</h3>
              <p className="text-lg leading-relaxed mb-4">
                BioVerse Zambia is pioneering the world's first <strong className="text-blue-300">National AI-Powered Predictive Health Twin Network</strong>.
                Imagine a dynamic, continuously learning digital replica of every citizen's health journey,
                constantly updated and analyzed by advanced AI to provide unprecedented insights and foresight.
              </p>
              <p className="text-lg leading-relaxed">
                We are transforming healthcare from a reactive model to a proactive, predictive, and personalized system,
                ensuring a healthier, more efficient, and more intelligent national health ecosystem.
              </p>
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-4">Key Innovations</h3>
              <ul className="list-disc list-inside text-lg leading-relaxed space-y-2">
                <li><strong className="text-blue-300">Individualized Health Twins:</strong> Holistic and dynamic health profiles for every citizen.</li>
                <li><strong className="text-blue-300">Proactive & Predictive Care:</strong> Early risk identification, personalized interventions, and dynamic resource optimization.</li>
                <li><strong className="text-blue-300">Continuous Learning & Adaptation:</strong> AI models that evolve and improve over time.</li>
                <li><strong className="text-blue-300">Unprecedented Data Insights:</strong> Aggregated data for public health trends and policy.</li>
                <li><strong className="text-blue-300">Real-time Coordination:</strong> Connecting patients, health workers, pharmacies, and ambulance drivers.</li>
                <li><strong className="text-blue-300">Offline & USSD Support:</strong> Ensuring accessibility even without internet connectivity.</li>
              </ul>
            </div>
          </div>
          <div className="text-center mt-16">
            <h3 className="text-3xl font-bold mb-4">Our Vision: A Healthier Zambia</h3>
            <p className="text-xl leading-relaxed mb-8">
              BioVerse is not just a digital health platform; it is the blueprint for a healthier, more efficient,
              and more intelligent national health ecosystem. We are building something truly groundbreaking
              that will shock the world and endure for a long time.
            </p>
            <button
              onClick={() => navigate("/register")}
              className="px-10 py-4 rounded-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold text-lg shadow-xl hover:scale-105 hover:from-green-400 hover:to-teal-500 transition-transform duration-300 border-2 border-white/50"
            >
              Get Started with BioVerse
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
