import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartPulse, BrainCircuit, Activity, Users, Sparkles, 
  ArrowRight, Play, Eye, Brain, Dna, Target
} from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import GlassButton from '../ui/GlassButton';
import FloatingParticles from '../ui/FloatingParticles';

const MobileLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const features = [
    { icon: Brain, title: "AI Health Twins", desc: "Digital replicas that predict your health future", color: 'purple' as const },
    { icon: Activity, title: "Real-time Monitoring", desc: "Continuous health tracking with instant alerts", color: 'blue' as const },
    { icon: Dna, title: "Molecular Analysis", desc: "Cellular-level health insights and predictions", color: 'cyan' as const },
    { icon: Target, title: "Precision Medicine", desc: "Personalized treatments based on your unique profile", color: 'pink' as const }
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-x-hidden relative">
      {/* Floating Particles Background */}
      <FloatingParticles 
        count={isMobile ? 10 : 20} 
        colors={['cyan', 'blue', 'purple', 'pink']}
        size={isMobile ? 'sm' : 'md'}
        speed="slow"
      />

      {/* Header */}
      <header className="relative z-10 mobile-container px-4 sm:px-6 md:px-8 py-4 sm:py-6 flex justify-center items-center">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <motion.div
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center"
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              rotate: { duration: 20, repeat: Infinity, ease: "linear" },
              scale: { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <HeartPulse className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span 
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-wider bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent"
            >
              BIOVERSE
            </motion.span>
            <div className="text-xs text-gray-400 tracking-widest">AI-POWERED HEALTH NETWORK</div>
          </motion.div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 mobile-container px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-20 lg:py-32">
        <div className="text-center mb-8 sm:mb-12 md:mb-16">
          <motion.div
            className="inline-flex items-center bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full px-3 sm:px-4 md:px-6 py-2 mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-2" />
            <span className="text-xs sm:text-sm text-blue-300 font-medium">World's First AI-Powered Health Twin Network</span>
            <motion.div
              className="ml-2 w-2 h-2 bg-green-400 rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.div>

          <motion.h1 
            className="title-responsive text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black leading-tight mb-6 sm:mb-8 px-2"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent block">
              The Future of
            </span>
            <motion.span 
              className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent block"
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
            className="text-responsive text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <span className="text-cyan-400 font-semibold">BioVerse</span> creates digital twins of your health that predict, prevent, and personalize your medical care. 
            Our groundbreaking AI analyzes your unique biological patterns to deliver 
            <span className="text-purple-400 font-semibold"> precision medicine</span> that adapts in real-time.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-12 sm:mb-16 px-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <GlassButton
              onClick={() => navigate('/login')}
              className="mobile-button w-full sm:w-auto py-4 px-8 text-lg font-bold"
              gradient="blue"
              glow
            >
              <Play className="w-5 h-5 mr-2" />
              Get Started Now
            </GlassButton>
            
            <GlassButton
              onClick={() => navigate('/about')}
              className="mobile-button w-full sm:w-auto py-4 px-8 text-lg font-bold"
              gradient="purple"
            >
              <Eye className="w-5 h-5 mr-2" />
              Learn More
            </GlassButton>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="mobile-grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 + index * 0.1 }}
                >
                  <GlassCard
                    className="mobile-card p-4 sm:p-6 text-center h-full"
                    gradient={feature.color}
                    glow
                  >
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <h3 className="mobile-subtitle text-white font-bold mb-2">
                      {feature.title}
                    </h3>
                    <p className="mobile-text text-gray-300">
                      {feature.desc}
                    </p>
                  </GlassCard>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          className="mobile-grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto mt-16 sm:mt-20"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
        >
          {[
            { label: 'Active Users', value: '10K+', color: 'blue' as const },
            { label: 'Health Twins', value: '5K+', color: 'purple' as const },
            { label: 'Predictions', value: '50K+', color: 'cyan' as const },
            { label: 'Accuracy', value: '99.2%', color: 'pink' as const }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.7 + index * 0.1 }}
            >
              <GlassCard className="mobile-card p-4 text-center" gradient={stat.color}>
                <div className="mobile-title text-2xl sm:text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="mobile-text text-gray-300 text-sm">
                  {stat.label}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          className="text-center mt-16 sm:mt-20 px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
        >
          <h2 className="mobile-title text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Transform Your Health?
          </h2>
          <p className="mobile-text text-gray-300 max-w-2xl mx-auto mb-8">
            Join thousands of users who are already experiencing the future of personalized healthcare.
          </p>
          
          <GlassButton
            onClick={() => navigate('/register')}
            className="mobile-button w-full sm:w-auto py-4 px-8 text-lg font-bold"
            gradient="green"
            glow
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Your Journey Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </GlassButton>
        </motion.div>
      </main>
    </div>
  );
};

export default MobileLandingPage;