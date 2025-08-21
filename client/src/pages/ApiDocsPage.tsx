import React from 'react';
import { motion } from 'framer-motion';

const ApiDocsPage: React.FC = () => {
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
            API Documentation
          </h1>
          <p className="text-xl text-gray-300">
            Explore our robust API for seamless health data integration.
          </p>
        </motion.div>
      </header>

      {/* Documentation Content */}
      <section className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-10 rounded-2xl border border-slate-700"
        >
          <h2 className="text-3xl font-bold text-center mb-8">
            Getting Started
          </h2>
          <p className="text-gray-300 text-lg mb-6">
            Our API provides the tools you need to integrate BioVerse into your existing systems effortlessly.
          </p>
          <code className="block bg-slate-900/75 p-4 rounded-md text-green-400">
            $ curl -X GET 'https://api.bioverse.com/health'
          </code>
        </motion.div>

        {/* More Content Examples */}
        <div className="grid md:grid-cols-2 gap-8 mt-12">
          {/* Feature Example */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }} 
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-slate-700"
          >
            <h3 className="text-xl font-bold mb-2">
              Health Twin Endpoint
            </h3>
            <p className="text-gray-300">
              Utilize this endpoint to access and analyze comprehensive health twin data.
            </p>
            <code className="block bg-slate-900/75 p-4 rounded-md text-yellow-400">
              GET /v1/health
            </code>
          </motion.div>

          {/* Security & Authorization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-slate-700"
          >
            <h3 className="text-xl font-bold mb-2">
              Security & Authorization
            </h3>
            <p className="text-gray-300">
              Ensure secure access to the API using our industry-standard authentication methods.
            </p>
            <code className="block bg-slate-900/75 p-4 rounded-md text-pink-400">
              Authorization: Bearer &lt;token&gt;
            </code>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ApiDocsPage;

