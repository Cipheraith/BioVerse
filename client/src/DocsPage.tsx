import React from 'react';
import { motion } from 'framer-motion';
import { Code, BookOpen, Zap, Shield, Database, Activity } from 'lucide-react';

const DocsPage: React.FC = () => {
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
            Integrate BioVerse AI health insights into your applications
          </p>
        </motion.div>
      </header>

      {/* Quick Start Guide */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-slate-700"
          >
            <Code className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Quick Start</h3>
            <p className="text-gray-300 mb-4">
              Get started with the BioVerse API in minutes
            </p>
            <div className="bg-slate-900/50 p-3 rounded-lg">
              <code className="text-green-400 text-sm">
                curl -X GET https://api.bioverse.zm/v1/health-twin
              </code>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-slate-700"
          >
            <Shield className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Authentication</h3>
            <p className="text-gray-300 mb-4">
              Secure API access with OAuth 2.0
            </p>
            <div className="bg-slate-900/50 p-3 rounded-lg">
              <code className="text-yellow-400 text-sm">
                Authorization: Bearer &lt;token&gt;
              </code>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-slate-700"
          >
            <Zap className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Rate Limits</h3>
            <p className="text-gray-300 mb-4">
              1000 requests per hour for free tier
            </p>
            <div className="text-sm text-gray-400">
              Pro tier: 10,000/hour<br />
              Enterprise: Unlimited
            </div>
          </motion.div>
        </div>

        {/* API Endpoints */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-slate-700 mb-8"
        >
          <div className="flex items-center mb-6">
            <BookOpen className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-3xl font-bold">API Endpoints</h2>
          </div>

          <div className="space-y-6">
            {/* Health Twin Endpoint */}
            <div className="border-l-4 border-cyan-400 pl-6">
              <h3 className="text-xl font-semibold text-cyan-400 mb-2">GET /v1/health-twin</h3>
              <p className="text-gray-300 mb-3">Retrieve AI-powered health twin data for a patient</p>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <code className="text-green-400 text-sm">
                  {`{
  "patient_id": "12345",
  "health_score": 87,
  "risk_factors": ["hypertension", "smoking"],
  "predictions": {
    "diabetes_risk": 0.23,
    "cardiovascular_risk": 0.15
  }
}`}
                </code>
              </div>
            </div>

            {/* Real-time Monitoring */}
            <div className="border-l-4 border-purple-400 pl-6">
              <h3 className="text-xl font-semibold text-purple-400 mb-2">GET /v1/monitoring/realtime</h3>
              <p className="text-gray-300 mb-3">Access real-time health monitoring data</p>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <code className="text-green-400 text-sm">
                  {`{
  "vital_signs": {
    "heart_rate": 72,
    "blood_pressure": "120/80",
    "temperature": 98.6
  },
  "timestamp": "2024-01-15T10:30:00Z"
}`}
                </code>
              </div>
            </div>

            {/* Molecular Analysis */}
            <div className="border-l-4 border-green-400 pl-6">
              <h3 className="text-xl font-semibold text-green-400 mb-2">POST /v1/analysis/molecular</h3>
              <p className="text-gray-300 mb-3">Submit molecular data for AI analysis</p>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <code className="text-green-400 text-sm">
                  {`{
  "sample_id": "MOL_001",
  "analysis_type": "genomic",
  "markers": ["BRCA1", "APOE4", "CYP2D6"],
  "results": {
    "risk_assessment": "low",
    "recommendations": ["regular_screening"]
  }
}`}
                </code>
              </div>
            </div>
          </div>
        </motion.div>

        {/* SDK Examples */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-slate-700"
        >
          <div className="flex items-center mb-6">
            <Database className="w-8 h-8 text-purple-400 mr-3" />
            <h2 className="text-3xl font-bold">SDK Examples</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* JavaScript SDK */}
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-3">JavaScript</h3>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <code className="text-sm">
                  {`import BioVerse from '@bioverse/sdk';

const client = new BioVerse({
  apiKey: 'your-api-key'
});

const healthTwin = await client
  .getHealthTwin('patient-id');
  
console.log(healthTwin.predictions);`}
                </code>
              </div>
            </div>

            {/* Python SDK */}
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-3">Python</h3>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <code className="text-sm">
                  {`from bioverse import Client

client = Client(api_key='your-api-key')

health_twin = client.get_health_twin(
    patient_id='patient-id'
)

print(health_twin.risk_assessment)`}
                </code>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default DocsPage;
