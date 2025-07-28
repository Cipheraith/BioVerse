import React, { useState, useEffect } from "react";
import logo from '/bio.png';
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, Lock, User, Calendar, CreditCard, UserCheck, Eye, EyeOff, Sparkles, ArrowRight, CheckCircle } from 'lucide-react';

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

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * 0.1,
            y: mousePosition.y * 0.1,
            scale: [1, 1.1, 1],
          }}
          transition={{
            x: { type: "spring", stiffness: 50 },
            y: { type: "spring", stiffness: 50 },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            left: '20%',
            top: '30%',
          }}
        />
        <motion.div
          className="absolute w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: mousePosition.x * -0.05,
            y: mousePosition.y * 0.08,
            scale: [1.2, 1, 1.2],
          }}
          transition={{
            x: { type: "spring", stiffness: 30 },
            y: { type: "spring", stiffness: 30 },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
          style={{
            right: '25%',
            bottom: '35%',
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
          <motion.div
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 sm:p-10 shadow-2xl"
            whileHover={{ 
              boxShadow: "0 25px 50px rgba(6, 182, 212, 0.15)",
              borderColor: "rgba(6, 182, 212, 0.3)"
            }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center mb-8">
              <motion.img 
                src={logo} 
                alt="BioVerse Logo" 
                className="h-20 w-20 mx-auto mb-4" 
                animate={{ rotate: [0, -360] }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              />
              <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 mb-2">
                Join BioVerse
              </h1>
              <p className="text-gray-400 text-lg">
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
              {/* Form Fields */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 pl-12" />
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="email" value={username} onChange={(e) => setUsername(e.target.value)} required className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 pl-12" />
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 pl-12" />
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 pl-12 pr-12" />
                  <motion.button type="button" onClick={() => setShowPassword(!showPassword)} whileTap={{ scale: 0.95 }} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff /> : <Eye />}
                  </motion.button>
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">Date of Birth</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 pl-12" />
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                <label className="block text-sm font-semibold text-cyan-400 mb-2">National ID</label>
                <div className="relative">
                  <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={nationalId} onChange={(e) => setNationalId(e.target.value)} required className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 pl-12" />
                </div>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="sm:col-span-2">
                <label className="block text-sm font-semibold text-cyan-400 mb-2">Role</label>
                <div className="relative">
                  <UserCheck className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 pl-12">
                    <option value="patient">Patient</option>
                    <option value="health_worker">Health Worker</option>
                    <option value="admin">Admin</option>
                    <option value="moh">Ministry of Health</option>
                    <option value="ambulance_driver">Ambulance Driver</option>
                    <option value="pharmacy">Pharmacy</option>
                  </select>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="sm:col-span-2">
                <button type="submit" disabled={isLoading} className="group w-full bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-700 hover:to-blue-800 text-white font-bold py-4 rounded-xl flex items-center justify-center shadow-md transition-all duration-300">
                  {isLoading ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-5 h-5 border-2 border-white border-t-transparent rounded-full" /> : <><span>Create Account</span><ArrowRight className="w-5 h-5 ml-2" /></>}
                </button>
              </motion.div>
            </form>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="mt-8 text-center">
              <p className="text-gray-400">
                Already have an account? <Link to="/login" className="text-cyan-400 hover:underline">Login here</Link>
              </p>
              <div className="flex items-center justify-center space-x-2 mt-4 text-xs text-gray-500">
                <Sparkles className="w-4 h-4" />
                <span>Join the future of healthcare</span>
                <Sparkles className="w-4 h-4" />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
