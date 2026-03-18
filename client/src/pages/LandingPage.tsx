import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { 
  HeartPulse, BrainCircuit, Activity, Users, Sparkles, Zap, Shield, Globe,
  ArrowRight, Play, CheckCircle, TrendingUp, Eye, Cpu, Database,
  Brain, Dna, Target, Award, Star, Wifi, Layers, Atom, Microscope, Rocket, 
  Heart, Calendar, Phone, MapPin, Clock, User, Bell, BarChart3
} from 'lucide-react';
import Card from './components/ui/Card';
import Button from './components/ui/Button';
import GlowingOrb from './components/ui/GlowingOrb';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  const features = [
    { icon: Activity, title: "Outbreak Detection", desc: "Real-time anomaly detection for epidemic tracking" },
    { icon: Layers, title: "Supply Chain Intelligence", desc: "Stockout prediction and medicine distribution" },
    { icon: MapPin, title: "Facility Resource Mapping", desc: "Live views of bed and equipment availability" },
    { icon: Shield, title: "Emergency Logistics", desc: "Automated ambulance routing and facility matching" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans overflow-x-hidden">

      {/* Header */}
      <header className="relative z-10 mobile-container px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex justify-between items-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <img 
            src="/bio.png" 
            alt="BioVerse Logo" 
            className="h-10 w-10 sm:h-12 sm:w-12"
          />
          <div>
            <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              BioVerse
            </span>
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">HEALTH SYSTEM COORDINATOR</div>
          </div>
        </div>
        <div className="hidden md:flex space-x-4">
          <button onClick={() => navigate('/login')} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium px-4 py-2">Sign In</button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mobile-container px-4 sm:px-6 md:px-8 py-12 sm:py-20 md:py-24">
        <div className="text-center mb-12 sm:mb-16 max-w-5xl mx-auto">
          <div className="inline-flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full px-4 py-2 border border-blue-100 dark:border-blue-800 mb-8 font-medium text-sm">
            <Activity className="w-4 h-4 mr-2" />
            The Operating System for Public Health
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-8 text-gray-900 dark:text-white">
            Coordinate Healthcare <br className="hidden md:block" />
            <span className="text-blue-600">At System Scale</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            BioVerse provides real-time visibility into supply chains, facility resources, 
            and outbreak detection. Empowering ministries and health workers to make data-driven decisions that save lives.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-sm w-full sm:w-auto text-lg"
            >
              <span>Access Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => navigate('/register')}
              className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 w-full sm:w-auto text-lg shadow-sm"
            >
              Register Facility
            </button>
          </div>

          {/* Active Features List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto px-4 mt-12 mb-20 text-left">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-white dark:bg-gray-800 border rounded-xl p-6 transition-all duration-300 ${
                  currentFeature === index 
                    ? 'border-blue-500 shadow-md ring-1 ring-blue-500 z-10' 
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  currentFeature === index 
                    ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                }`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Functional Modules Display */}
      <section className="py-24 bg-white dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
              Complete System Visibility
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              BioVerse integrates supply, logistics, and epidemiological data into a single pane of glass, allowing for proactive health management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            
            {/* Supply Chain */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Supply Chain API</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-sm">
                Anticipate stockouts of essential supplies before they occur using predictive modeling based on historical distribution and consumption rates.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Predictive stockout alerts</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Cross-facility inventory views</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Automated distribution logic</li>
              </ul>
            </div>

            {/* Outbreak Detection */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 rounded-xl flex items-center justify-center mb-6">
                <Activity className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Outbreak Intelligence</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-sm">
                Real-time scanning of aggregate patient logs to identify unexpected spikes in symptom clusters, empowering early response.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Spatial anomaly mapping</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Automated ministry alerts</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Case rate tracking</li>
              </ul>
            </div>

            {/* Emergency Network */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center mb-6">
                <Shield className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Facility Coordination</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-sm">
                Ensure emergency responders know which facilities have available beds and functioning equipment before dispatch.
              </p>
              <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Live bed capacity monitoring</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Equipment status tracking</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" /> Ambulance routing logic</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

          {/* Revolutionary Technology Section */}
          <motion.div
            className="mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Built on Modern Health Infrastructure
                </span>
              </h3>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                BioVerse is built on a stack designed for reliability, security, and scale across health systems
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Quantum Health Analytics */}
              <motion.div
                className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6"
                whileHover={{ scale: 1.02, borderColor: "rgba(6, 182, 212, 0.5)" }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center mb-4"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Cpu className="w-6 h-6 text-white" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-3">Predictive Health Analytics</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Analyzes complex biological patterns across large datasets to surface health risks early and support clinical decisions.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center text-cyan-400">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
                    Processes millions of health data points
                  </div>
                  <div className="flex items-center text-blue-400">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    High accuracy in predictive health modeling
                  </div>
                </div>
              </motion.div>

              {/* Blockchain Security */}
              <motion.div
                className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6"
                whileHover={{ scale: 1.02, borderColor: "rgba(147, 51, 234, 0.5)" }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-400 rounded-xl flex items-center justify-center mb-4"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Shield className="w-6 h-6 text-white" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-3">Blockchain Security</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Military-grade encryption and decentralized storage ensure your health data remains private and tamper-proof.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center text-purple-400">
                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-2"></span>
                    End-to-end encrypted health records
                  </div>
                  <div className="flex items-center text-pink-400">
                    <span className="w-2 h-2 bg-pink-400 rounded-full mr-2"></span>
                    Zero data breaches since launch
                  </div>
                </div>
              </motion.div>

              {/* IoT Integration */}
              <motion.div
                className="bg-gradient-to-br from-green-900/20 to-teal-900/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6"
                whileHover={{ scale: 1.02, borderColor: "rgba(34, 197, 94, 0.5)" }}
                transition={{ duration: 0.3 }}
              >
                <motion.div
                  className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-400 rounded-xl flex items-center justify-center mb-4"
                  animate={{ rotate: [0, -360] }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                >
                  <Database className="w-6 h-6 text-white" />
                </motion.div>
                <h4 className="text-xl font-bold text-white mb-3">Smart IoT Integration</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Seamlessly connects with 200+ health devices for continuous monitoring and real-time health insights.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center text-green-400">
                    <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    Compatible with major health device brands
                  </div>
                  <div className="flex items-center text-teal-400">
                    <span className="w-2 h-2 bg-teal-400 rounded-full mr-2"></span>
                    Real-time data synchronization
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Impact Statistics */}
          <motion.div
            className="bg-gradient-to-r from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700 rounded-3xl p-6 sm:p-8 lg:p-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-white mb-4">
                Transforming Healthcare Outcomes
              </h3>
              <p className="text-gray-300 text-lg">
                Real impact, measurable results, revolutionary change
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
              {[
                { value: "85%", label: "Early Disease Detection", icon: Target, color: "text-green-400" },
                { value: "70%", label: "Cost Reduction", icon: TrendingUp, color: "text-blue-400" },
                { value: "2.4K", label: "Lives Improved", icon: HeartPulse, color: "text-red-400" },
                { value: "99.9%", label: "System Uptime", icon: Shield, color: "text-purple-400" },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <motion.div
                    className={`w-12 h-12 sm:w-16 sm:h-16 ${stat.color.replace('text-', 'bg-').replace('-400', '-500/20')} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    <stat.icon className={`w-6 h-6 sm:w-8 sm:h-8 ${stat.color}`} />
                  </motion.div>
                  <motion.div
                    className={`text-3xl sm:text-4xl font-bold ${stat.color} mb-2`}
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
                  >
                    {stat.value}
                  </motion.div>
                  <div className="text-gray-400 font-medium">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-24 bg-blue-600 dark:bg-blue-900 text-white relative">
        <div className="container mx-auto px-6 md:px-8 text-center max-w-4xl relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Ready to Connect Your Facility?
          </h2>
          <p className="text-xl text-blue-100 mb-12">
            Join the BioVerse public health network to begin tracking supply, reducing stockouts, and responding faster to emergencies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/register')}
              className="bg-white text-blue-700 hover:bg-gray-100 font-bold py-4 px-10 rounded-lg text-lg transition-colors shadow-lg"
            >
              Get Started Free
            </button>
            <button
              onClick={() => navigate('/docs')}
              className="border-2 border-white hover:bg-blue-700/50 font-bold py-4 px-10 rounded-lg text-lg transition-colors"
            >
              Read Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black py-16 text-gray-400">
        <div className="container mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {/* Company Info */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <motion.img 
                  src="/bio.png" 
                  alt="BioVerse Logo" 
                  className="h-12 w-12" 
                  animate={{ 
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <div>
                  <motion.span 
                    className="text-2xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
                    animate={{ 
                      backgroundPosition: ['0%', '200%', '0%']
                    }}
                    transition={{
                      duration: 8,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  >
                    BIOVERSE
                  </motion.span>
                  <div className="text-xs text-gray-400 tracking-widest">AI-POWERED HEALTH NETWORK</div>
                </div>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                Transforming healthcare through AI-powered digital health twins. 
                Pioneering the future of predictive, personalized, and preventive medicine 
                for better health outcomes worldwide.
              </p>
              <div className="flex items-center space-x-2 mt-4">
                <motion.div
                  className="w-2 h-2 bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className="text-green-400 text-xs font-medium">System Online</span>
              </div>
            </div>

            <div>
              <h4 className="text-gray-100 font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { name: 'Supply Chain', path: '/supply' },
                  { name: 'Facility Management', path: '/facilities' },
                  { name: 'Telemedicine', path: '/telemedicine' },
                  { name: 'Emergency Routing', path: '/emergency' },
                  { name: 'API Docs', path: '/api' }
                ].map((link, index) => (
                  <li key={link.name}>
                    <a 
                      href={link.path} 
                      className="text-gray-400 hover:text-cyan-400 transition-colors duration-300 flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Contact & Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { name: 'About Us', path: '/about' },
                  { name: 'Contact', path: '/contact' },
                  { name: 'Support', path: '/support' },
                  { name: 'Documentation', path: '/docs' },
                  { name: 'Privacy Policy', path: '/privacy' }
                ].map((link, index) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <a 
                      href={link.path} 
                      className="text-gray-400 hover:text-purple-400 transition-colors duration-300 flex items-center group"
                    >
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          {/* Social Links & Stats */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6">
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-cyan-400 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Globe className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Users className="w-5 h-5" />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-gray-400 hover:text-purple-400 transition-colors duration-300"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Activity className="w-5 h-5" />
                </motion.a>
              </div>

              <div className="flex items-center space-x-8 text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="w-2 h-2 bg-green-400 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <span>2,847+ Active Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="w-2 h-2 bg-blue-400 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  />
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="w-2 h-2 bg-purple-400 rounded-full"
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  />
                  <span>24/7 AI Support</span>
                </div>
              </div>
            </div>

            <div className="text-center mt-12 pt-8 border-t border-gray-800 text-sm">
              <p>
                &copy; {new Date().getFullYear()} BioVerse Health Systems. All rights reserved. 
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
