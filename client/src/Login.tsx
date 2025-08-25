import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./hooks/useAuth";
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Mail, Phone, Lock, Sparkles, ArrowRight, Heart } from 'lucide-react';
import { ModernButton, ModernInput, ModernCard, ModernAlert } from './components/modern/ModernComponents';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const [loginType, setLoginType] = useState<'username' | 'phoneNumber'>('username');
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();
  const { login } = useAuth();

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const payload: { password: string; email?: string; phoneNumber?: string } = {
        password,
      };

      if (loginType === 'username') {
        payload.email = username;
      } else {
        payload.phoneNumber = phoneNumber;
      }

      const response = await axios.post("http://localhost:3000/api/auth/login", payload);
      login(response.data.token, response.data.user.role, response.data.user.id);
      navigate("/dashboard");
    } catch (err) {
      setError(t("login_error_invalid_credentials"));
      if (axios.isAxiosError(err) && err.response) {
        console.error("Login error details:", err.response.data);
      } else {
        console.error("Login error:", err.message);
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950">
      {/* Modern gradient overlay matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900/80 to-gray-950"></div>
      
      {/* Interactive particle system */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Dynamic floating orbs */}
        <motion.div
          className="absolute w-[600px] h-[600px] bg-gradient-to-r from-blue-500/8 to-cyan-500/8 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 0.08,
            y: mousePosition.y * 0.08,
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            x: { type: "spring", stiffness: 30 },
            y: { type: "spring", stiffness: 30 },
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            left: '5%',
            top: '15%',
          }}
        />
        <motion.div
          className="absolute w-[400px] h-[400px] bg-gradient-to-r from-purple-500/6 to-pink-500/6 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * -0.06,
            y: mousePosition.y * 0.1,
            scale: [1.1, 0.9, 1.1],
          }}
          transition={{
            x: { type: "spring", stiffness: 20 },
            y: { type: "spring", stiffness: 20 },
            scale: { duration: 10, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            right: '10%',
            bottom: '20%',
          }}
        />
      </div>

      {/* Premium floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gradient-to-r from-blue-400/60 to-cyan-400/60 rounded-full"
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [0.5, 1.5, 0.5],
            }}
            transition={{
              duration: 4 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.2,
            }}
            style={{
              left: `${5 + i * 4.5}%`,
              top: `${10 + (i % 4) * 25}%`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Premium Login Card */}
          <ModernCard
            className="bg-gray-950/80 backdrop-blur-2xl border-gray-800/30 shadow-2xl"
            padding="lg"
            hover={false}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className="relative mx-auto w-20 h-20 mb-6"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <img 
                  src="/bio.png" 
                  alt="BioVerse Logo" 
                  className="w-full h-full object-contain" 
                />
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-cyan-600/20 rounded-full blur-lg"
                  animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                  transition={{ duration: 3, repeat: Infinity }}
                />
              </motion.div>
              
              <motion.h1
                className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-emerald-600 mb-2"
                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Welcome Back
              </motion.h1>
              
              <motion.p
                className="text-gray-300 text-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Access your health universe
              </motion.p>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-danger-500/10 border border-danger-500/20 rounded-xl p-4 mb-6 text-center"
                >
                  <p className="text-danger-400 text-sm font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Type Toggle */}
            <motion.div 
              className="flex bg-gray-800/50 rounded-2xl p-1 mb-6"
              layout
            >
              <motion.button
                type="button"
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  loginType === 'username'
                    ? 'bg-gradient-to-r from-charcoal-500 to-charcoal-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-gray-300'
                }`}
                onClick={() => setLoginType('username')}
                whileTap={{ scale: 0.98 }}
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </motion.button>
              <motion.button
                type="button"
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 ${
                  loginType === 'phoneNumber'
                    ? 'bg-gradient-to-r from-charcoal-500 to-charcoal-600 text-white shadow-lg'
                    : 'text-gray-300 hover:text-gray-300'
                }`}
                onClick={() => setLoginType('phoneNumber')}
                whileTap={{ scale: 0.98 }}
              >
                <Phone className="w-4 h-4" />
                <span>Phone</span>
              </motion.button>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {loginType === 'username' ? (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ModernInput
                      label="Email Address"
                      type="email"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your email"
                      required
                      icon={<Mail className="w-5 h-5" />}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ModernInput
                      label="Phone Number"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="Enter your phone number"
                      required
                      icon={<Phone className="w-5 h-5" />}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <ModernInput
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  icon={<Lock className="w-5 h-5" />}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <ModernButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  disabled={isLoading}
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </ModernButton>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p className="text-gray-300">
                Don't have an account?{" "}
                <Link 
                  to="/register" 
                  className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline transition-colors"
                >
                  Sign up here
                </Link>
              </p>
              
              <motion.div
                className="flex items-center justify-center space-x-2 mt-4 text-xs text-gray-300"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Secured by BioVerse</span>
                <Sparkles className="w-4 h-4" />
              </motion.div>
            </motion.div>
          </ModernCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;