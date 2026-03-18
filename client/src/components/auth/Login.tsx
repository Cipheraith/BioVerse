import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import ApiService from '../../services/api';
import { Activity, EyeOff, Eye, ArrowRight, Shield } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);

      const response = await ApiService.login(formData);
      if (response.token) {
        login(response.token, response.user);
        navigate('/roles');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('Unable to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(59,130,246,0.4) 0%, transparent 50%),
                                radial-gradient(circle at 75% 75%, rgba(99,102,241,0.3) 0%, transparent 50%)`
            }}
          />
        </div>

        {/* Grid lines */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/bio.png" alt="BioVerse" className="h-10 w-10" />
            <div>
              <span className="text-xl font-bold text-white">BioVerse</span>
              <div className="text-xs text-blue-400 font-semibold tracking-widest uppercase">Health System Coordinator</div>
            </div>
          </Link>
        </div>

        {/* Center content */}
        <div className="relative z-10">
          <div className="inline-flex items-center bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-8">
            <Shield className="w-4 h-4 text-blue-400 mr-2" />
            <span className="text-blue-300 text-sm font-medium">Secure Access Portal</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-6">
            Coordinate your<br />
            <span className="text-blue-400">health network</span><br />
            from one place.
          </h1>
          <p className="text-blue-200/70 text-lg leading-relaxed max-w-md">
            Real-time visibility into supply chains, facility capacity, outbreak signals,
            and emergency logistics across your entire district or ministry.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            {[
              { value: 'Real-Time', label: 'Data Sync' },
              { value: 'Multi-Role', label: 'Access Control' },
              { value: '99.9%', label: 'Uptime Target' },
            ].map((stat, i) => (
              <div key={i} className="border border-white/10 rounded-xl p-4 bg-white/5 backdrop-blur-sm">
                <div className="text-blue-300 font-bold text-lg">{stat.value}</div>
                <div className="text-white/50 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-white/30 text-sm">
          © {new Date().getFullYear()} BioVerse Health Systems · Built in Zambia 🇿🇲
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center space-x-3 mb-8 lg:hidden">
            <img src="/bio.png" alt="BioVerse" className="h-9 w-9" />
            <div>
              <span className="text-lg font-bold text-white">BioVerse</span>
              <div className="text-xs text-blue-400 font-medium">Health System Coordinator</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-extrabold text-white mb-2">Welcome back</h2>
            <p className="text-slate-400">Sign in to access your health system dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm flex items-center">
              <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center mr-3 flex-shrink-0 text-red-400 font-bold text-xs">!</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                autoComplete="username"
                placeholder="Enter your username"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500/50" />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white flex items-center justify-center space-x-2 transition-all duration-200
                ${loading
                  ? 'bg-blue-700/50 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98] shadow-lg shadow-blue-500/25'
                }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-slate-500 text-sm">Don't have an account? </span>
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors">
              Register your facility
            </Link>
          </div>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-center mb-2">
              <Activity className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Demo Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div>Username: <span className="text-slate-300 font-mono">demo@bioverse.health</span></div>
              <div>Password: <span className="text-slate-300 font-mono">demo123</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
