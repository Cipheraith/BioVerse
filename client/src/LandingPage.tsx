import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HeartPulse, BrainCircuit, Activity, Users, Sparkles, Zap, Shield, Globe } from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-sans">
      {/* Header */}
      <header className="container mx-auto px-6 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <motion.img 
            src="/bio.png" 
            alt="BioVerse Logo" 
            className="h-14 w-14" 
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.span 
            className="text-3xl font-extrabold tracking-wider bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent"
            animate={{ 
              backgroundPosition: ['0%', '100%', '0%']
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            BIOVERSE
          </motion.span>
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
            <motion.h1 
              className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0%', '100%', '0%']
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              Transform Healthcare with AI Innovation
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-gray-300 max-w-xl mx-auto md:mx-0 mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              BioVerse revolutionizes healthcare delivery through intelligent AI-powered health twins, predictive analytics, and real-time monitoring. Experience personalized medicine that adapts to your unique health profile, connecting patients, doctors, and health systems across Zambia in one seamless digital ecosystem.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <motion.button
                onClick={() => navigate('/about')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 10px 25px rgba(245, 158, 11, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  y: [0, -5, 0]
                }}
                transition={{
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
              >
                Learn More
              </motion.button>
              <motion.button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-xl"
                whileHover={{ 
                  scale: 1.1,
                  boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  y: [0, -5, 0]
                }}
                transition={{
                  y: {
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }
                }}
              >
                Get Started
              </motion.button>
            </motion.div>
          </motion.div>
          
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* AI-Powered Health Dashboard Visualization */}
            <div className="relative bg-gradient-to-br from-slate-800 via-slate-900 to-black rounded-2xl p-8 shadow-2xl border border-slate-700">
              {/* Floating AI Elements */}
              <div className="absolute top-4 right-4 bg-blue-500/20 rounded-full p-3 animate-pulse">
                <BrainCircuit size={24} className="text-blue-400" />
              </div>
              <div className="absolute bottom-4 left-4 bg-purple-500/20 rounded-full p-3 animate-bounce">
                <Sparkles size={20} className="text-purple-400" />
              </div>
              <div className="absolute top-4 left-4 bg-green-500/20 rounded-full p-2 animate-ping">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              
              {/* Main Content */}
              <div className="text-center space-y-6">
                <div className="flex justify-center space-x-4 mb-8">
                  <motion.div 
                    className="bg-red-500/30 p-4 rounded-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <HeartPulse size={32} className="text-red-300" />
                  </motion.div>
                  <motion.div 
                    className="bg-blue-500/30 p-4 rounded-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, -10, 10, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  >
                    <Activity size={32} className="text-blue-300" />
                  </motion.div>
                  <motion.div 
                    className="bg-green-500/30 p-4 rounded-xl"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 15, -15, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 1
                    }}
                  >
                    <Users size={32} className="text-green-300" />
                  </motion.div>
                </div>
                
                <motion.h3 
                  className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  animate={{
                    scale: [1, 1.05, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  AI-Powered Health Twins
                </motion.h3>
                <motion.p 
                  className="text-gray-300 text-lg font-medium"
                  animate={{
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  Your Digital Health Companion
                </motion.p>
                
                {/* Stats Display */}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  <motion.div 
                    className="bg-gradient-to-br from-slate-700 to-slate-800 backdrop-blur-sm rounded-lg p-4 border border-slate-600"
                    whileHover={{ 
                      scale: 1.05,
                      borderColor: "rgb(239, 68, 68)",
                      boxShadow: "0 10px 20px rgba(239, 68, 68, 0.2)"
                    }}
                    animate={{
                      y: [0, -2, 0]
                    }}
                    transition={{
                      y: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                  >
                    <motion.div 
                      className="text-2xl font-bold text-white"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >247</motion.div>
                    <div className="text-gray-400 text-sm">Patients</div>
                  </motion.div>
                  <motion.div 
                    className="bg-gradient-to-br from-slate-700 to-slate-800 backdrop-blur-sm rounded-lg p-4 border border-slate-600"
                    whileHover={{ 
                      scale: 1.05,
                      borderColor: "rgb(59, 130, 246)",
                      boxShadow: "0 10px 20px rgba(59, 130, 246, 0.2)"
                    }}
                    animate={{
                      y: [0, -2, 0]
                    }}
                    transition={{
                      y: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.5
                      }
                    }}
                  >
                    <motion.div 
                      className="text-2xl font-bold text-white"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    >89</motion.div>
                    <div className="text-gray-400 text-sm">Appointments</div>
                  </motion.div>
                  <motion.div 
                    className="bg-gradient-to-br from-slate-700 to-slate-800 backdrop-blur-sm rounded-lg p-4 border border-slate-600"
                    whileHover={{ 
                      scale: 1.05,
                      borderColor: "rgb(34, 197, 94)",
                      boxShadow: "0 10px 20px rgba(34, 197, 94, 0.2)"
                    }}
                    animate={{
                      y: [0, -2, 0]
                    }}
                    transition={{
                      y: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 1
                      }
                    }}
                  >
                    <motion.div 
                      className="text-2xl font-bold text-white"
                      animate={{ opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                    >98%</motion.div>
                    <div className="text-gray-400 text-sm">Accuracy</div>
                  </motion.div>
                </div>
                
                {/* AI Status Indicator */}
                <div className="flex justify-center items-center space-x-2 mt-6">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">AI Assistant Online</span>
                </div>
                
                {/* Luma Connection Status */}
                <div className="flex justify-center items-center space-x-2 mt-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                  <span className="text-blue-400 text-xs">Connected to Luma AI</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Features Preview */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-black">
        <div className="container mx-auto px-6 md:px-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Revolutionary Healthcare Technology
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Discover how our AI-powered platform is transforming healthcare delivery across Zambia
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 hover:border-blue-500 transition-all duration-300 transform hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="text-blue-400 mb-4">
                <BrainCircuit size={48} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Predictive Analytics</h3>
              <p className="text-gray-400">Advanced AI algorithms predict health risks before they manifest</p>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 hover:border-purple-500 transition-all duration-300 transform hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-purple-400 mb-4">
                <Activity size={48} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Real-time Monitoring</h3>
              <p className="text-gray-400">Continuous health tracking with instant alerts and insights</p>
            </motion.div>
            
            <motion.div
              className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 hover:border-green-500 transition-all duration-300 transform hover:scale-105"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="text-green-400 mb-4">
                <Users size={48} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">National Network</h3>
              <p className="text-gray-400">Connecting healthcare providers across the entire country</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black py-10 border-t border-gray-800">
        <div className="container mx-auto px-6 md:px-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} BioVerse Zambia. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-white transition-colors">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
