import React, { useState, useEffect } from "react";
import logo from '/bio.png';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Lock, User, Calendar, CreditCard, UserCheck, Sparkles, ArrowRight, CheckCircle, Heart } from 'lucide-react';
import { ModernButton, ModernInput, ModernCard, ModernAlert, ModernSelect } from './components/modern/ModernComponents';

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("patient");
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [nationalId, setNationalId] = useState("");
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const navigate = useNavigate();

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
    setSuccess("");
    setIsLoading(true);
  
    try {
      const response = await axios.post(
        "http://localhost:3000/api/auth/register",
        {
          username,
          password,
          role,
          fullName,
          dob,
          nationalId,
          phoneNumber,
        },
      );
  
      setSuccess(response.data.message + " You can now log in.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Registration failed. Please try again.");
      }
      console.error("Registration error:", err);
    }
    finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'patient', label: 'Patient' },
    { value: 'health_worker', label: 'Health Worker' },
    { value: 'admin', label: 'Admin' },
    { value: 'moh', label: 'Ministry of Health' },
    { value: 'ambulance_driver', label: 'Ambulance Driver' },
    { value: 'pharmacy', label: 'Pharmacy' }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-950">
      {/* Modern gradient overlay matching landing page */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900/80 to-gray-950"></div>
      
      {/* Enhanced particle system */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute w-[700px] h-[700px] bg-gradient-to-r from-blue-500/6 to-cyan-500/6 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 0.06,
            y: mousePosition.y * 0.06,
            scale: [0.9, 1.3, 0.9],
          }}
          transition={{
            x: { type: "spring", stiffness: 25 },
            y: { type: "spring", stiffness: 25 },
            scale: { duration: 12, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            left: '15%',
            top: '25%',
          }}
        />
        <motion.div
          className="absolute w-[500px] h-[500px] bg-gradient-to-r from-purple-500/5 to-red-500/5 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * -0.04,
            y: mousePosition.y * 0.08,
            scale: [1.2, 0.8, 1.2],
          }}
          transition={{
            x: { type: "spring", stiffness: 20 },
            y: { type: "spring", stiffness: 20 },
            scale: { duration: 15, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            right: '20%',
            bottom: '30%',
          }}
        />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-2xl"
        >
          <ModernCard
            className="bg-gray-950/80 backdrop-blur-xl border-gray-800/50 shadow-2xl"
            padding="lg"
            hover={true}
          >
            <div className="text-center mb-8">
              <motion.img 
                src={logo} 
                alt="BioVerse Logo" 
                className="h-20 w-20 mx-auto mb-4" 
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />
              <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-500 to-emerald-600 mb-2">
                Join BioVerse
              </h1>
              <p className="text-gray-300 text-lg">
                Create your account to access the future of healthcare
              </p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-center"
                >
                  <p className="text-red-400 text-sm font-medium">{error}</p>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 text-center flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <p className="text-green-400 text-sm font-medium">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <ModernInput
                  label="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  icon={<User className="w-5 h-5" />}
                />
              </motion.div>
              
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
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
              
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <ModernInput
                  label="Phone Number"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter your phone number"
                  icon={<Phone className="w-5 h-5" />}
                />
              </motion.div>
              
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <ModernInput
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  required
                  icon={<Lock className="w-5 h-5" />}
                />
              </motion.div>
              
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <ModernInput
                  label="Date of Birth"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  icon={<Calendar className="w-5 h-5" />}
                />
              </motion.div>
              
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <ModernInput
                  label="National ID"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="Enter your national ID"
                  required
                  icon={<CreditCard className="w-5 h-5" />}
                />
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="sm:col-span-2">
                <ModernSelect
                  label="Role"
                  value={role}
                  onChange={(value) => setRole(value)}
                  options={roleOptions}
                  placeholder="Select your role"
                  required
                />
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="sm:col-span-2">
                <ModernButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={isLoading}
                  disabled={isLoading}
                >
                  <span>Create Account</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </ModernButton>
              </motion.div>
            </form>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-8 text-center">
              <p className="text-gray-300">
                Already have an account? <Link to="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline transition-colors">Login here</Link>
              </p>
              <div className="flex items-center justify-center space-x-2 mt-4 text-xs text-gray-300">
                <Sparkles className="w-4 h-4" />
                <span>Join the future of healthcare</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </motion.div>
          </ModernCard>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
