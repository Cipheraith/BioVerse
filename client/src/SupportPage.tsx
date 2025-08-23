import React from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, LayoutDashboard, MessageCircle } from 'lucide-react';

const SupportPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent mb-4">
            Support Center
          </h1>
          <p className="text-xl text-gray-300">
            How can we assist you today?
          </p>
        </motion.div>
      </header>

      {/* Support Content */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Top Queries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-slate-700"
          >
            <Award className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Top Queries</h3>
            <p className="text-gray-300 mb-4">
              Browse through our popular questions
            </p>
            <ul className="list-disc ml-4 space-y-2">
              <li><a href="#" className="text-cyan-400 hover:text-cyan-300">Using the BioVerse portal</a></li>
              <li><a href="#" className="text-cyan-400 hover:text-cyan-300">How to request data access?</a></li>
              <li><a href="#" className="text-cyan-400 hover:text-cyan-300">Understanding health insights</a></li>
            </ul>
          </motion.div>

          {/* Security Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-slate-700"
          >
            <Lock className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Security Information</h3>
            <p className="text-gray-300 mb-4">
              Learn about our privacy and security protocols
            </p>
            <a href="#" className="text-purple-400 hover:text-purple-300">
              BioVerse Security Practices
            </a>
          </motion.div>

          {/* Dashboard Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-slate-700"
          >
            <LayoutDashboard className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Dashboard Guide</h3>
            <p className="text-gray-300 mb-4">
              Discover how to navigate your dashboard effectively
            </p>
            <a href="#" className="text-green-400 hover:text-green-300">
              Start Dashboard Tutorial
            </a>
          </motion.div>
        </div>

        {/* Feedback Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 max-w-2xl mx-auto bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-slate-700"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Feedback</h2>
          <form className="space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
            />
            <textarea
              rows={6}
              placeholder="Your Feedback"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Submit Feedback
            </motion.button>
          </form>
        </motion.div>
      </section>
    </div>
  );
};

export default SupportPage;

