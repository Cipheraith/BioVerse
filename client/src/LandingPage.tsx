import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import { 
  HeartPulse, BrainCircuit, Activity, Users, Sparkles, Zap, Shield, Globe,
  ArrowRight, Play, CheckCircle, TrendingUp, Eye, Cpu, Database,
  Brain, Dna, Target, Award, Star, Wifi, Layers, Atom, Microscope
} from 'lucide-react';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
  
  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    { icon: Brain, title: "AI Health Twins", desc: "Digital replicas that predict your health future" },
    { icon: Activity, title: "Real-time Monitoring", desc: "Continuous health tracking with instant alerts" },
    { icon: Dna, title: "Molecular Analysis", desc: "Cellular-level health insights and predictions" },
    { icon: Target, title: "Precision Medicine", desc: "Personalized treatments based on your unique profile" }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-sans overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl"
          animate={{
            x: [-100, 100, -100],
            y: [-50, 50, -50],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 container mx-auto px-6 md:px-8 py-6 flex justify-center items-center">
        <div className="flex items-center space-x-3">
          <motion.img 
            src="/bio.png" 
            alt="BioVerse Logo" 
            className="h-16 w-16" 
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          />
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="text-4xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
              animate={{ 
                backgroundPosition: ['0%', '200%', '0%']
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              BIOVERSE
            </motion.span>
            <div className="text-xs text-gray-400 tracking-widest">AI-POWERED HEALTH NETWORK</div>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-6 md:px-8 py-20 md:py-32">
        <div className="text-center mb-16">
          <motion.div
            className="inline-flex items-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Sparkles className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-sm text-blue-300 font-medium">World's First AI-Powered Health Twin Network</span>
            <motion.div
              className="ml-2 w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <motion.h1 
            className="text-6xl md:text-8xl font-black leading-tight mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              The Future of
            </span>
            <br />
            <motion.span 
              className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ['0%', '200%', '0%']
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "linear"
              }}
            >
              Healthcare is Here
            </motion.span>
          </motion.h1>

          <motion.p 
            className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <span className="text-cyan-400 font-semibold">BioVerse</span> creates digital twins of your health that predict, prevent, and personalize your medical care. 
            Our groundbreaking AI analyzes your unique biological patterns to deliver 
            <span className="text-purple-400 font-semibold"> precision medicine</span> that adapts in real-time.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <motion.button
              onClick={() => setIsVideoPlaying(true)}
              className="group bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 flex items-center space-x-3 shadow-lg"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 15px 30px rgba(6, 182, 212, 0.25)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Watch Demo</span>
            </motion.button>
            
            <motion.button
              onClick={() => navigate('/register')}
              className="group bg-gradient-to-r from-purple-700 to-pink-700 hover:from-purple-800 hover:to-pink-800 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 flex items-center space-x-3 shadow-lg"
              whileHover={{ 
                scale: 1.05,
                boxShadow: "0 15px 30px rgba(147, 51, 234, 0.25)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span>Start Your Health Journey</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>

          {/* Breakthrough Features Showcase */}
          <motion.div
            className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className={`relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border rounded-2xl p-6 transition-all duration-500 ${
                  currentFeature === index 
                    ? 'border-cyan-400 shadow-2xl shadow-cyan-400/20 scale-105' 
                    : 'border-slate-700 hover:border-slate-600'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <motion.div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    currentFeature === index 
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600' 
                      : 'bg-slate-700'
                  }`}
                  animate={currentFeature === index ? { 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
                
                {currentFeature === index && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-600/10 rounded-2xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* Video Modal */}
      <AnimatePresence>
        {isVideoPlaying && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVideoPlaying(false)}
          >
            <motion.div
              className="relative bg-slate-900 rounded-2xl p-8 max-w-4xl w-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsVideoPlaying(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
              <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">BioVerse Demo</h3>
                  <p className="text-gray-400">Experience the future of healthcare</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Why BioVerse is Groundbreaking */}
      <section className="py-32 bg-gradient-to-b from-black via-slate-900 to-black relative overflow-hidden">
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              animate={{
                x: [0, Math.random() * 1000],
                y: [0, Math.random() * 800],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: Math.random() * 10 + 5,
                repeat: Infinity,
                delay: Math.random() * 5,
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <motion.div
            className="text-center mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-full px-6 py-2 mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Zap className="w-4 h-4 text-orange-400 mr-2" />
              <span className="text-sm text-orange-300 font-medium">Breakthrough Innovation</span>
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-black mb-8">
              <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Why BioVerse is
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Groundbreaking
              </span>
            </h2>

            <div className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
              <p className="mb-6">
                BioVerse stands at the forefront of healthcare innovation by combining 
                <span className="text-cyan-400 font-semibold"> AI</span>, 
                <span className="text-purple-400 font-semibold"> blockchain</span>, and 
                <span className="text-green-400 font-semibold"> IoT technologies</span> to deliver unmatched health insights.
              </p>
              
              <div className="bg-gradient-to-r from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 mb-6">
                <h4 className="text-2xl font-bold text-white mb-4 flex items-center">
                  <span className="text-cyan-400 mr-2">⚡</span> Our AI Health Twin Network provides:
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <span className="text-yellow-400 text-xl">🔮</span>
                    <div>
                      <span className="text-yellow-400 font-semibold">Predictive Analysis:</span>
                      <span className="text-gray-300"> Using AI trained on vast amounts of health data to forecast health risks well in advance, enabling preventive care.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-pink-400 text-xl">🧬</span>
                    <div>
                      <span className="text-pink-400 font-semibold">Personalized Care:</span>
                      <span className="text-gray-300"> Tailoring medical interventions based on your unique genetic and lifestyle factors.</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <span className="text-green-400 text-xl">📊</span>
                    <div>
                      <span className="text-green-400 font-semibold">Real-Time Health Monitoring:</span>
                      <span className="text-gray-300"> Continuously tracking health metrics with instant alerts for anomalies.</span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-center">
                By integrating these groundbreaking technologies, BioVerse ensures healthcare is not
                only reactive but <span className="text-cyan-400 font-semibold">proactive</span>, improving outcomes and reducing costs globally.
              </p>
            </div>
          </motion.div>

          {/* Revolutionary Features Grid */}
          <div className="grid lg:grid-cols-2 gap-16 mb-20">
            {/* 3D Health Visualization */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 h-full">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Eye className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-3xl font-bold text-white mb-4">
                  3D Health Visualization
                </h3>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  Experience your health like never before with interactive 3D anatomical models, 
                  molecular-level visualizations, and real-time organ health status. See your body's 
                  systems working in harmony or identify issues before they become critical.
                </p>
                
                {/* Mini 3D Demo */}
                <div className="relative bg-gradient-to-br from-slate-900 to-black rounded-2xl p-6 border border-slate-600">
                  <div className="flex justify-center space-x-4 mb-4">
                    <motion.div
                      className="w-12 h-12 bg-red-500/30 rounded-full flex items-center justify-center"
                      animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                      transition={{ duration: 4, repeat: Infinity }}
                    >
                      <HeartPulse className="w-6 h-6 text-red-400" />
                    </motion.div>
                    <motion.div
                      className="w-12 h-12 bg-blue-500/30 rounded-full flex items-center justify-center"
                      animate={{ scale: [1.2, 1, 1.2], rotate: [360, 180, 0] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 0.5 }}
                    >
                      <Brain className="w-6 h-6 text-blue-400" />
                    </motion.div>
                    <motion.div
                      className="w-12 h-12 bg-green-500/30 rounded-full flex items-center justify-center"
                      animate={{ scale: [1, 1.3, 1], rotate: [0, -180, -360] }}
                      transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    >
                      <Activity className="w-6 h-6 text-green-400" />
                    </motion.div>
                  </div>
                  <div className="text-center text-sm text-gray-400">
                    Interactive 3D Health Models
                  </div>
                </div>
              </div>
            </motion.div>

            {/* AI Prediction Engine */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 h-full">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <BrainCircuit className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-3xl font-bold text-white mb-4">
                  AI Prediction Engine
                </h3>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  Our advanced AI doesn't just track your current health—it predicts your future. 
                  Using machine learning models trained on millions of health patterns, we can 
                  forecast potential health issues months or even years in advance.
                </p>
                
                {/* AI Prediction Demo */}
                <div className="relative bg-gradient-to-br from-slate-900 to-black rounded-2xl p-6 border border-slate-600">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Cardiovascular Risk</span>
                      <motion.div
                        className="text-green-400 font-semibold"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Low (12%)
                      </motion.div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Diabetes Risk</span>
                      <motion.div
                        className="text-yellow-400 font-semibold"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                      >
                        Medium (34%)
                      </motion.div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Mental Health</span>
                      <motion.div
                        className="text-green-400 font-semibold"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                      >
                        Stable (8%)
                      </motion.div>
                    </div>
                  </div>
                  <div className="text-center text-xs text-gray-500 mt-4">
                    AI Confidence: 94%
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Molecular Health Analysis */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 h-full">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                >
                  <Dna className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-3xl font-bold text-white mb-4">
                  Molecular Health Analysis
                </h3>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  Dive deeper than ever before with cellular and molecular-level health insights. 
                  Our platform analyzes your blood composition, immune system status, and genetic 
                  factors to provide unprecedented health intelligence.
                </p>
                
                {/* Molecular Visualization */}
                <div className="relative bg-gradient-to-br from-slate-900 to-black rounded-2xl p-6 border border-slate-600">
                  <div className="flex justify-center space-x-2 mb-4">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-3 h-3 bg-gradient-to-r from-green-400 to-teal-400 rounded-full"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-center text-sm text-gray-400">
                    Real-time Molecular Analysis
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Real-time Health Network */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-3xl p-8 h-full">
                <motion.div
                  className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Globe className="w-8 h-8 text-white" />
                </motion.div>
                
                <h3 className="text-3xl font-bold text-white mb-4">
                  National Health Network
                </h3>
                <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                  Connect every healthcare provider, patient, and medical facility across Zambia 
                  in one unified network. Real-time data sharing, emergency response coordination, 
                  and population health insights at your fingertips.
                </p>
                
                {/* Network Visualization */}
                <div className="relative bg-gradient-to-br from-slate-900 to-black rounded-2xl p-6 border border-slate-600">
                  <div className="relative h-24 flex items-center justify-center">
                    <motion.div
                      className="absolute w-4 h-4 bg-orange-400 rounded-full"
                      animate={{
                        scale: [1, 2, 1],
                        opacity: [1, 0.3, 1],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-cyan-400 rounded-full"
                        animate={{
                          x: Math.cos((i * Math.PI * 2) / 6) * 40,
                          y: Math.sin((i * Math.PI * 2) / 6) * 40,
                          scale: [1, 1.5, 1],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 0.3,
                        }}
                      />
                    ))}
                  </div>
                  <div className="text-center text-sm text-gray-400">
                    Connected Healthcare Network
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

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
                  Revolutionary Technologies Powering BioVerse
                </span>
              </h3>
              <p className="text-gray-300 text-lg max-w-3xl mx-auto">
                Our cutting-edge platform combines multiple breakthrough technologies to deliver unparalleled healthcare insights
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
                <h4 className="text-xl font-bold text-white mb-3">Quantum Health Analytics</h4>
                <p className="text-gray-300 text-sm mb-4">
                  Leveraging quantum computing principles to analyze complex biological patterns at unprecedented speed and accuracy.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center text-cyan-400">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full mr-2"></span>
                    Process millions of health data points simultaneously
                  </div>
                  <div className="flex items-center text-blue-400">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    99.7% accuracy in predictive health modeling
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
            className="bg-gradient-to-r from-slate-800/30 to-slate-900/30 backdrop-blur-sm border border-slate-700 rounded-3xl p-12"
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

            <div className="grid md:grid-cols-4 gap-8">
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
                    className={`w-16 h-16 ${stat.color.replace('text-', 'bg-').replace('-400', '-500/20')} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                  >
                    <stat.icon className={`w-8 h-8 ${stat.color}`} />
                  </motion.div>
                  <motion.div
                    className={`text-4xl font-bold ${stat.color} mb-2`}
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
      <section className="py-32 bg-gradient-to-br from-cyan-900/20 via-blue-900/20 to-purple-900/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-purple-500/5" />
        
        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-full px-6 py-2 mb-8"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Star className="w-4 h-4 text-cyan-400 mr-2" />
              <span className="text-sm text-cyan-300 font-medium">Join the Healthcare Revolution</span>
            </motion.div>

            <h2 className="text-5xl md:text-7xl font-black mb-8">
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Ready to Transform
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                Your Health?
              </span>
            </h2>

            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Don't wait for the future of healthcare—experience it today. Join thousands of patients 
              and healthcare providers who are already benefiting from AI-powered health insights.
            </p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <motion.button
                onClick={() => navigate('/register')}
                className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-5 px-10 rounded-full text-xl transition-all duration-300 flex items-center space-x-3 shadow-2xl"
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 25px 50px rgba(6, 182, 212, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Start Your Health Journey</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/about')}
                className="group border-2 border-purple-500 hover:bg-purple-500 text-purple-400 hover:text-white font-bold py-5 px-10 rounded-full text-xl transition-all duration-300 flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Learn More</span>
                <Eye className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </motion.button>
            </motion.div>

            <motion.div
              className="mt-12 flex justify-center items-center space-x-8 text-gray-400"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span>HIPAA compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span>Award winning</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-b from-black to-gray-900 py-16 border-t border-gray-800 relative overflow-hidden">
        {/* Animated footer background */}
        <div className="absolute inset-0 opacity-10">
          <motion.div
            className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400"
            animate={{
              backgroundPosition: ['0%', '200%', '0%']
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>

        <div className="container mx-auto px-6 md:px-8 relative z-10">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
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

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm">
                {[
                  { name: 'Health Twins', path: '/health-twins' },
                  { name: 'AI Analytics', path: '/analytics' },
                  { name: 'Telemedicine', path: '/telemedicine' },
                  { name: 'Emergency Care', path: '/emergency' },
                  { name: 'API Access', path: '/api' }
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

            <div className="text-center mt-8 pt-8 border-t border-gray-800">
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} BioVerse. All rights reserved. 
                <span className="mx-2">•</span>
                Built with ❤️ for better healthcare outcomes
                <span className="mx-2">•</span>
                <motion.span
                  className="text-cyan-400"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  Transforming lives through AI
                </motion.span>
              </p>
              
              <motion.div
                className="mt-4 text-xs text-gray-500"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                Made in Zambia 🇿🇲 • Powered by Innovation • Secured by Design
              </motion.div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
