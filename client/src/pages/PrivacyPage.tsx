import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const PrivacyPage: React.FC = () => {
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
            Privacy Policy
          </h1>
          <p className="text-xl text-gray-300">
            Your data security and privacy are our top priorities
          </p>
        </motion.div>
      </header>

      {/* Privacy Content */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-slate-700"
          >
            <Shield className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Data Protection</h3>
            <p className="text-gray-300 mb-4">
              We use military-grade encryption to protect your health data and ensure it remains confidential.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-slate-700"
          >
            <Lock className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Access Control</h3>
            <p className="text-gray-300 mb-4">
              You have complete control over who can access your health information and for what purpose.
            </p>
          </motion.div>
        </div>

        {/* Privacy Policy Details */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-slate-700"
        >
          <div className="flex items-center mb-6">
            <FileText className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-3xl font-bold">Privacy Policy Details</h2>
          </div>

          <div className="space-y-6 text-gray-300">
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Information We Collect</h3>
              <p>
                BioVerse collects health-related data to provide personalized healthcare insights. This includes
                medical records, device data, and user preferences, all with your explicit consent.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">How We Use Your Data</h3>
              <p>
                Your data is used solely to improve your health outcomes through AI-powered analysis,
                predictive modeling, and personalized recommendations. We never sell your data to third parties.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Data Security</h3>
              <p>
                We employ blockchain technology, end-to-end encryption, and strict access controls to ensure
                your health data remains secure and private at all times.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-white mb-3">Your Rights</h3>
              <p>
                You have the right to access, modify, or delete your data at any time. You can also control
                data sharing preferences and revoke consent for specific uses of your information.
              </p>
            </div>

            <div className="pt-6 border-t border-slate-700">
              <p className="text-sm text-gray-400">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default PrivacyPage;
