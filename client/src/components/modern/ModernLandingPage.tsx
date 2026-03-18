import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle, Shield, Globe, Menu, X,
  Activity, Layers, MapPin, BarChart3, Users, Database,
  Link2, Zap, TrendingUp, Network
} from 'lucide-react';

const ModernLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const modules = [
    {
      icon: Layers,
      title: 'Supply Chain Intelligence',
      description: 'Predict stockouts of essential medicines before they occur using historical distribution and consumption data.',
      color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400',
      features: ['Cross-district inventory visibility', 'Automated reorder alerts', 'Distribution route optimization']
    },
    {
      icon: Activity,
      title: 'Outbreak Detection',
      description: 'Real-time scanning of aggregate patient logs to identify symptom spikes and trigger early epidemiological responses.',
      color: 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400',
      features: ['Spatial anomaly mapping', 'Ministry alert automation', 'Case rate trend analysis']
    },
    {
      icon: MapPin,
      title: 'Facility Resource Mapping',
      description: 'Live bed availability, functional equipment status, and staff capacity across your health district.',
      color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400',
      features: ['Live bed capacity tracking', 'Equipment uptime monitoring', 'Department load balancing']
    },
    {
      icon: Shield,
      title: 'Emergency Logistics',
      description: 'Intelligent ambulance routing matched to facility capability and real-time availability data.',
      color: 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400',
      features: ['Nearest capable facility routing', 'Dispatch coordination', 'Response time tracking']
    },
    {
      icon: Database,
      title: 'Pharmacy Coordination',
      description: 'Digital prescription management and pharmacy network visibility ensuring medication availability at the point of need.',
      color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400',
      features: ['Digital prescription routing', 'Cross-pharmacy stock queries', 'Delivery coordination']
    },
    {
      icon: BarChart3,
      title: 'System Dashboard',
      description: 'Ministry-level visibility into the state of every facility: green, amber, or red, updated in real time.',
      color: 'text-gray-700 bg-gray-100 dark:bg-gray-700/40 dark:text-gray-300',
      features: ['District-level heat maps', 'Automated status reports', 'Trend alerts for decision-makers']
    }
  ];

  const stats = [
    { value: 'System-Level', label: 'Predictive Scope' },
    { value: 'Real-Time', label: 'Data Visibility' },
    { value: 'API-First', label: 'Architecture' },
    { value: '99.9%', label: 'Target System Uptime' },
  ];

  const unifyingPoints = [
    {
      icon: Link2,
      title: 'Unified Data Layer',
      desc: 'Pulls together HMIS, EMR, and pharmacy systems so every stakeholder works from the same picture.'
    },
    {
      icon: Network,
      title: 'Cross-Facility Coordination',
      desc: 'Facilities share resource availability and patient routing in real time across the district.'
    },
    {
      icon: TrendingUp,
      title: 'Predictive Infrastructure',
      desc: 'Forecasts supply gaps, capacity pressure, and outbreak signals before they become crises.'
    },
    {
      icon: Zap,
      title: 'Instant Alerts',
      desc: 'Critical signals escalate automatically from facility level up to ministry decision makers.'
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-x-hidden">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img src="/bio.png" alt="BioVerse" className="h-9 w-9" />
              <div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">BioVerse</span>
                <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold leading-none uppercase tracking-wider">Health Unifying System</div>
              </div>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              {['Modules', 'Unify', 'About'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 font-medium text-sm"
                >
                  {item}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium text-sm px-3 py-2"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-colors shadow-sm"
              >
                Register Facility
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-gray-600 dark:text-gray-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
            <div className="px-4 py-6 space-y-4">
              {['Modules', 'Unify', 'About'].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase()}`}
                  className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 font-medium py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => navigate('/login')}
                  className="block w-full text-left text-gray-700 dark:text-gray-300 font-medium py-2"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-center"
                >
                  Register Facility
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="relative pt-32 pb-24 px-4 overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 dark:from-blue-950/20 to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full px-4 py-2 border border-blue-100 dark:border-blue-800 mb-8 font-medium text-sm">
            <Activity className="w-4 h-4 mr-2" />
            Public Health Infrastructure
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-8 text-gray-900 dark:text-white">
            The Operating System<br className="hidden md:block" />
            <span className="text-blue-600">for Your Health System</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 leading-relaxed">
            Health systems fail when no one can see the full picture.
            BioVerse gives ministries, district managers, and facility coordinators
            live visibility into supply chains, resource availability, outbreak signals,
            and emergency logistics, all in one unified platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 shadow-md w-full sm:w-auto text-lg"
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

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stat.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modules" className="py-24 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              What BioVerse Coordinates
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Six operational modules giving your health network a shared view of supply, capacity, emergencies, and disease signals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {modules.map((mod, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              >
                <div className={`w-14 h-14 ${mod.color} rounded-xl flex items-center justify-center mb-6`}>
                  <mod.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{mod.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed text-sm">{mod.description}</p>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  {mod.features.map((f, fi) => (
                    <li key={fi} className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Health Unifying System Section */}
      <section id="unify" className="py-24 bg-white dark:bg-gray-950 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full px-4 py-2 border border-blue-100 dark:border-blue-800 mb-6 font-medium text-sm">
              <Network className="w-4 h-4 mr-2" />
              Health Unifying System
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
              Beyond Coordination,<br />Built to <span className="text-blue-600">Unify</span> Your Health System
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              BioVerse bridges the fragmentation between siloed health systems, creating a single source of truth
              so every stakeholder, from health workers to the Minister of Health, acts from the same data.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {unifyingPoints.map((point, i) => (
              <div key={i} className="flex items-start space-x-5 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0">
                  <point.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{point.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{point.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Integration note */}
          <div className="mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-2xl text-center">
            <p className="text-blue-800 dark:text-blue-300 font-medium">
              API-first design integrates with <strong>DHIS2</strong>, <strong>OpenMRS</strong>, and <strong>HL7 FHIR</strong> workflows,
              working alongside your existing infrastructure, not replacing it.
            </p>
          </div>
        </div>
      </section>

      {/* About / Who Uses */}
      <section id="about" className="py-24 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-6">
                We Predict System Failures,<br />Not Patient Outcomes
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                BioVerse works with stock counts, bed occupancy, district case reports, and facility capacity data.
                No individual patient genomics, no personal health tracking.
                The system finds the breaking points <em>before</em> they cause harm.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
                Standard API-first stack: React, Node.js, Python FastAPI, PostgreSQL, MongoDB.
                Designed to integrate with DHIS2, OpenMRS, and HL7 FHIR workflows.
              </p>

              <div className="space-y-4">
                {[
                  'Works at system level, not individual patient tracking',
                  'API-driven integration with existing HMIS platforms',
                  'Role-based access for ministry, district, and facility staff',
                  'Real-time alerts via web, SMS, and push notifications',
                  'Audit trails and compliance reporting for health authorities',
                ].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Who Uses BioVerse</h3>
              <div className="space-y-6">
                {[
                  {
                    role: 'Ministry of Health',
                    desc: 'National-level dashboard with facility health scores, district-wide supply status, and outbreak alerts.',
                    icon: Globe
                  },
                  {
                    role: 'District Health Officers',
                    desc: 'Cross-facility resource allocation, emergency dispatch coordination, and daily facility summaries.',
                    icon: BarChart3
                  },
                  {
                    role: 'Facility Managers',
                    desc: 'Bed management, equipment tracking, pharmacy inventory, and patient flow within their facility.',
                    icon: MapPin
                  },
                  {
                    role: 'Health Workers',
                    desc: 'Simple forms for stock updates, patient intake logs, and coordinated care referrals.',
                    icon: Users
                  },
                ].map((user, i) => (
                  <div key={i} className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <user.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white text-sm">{user.role}</div>
                      <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{user.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="cta" className="py-24 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Connect Your Health Network
          </h2>
          <p className="text-xl text-blue-100 mb-12 leading-relaxed">
            Start coordinating supply stock, facility capacity, and emergency response across your district or ministry, all in one platform.
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
              className="border-2 border-white hover:bg-blue-700 font-bold py-4 px-10 rounded-lg text-lg transition-colors"
            >
              Read Documentation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <img src="/bio.png" alt="BioVerse" className="h-8 w-8" />
              <div>
                <span className="text-base font-bold text-white">BioVerse</span>
                <div className="text-[10px] text-blue-400 uppercase font-semibold tracking-wider">Health Unifying System</div>
              </div>
            </div>

            <div className="flex items-center space-x-6 text-sm">
              <a href="/privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="/docs" className="hover:text-white transition-colors">Docs</a>
              <a href="/contact" className="hover:text-white transition-colors">Contact</a>
              <a href="/about" className="hover:text-white transition-colors">About</a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} BioVerse Health Systems. Built in Zambia 🇿🇲</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernLandingPage;