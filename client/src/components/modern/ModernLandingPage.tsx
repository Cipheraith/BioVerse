import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform, useInView } from 'framer-motion';
import { 
  ArrowRight, Play, CheckCircle, Zap, Shield, Globe, 
  Heart, Brain, Activity, Users, Sparkles, Star,
  ChevronDown, Menu, X, Phone, Mail
} from 'lucide-react';

const ModernLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

  // Intersection Observer for active section
  useEffect(() => {
    const observers = new Map();
    const sections = ['hero', 'features', 'impact', 'cta'];
    
    sections.forEach(section => {
      const element = document.getElementById(section);
      if (element) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setActiveSection(section);
            }
          },
          { threshold: 0.5 }
        );
        observer.observe(element);
        observers.set(section, observer);
      }
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  const stats = [
    { number: '$259B', label: 'Africa Healthcare Market Value', icon: Globe },
    { number: '400M+', label: 'Africans Without Quality Healthcare', icon: Users },
    { number: '1.4B', label: 'Target Population Across 54 Countries', icon: CheckCircle },
    { number: '95%+', label: 'System Reliability & AI Accuracy', icon: Activity }
  ];

  const features = [
    {
      icon: Brain,
      title: 'Predictive AI Engine',
      description: 'Quantum-inspired algorithms predict health events months before symptoms appear',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Population Health Modeling',
      description: 'Individual to community-wide health insights across Africa\'s 1.4B people',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Federated Learning Privacy',
      description: 'Your data stays local while contributing to collective health intelligence',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Globe,
      title: 'Africa-Ready Infrastructure',
      description: 'Works offline with SMS/USSD support for rural and urban healthcare',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-300 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div 
              className="flex items-center space-x-3"
              whileHover={{ scale: 1.05 }}
            >
              <div className="relative">
                <img src="/bio.png" alt="BioVerse" className="h-10 w-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                BioVerse
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'Impact', 'About'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-300 hover:text-gray-300 transition-colors duration-200 font-medium"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-300 hover:text-gray-300 transition-colors duration-200 font-medium"
              >
                Sign In
              </button>
              <motion.button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-2 rounded-full font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started
              </motion.button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-300 hover:text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-gray-900 border-t border-gray-800"
            >
              <div className="px-4 py-6 space-y-4">
                {['Features', 'Impact', 'About'].map((item) => (
                  <a
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="block text-gray-300 hover:text-gray-300 transition-colors duration-200 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item}
                  </a>
                ))}
                <div className="pt-4 space-y-3">
                  <button
                    onClick={() => navigate('/login')}
                    className="block w-full text-left text-gray-300 hover:text-gray-300 transition-colors duration-200 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="block w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-full font-semibold text-center"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Hero Section */}
      <section id="hero" ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-16">
        {/* Netflix-Level Premium Background */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Primary gradient orbs */}
          <motion.div 
            className="absolute w-[800px] h-[800px] bg-gradient-to-r from-blue-500/8 to-cyan-500/8 rounded-full blur-3xl"
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.3, 0.6, 0.3],
              x: [0, 50, 0],
              y: [0, -30, 0]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ top: '10%', left: '15%' }}
          />
          <motion.div 
            className="absolute w-[600px] h-[600px] bg-gradient-to-r from-purple-500/6 to-pink-500/6 rounded-full blur-3xl"
            animate={{
              scale: [1.1, 0.9, 1.1],
              opacity: [0.2, 0.5, 0.2],
              x: [0, -40, 0],
              y: [0, 40, 0]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
            style={{ bottom: '20%', right: '10%' }}
          />
          <motion.div 
            className="absolute w-[500px] h-[500px] bg-gradient-to-r from-emerald-500/4 to-teal-500/4 rounded-full blur-3xl"
            animate={{
              scale: [0.9, 1.3, 0.9],
              opacity: [0.1, 0.4, 0.1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          />
          
          {/* Premium floating particles */}
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={i}
              className={`absolute rounded-full ${
                i % 5 === 0 ? 'w-2 h-2 bg-gradient-to-r from-blue-400/50 to-cyan-400/50' :
                i % 5 === 1 ? 'w-1 h-1 bg-gradient-to-r from-purple-400/60 to-pink-400/60' :
                i % 5 === 2 ? 'w-1.5 h-1.5 bg-gradient-to-r from-emerald-400/40 to-teal-400/40' :
                i % 5 === 3 ? 'w-0.5 h-0.5 bg-white/80' :
                'w-1 h-1 bg-gradient-to-r from-yellow-400/30 to-orange-400/30'
              }`}
              animate={{
                y: [0, -50 - Math.random() * 30, 0],
                x: [0, Math.sin(i * 0.5) * 20, 0],
                opacity: [0.1, 0.8, 0.1],
                scale: [0.3, 1.2 + Math.random() * 0.5, 0.3],
                rotate: [0, 360]
              }}
              transition={{
                duration: 8 + i * 0.1,
                repeat: Infinity,
                delay: i * 0.05,
                ease: "easeInOut"
              }}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
          
          {/* Subtle noise texture overlay */}
          <div 
            className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: '256px 256px'
            }}
          ></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-full px-6 py-2 mb-8"
          >
            <Heart className="w-4 h-4 text-red-400 mr-2" />
            <span className="text-sm font-medium text-blue-300">AI-Powered Predictive Health Twin Network</span>
            <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-6"
          >
            <span className="bg-gradient-to-r from-white via-blue-100 to-cyan-200 bg-clip-text text-transparent">
              Africa's First
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              Health Twin Network
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed"
          >
            Create your <span className="text-cyan-400 font-semibold">Living Digital Health Twin</span> that predicts health events before they happen. 
            Transforming Africa's healthcare from reactive treatment to 
            <span className="text-cyan-400 font-semibold"> proactive prevention</span> at population scale.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
          >
            <motion.button
              onClick={() => navigate('/register')}
              className="group bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 shadow-2xl hover:shadow-cyan-500/25 flex items-center space-x-2"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(6, 182, 212, 0.3)" }}
              whileTap={{ scale: 0.95 }}
            >
                <span>Create Your Health Twin</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            <motion.button
              className="group bg-gray-800/50 hover:bg-gray-700/50 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 border border-gray-700 hover:border-gray-600 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5" />
              <span>Watch Demo</span>
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex justify-center mb-2">
                  <stat.icon className="w-8 h-8 text-cyan-400" />
                </div>
                <div className="text-3xl font-bold text-gray-300 mb-1">{stat.number}</div>
                <div className="text-sm text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Revolutionary Healthcare Technology
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              World's first quantum-inspired health prediction engine transforming healthcare across Africa
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="group relative bg-gradient-to-b from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 hover:border-gray-600/50 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-300 mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                
                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why BioVerse is Groundbreaking */}
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <motion.div
              className="inline-flex items-center bg-gradient-to-r from-charcoal-500/10 to-charcoal-600/10 border border-charcoal-500/20 rounded-full px-6 py-2 mb-6"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Zap className="w-4 h-4 text-charcoal-400 mr-2" />
              <span className="text-sm text-charcoal-300 font-medium">What Makes BioVerse Different</span>
            </motion.div>

            <h2 className="text-4xl md:text-6xl font-bold mb-8">
              <span className="bg-gradient-to-r from-gray-300 via-gray-200 to-gray-100 bg-clip-text text-transparent">
                Beyond Traditional Telemedicine
              </span>
            </h2>
            
            <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed">
              While competitors like <span className="text-blue-400 font-semibold">Teladoc</span> and <span className="text-green-400 font-semibold">Babylon Health</span> 
              focus on virtual consultations, BioVerse revolutionizes healthcare with AI-powered predictive analytics 
              specifically designed for <span className="text-cyan-400 font-semibold">African healthcare challenges</span>.
            </p>
          </motion.div>

          {/* Competitive Comparison */}
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {/* Traditional Telemedicine */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-800/30 to-gray-900/30 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-4">Traditional Telemedicine</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 mt-1">×</span>
                  <span>Reactive healthcare only</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 mt-1">×</span>
                  <span>Limited to video consultations</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 mt-1">×</span>
                  <span>No predictive capabilities</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 mt-1">×</span>
                  <span>Western-focused, not Africa-optimized</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-red-400 mt-1">×</span>
                  <span>Expensive infrastructure requirements</span>
                </li>
              </ul>
            </motion.div>

            {/* BioVerse Advantage */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 backdrop-blur-sm border border-cyan-500/30 rounded-3xl p-8 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-3xl"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">BioVerse AI Healthcare</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span><strong>Predictive AI</strong> - Prevents diseases before symptoms</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span><strong>Digital Health Twins</strong> - Personalized health models</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span><strong>Africa-First Design</strong> - Built for local challenges</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span><strong>Blockchain Security</strong> - Military-grade protection</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span><strong>Low-bandwidth Optimized</strong> - Works in rural areas</span>
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Future Vision */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-sm border border-purple-500/30 rounded-3xl p-8"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-300 mb-4">The Future of Healthcare</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start space-x-2">
                  <span className="text-purple-400 mt-1">→</span>
                  <span>AI predicts health issues 6+ months ahead</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-400 mt-1">→</span>
                  <span>Molecular-level health insights</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-400 mt-1">→</span>
                  <span>Real-time population health monitoring</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-400 mt-1">→</span>
                  <span>Quantum-enhanced diagnostics</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-400 mt-1">→</span>
                  <span>Precision medicine for Africa</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Key Differentiators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-gray-800/40 to-gray-900/40 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 md:p-12"
          >
            <div className="text-center mb-12">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Revolutionary Healthcare Technologies
                </span>
              </h3>
              <p className="text-gray-300 text-lg">Powered by cutting-edge AI specifically designed for African healthcare</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Brain,
                  title: "Living Digital Health Twins",
                  description: "Quantum-inspired AI creates digital replicas that continuously learn and predict health events before they happen",
                  highlight: "World's first quantum-inspired health prediction engine"
                },
                {
                  icon: Shield,
                  title: "Privacy-First Federated Learning",
                  description: "Blockchain-secured federated learning ensures your health data never leaves your community while powering collective insights",
                  highlight: "Military-grade privacy protection"
                },
                {
                  icon: Activity,
                  title: "Multi-Level Health Modeling",
                  description: "Models complex health dynamics at individual, family, community, and population levels simultaneously",
                  highlight: "Population-scale precision"
                },
                {
                  icon: Globe,
                  title: "Connectivity Agnostic Platform",
                  description: "Works seamlessly offline with SMS/USSD support, multilingual access, and low-bandwidth optimization",
                  highlight: "Africa-ready infrastructure"
                },
                {
                  icon: Users,
                  title: "Unified Healthcare Platform",
                  description: "One platform replaces fragmented systems, delivering personalized care from rural villages to urban centers",
                  highlight: "First unified African platform"
                },
                {
                  icon: Heart,
                  title: "Government-Ready Scalability",
                  description: "API-driven architecture with robust tech stack designed to serve Africa's 1.4 billion people at scale",
                  highlight: "Enterprise-grade scalability"
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 group"
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2">{feature.title}</h4>
                  <p className="text-gray-300 text-sm mb-3 leading-relaxed">{feature.description}</p>
                  <div className="inline-flex items-center bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-full px-3 py-1">
                    <span className="text-xs text-cyan-400 font-medium">{feature.highlight}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-8">
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Transforming Africa's Healthcare
                </span>
              </h2>
              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                From reactive treatment to proactive prevention - BioVerse creates Living Digital Health Twins 
                that continuously learn and predict health events before they happen across 54 African nations.
              </p>
              
              <div className="space-y-6">
                {[
                  'World\'s first quantum-inspired health prediction engine',
                  'API-driven architecture with React, Node.js, Python FastAPI stack',
                  'Offline-capable with multilingual SMS/USSD support',
                  'Privacy-first federated learning with blockchain security'
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3"
                  >
                    <CheckCircle className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                    <span className="text-gray-300 text-lg">{item}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl p-8 border border-gray-700">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-400 mb-2">$259B</div>
                    <div className="text-gray-300">Africa Market Size</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-400 mb-2">1.4B</div>
                    <div className="text-gray-300">Target Population</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-cyan-400 mb-2">400M+</div>
                    <div className="text-gray-300">Without Quality Care</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-400 mb-2">1st</div>
                    <div className="text-gray-300">In Africa</div>
                  </div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-xl"></div>
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-full blur-xl"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-24 bg-gradient-to-r from-blue-900 via-gray-900 to-cyan-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent">
                Ready for the Future of Healthcare?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-12 leading-relaxed">
              Join the revolution transforming Africa's healthcare landscape with AI-powered 
              predictive health twins and government-ready scalable infrastructure.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <motion.button
                onClick={() => navigate('/register')}
                className="group bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white px-10 py-5 rounded-full text-xl font-bold transition-all duration-300 shadow-2xl hover:shadow-cyan-500/30 flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                onClick={() => navigate('/contact')}
                className="group text-cyan-400 hover:text-cyan-300 px-10 py-5 rounded-full text-xl font-bold transition-all duration-300 border-2 border-cyan-400 hover:border-cyan-300 flex items-center space-x-3"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone className="w-6 h-6" />
                <span>Partner With Us</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img src="/bio.png" alt="BioVerse" className="h-8 w-8" />
              <span className="text-xl font-bold text-gray-300">BioVerse</span>
            </div>
            
            <div className="flex items-center space-x-6 text-gray-300">
              <a href="/privacy" className="hover:text-gray-300 transition-colors">Privacy</a>
              <a href="/terms" className="hover:text-gray-300 transition-colors">Terms</a>
              <a href="/contact" className="hover:text-gray-300 transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-300">
            <p>&copy; 2024 BioVerse. World's first quantum-inspired predictive health twin network for Africa.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernLandingPage;