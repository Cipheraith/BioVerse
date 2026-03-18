import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';
import { ArrowRight, EyeOff, Eye, Building2, ChevronRight } from 'lucide-react';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
}

const ROLES = [
  { value: 'health_worker', label: 'Health Worker', description: 'Clinic & hospital staff' },
  { value: 'admin', label: 'Facility Admin', description: 'Facility management' },
  { value: 'moh', label: 'Ministry of Health', description: 'District/national level' },
  { value: 'pharmacy', label: 'Pharmacist', description: 'Pharmacy management' },
  { value: 'ambulance_driver', label: 'Ambulance Driver', description: 'Emergency dispatch' },
  { value: 'patient', label: 'Patient', description: 'Personal health access' },
];

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    role: 'health_worker'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await ApiService.register({
        ...formData,
        confirmPassword: undefined
      });

      if (response.success) {
        navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const inputClass = "w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/bio.png" alt="BioVerse" className="h-10 w-10" />
            <div>
              <span className="text-xl font-bold text-white">BioVerse</span>
              <div className="text-xs text-blue-400 font-semibold tracking-widest uppercase">Health System Coordinator</div>
            </div>
          </Link>
        </div>

        <div className="relative z-10">
          <div className="w-14 h-14 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
            <Building2 className="w-7 h-7 text-blue-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-4 leading-tight">
            Register your<br />
            <span className="text-blue-400">facility or team</span>
          </h1>
          <p className="text-blue-200/60 leading-relaxed">
            Join the BioVerse network and gain access to real-time coordination tools
            for supply chains, outbreak detection, and emergency dispatch.
          </p>

          {/* Role highlights */}
          <div className="mt-10 space-y-3">
            {['Ministry-level dashboards', 'Facility resource tracking', 'Cross-district coordination', 'Emergency dispatch tools'].map((item, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <ChevronRight className="w-3 h-3 text-blue-400" />
                </div>
                <span className="text-slate-400 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-white/30 text-sm">
          Already registered? <Link to="/login" className="text-blue-400 hover:text-blue-300">Sign in</Link>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Mobile logo */}
          <div className="flex items-center space-x-3 mb-8 lg:hidden">
            <img src="/bio.png" alt="BioVerse" className="h-9 w-9" />
            <div>
              <span className="text-lg font-bold text-white">BioVerse</span>
              <div className="text-xs text-blue-400 font-medium">Health System Coordinator</div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-white mb-1">Create your account</h2>
            <p className="text-slate-400 text-sm">Join the BioVerse public health coordination network</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className={labelClass}>First Name</label>
                <input type="text" id="firstName" name="firstName" value={formData.firstName}
                  onChange={handleInputChange} required placeholder="First" className={inputClass} />
              </div>
              <div>
                <label htmlFor="lastName" className={labelClass}>Last Name</label>
                <input type="text" id="lastName" name="lastName" value={formData.lastName}
                  onChange={handleInputChange} required placeholder="Last" className={inputClass} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClass}>Email Address</label>
              <input type="email" id="email" name="email" value={formData.email}
                onChange={handleInputChange} required placeholder="you@facility.org" className={inputClass} />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phoneNumber" className={labelClass}>Phone Number</label>
              <input type="tel" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber}
                onChange={handleInputChange} required placeholder="+260..." className={inputClass} />
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className={labelClass}>Username</label>
              <input type="text" id="username" name="username" value={formData.username}
                onChange={handleInputChange} required placeholder="Choose a username" className={inputClass} />
            </div>

            {/* Role */}
            <div>
              <label className={labelClass}>Role</label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: r.value }))}
                    className={`p-3 rounded-xl border text-left transition-all duration-150 ${
                      formData.role === r.value
                        ? 'border-blue-500/60 bg-blue-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-semibold">{r.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{r.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className={labelClass}>Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} id="password" name="password"
                    value={formData.password} onChange={handleInputChange} required
                    placeholder="Min. 8 characters" className={inputClass + ' pr-10'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className={labelClass}>Confirm</label>
                <input type="password" id="confirmPassword" name="confirmPassword"
                  value={formData.confirmPassword} onChange={handleInputChange} required
                  placeholder="Repeat password" className={inputClass} />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-6 rounded-xl font-semibold text-white flex items-center justify-center space-x-2 transition-all duration-200 mt-2
                ${loading
                  ? 'bg-blue-700/50 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98] shadow-lg shadow-blue-500/25'
                }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-slate-500 text-sm">Already have an account? </span>
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
