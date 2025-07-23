import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiTarget, FiEye, FiCpu, FiBarChart2, FiUsers, FiPhoneCall } from 'react-icons/fi';

const AboutPage: React.FC = () => {
  const featureCard = (
    icon: React.ReactNode,
    title: string,
    description: string,
    delay: number
  ) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg h-full"
    >
      <div className="text-4xl text-blue-300 mb-4">{icon}</div>
      <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
    </motion.div>
  );

  return (
    <div className="relative min-h-screen overflow-hidden bg-cover bg-center text-white" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1532938911079-bfc1ff0238ae?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D")' }}>
      <div className="absolute inset-0 bg-black bg-opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />

      <main className="relative z-10 p-8 md:p-16">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
            About BioVerse
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto">
            BioVerse: Revolutionizing Healthcare with Zambia's AI-Powered Predictive Health Twin Network. We are building a dynamic, continuously learning digital twin for every citizen, transforming healthcare from reactive to proactive, predictive, and personalized. Experience real-time coordination, AI-driven insights, and a future where health is managed with unprecedented intelligence.
          </p>
        </motion.div>

        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
            What Makes BioVerse Groundbreaking?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureCard(
              <FiTarget />,
              'Individualized Health Twins',
              'A holistic, dynamic health profile for every citizen, aggregating comprehensive health data.',
              0.2
            )}
            {featureCard(
              <FiEye />,
              'Proactive & Predictive Care',
              'AI models predict health risks before symptoms appear, enabling early, personalized interventions.',
              0.4
            )}
            {featureCard(
              <FiCpu />,
              'Continuous Learning',
              'Our AI constantly learns from new data, enhancing predictive accuracy and personalization over time.',
              0.6
            )}
            {featureCard(
              <FiBarChart2 />,
              'Dynamic Resource Optimization',
              'Aggregated insights predict outbreaks and optimize allocation of medical resources and personnel.',
              0.8
            )}
            {featureCard(
              <FiUsers />,
              'Unprecedented Data Insights',
              'Anonymized data drives evidence-based policy, research, and public health initiatives.',
              1.0
            )}
            {featureCard(
              <FiPhoneCall />,
              'Real-time Coordination',
              'Seamlessly connecting patients, health workers, pharmacies, and ambulances, online or offline.',
              1.2
            )}
          </div>
        </section>

        <section className="bg-black/30 backdrop-blur-md rounded-3xl p-12 mb-20 border border-white/20">
          <h2 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            Why I Built BioVerse: A Personal Journey
          </h2>
          <div className="max-w-4xl mx-auto text-center text-lg text-gray-200 leading-loose">
            <p className="mb-6">
              My name is Fred Solami. As a double orphan and a university dropout, my journey has been one of resilience. I've witnessed firsthand the devastating impact of reactive healthcare and the gaps in our systems. BioVerse began as a focused Sexual and Reproductive Health (SRH) platform, addressing critical needs in that domain. However, after being selected for the ZICTA Young Innovators Programme, we recognized the immense potential to scale our AI-driven approach. The vision expanded: to leverage this technology to create a comprehensive, national AI-Powered Predictive Health Twin Network, transforming healthcare from reactive to proactive for every citizen.
            </p>
            <p>
              This project is more than innovation; it's about empathy and building a future where every life is protected through intelligent, compassionate systems.
            </p>
          </div>
        </section>

        <div className="text-center mt-16">
          <Link
            to="/"
            className="px-12 py-5 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-xl shadow-2xl hover:scale-110 hover:from-blue-400 hover:to-purple-500 transition-transform duration-300 border-2 border-white/50"
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AboutPage;