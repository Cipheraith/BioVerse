import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, MessageSquare, Clock, Users, Send, Star, Sparkles, Globe } from 'lucide-react';

const ContactPage: React.FC = () => {
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
            Contact BioVerse
          </h1>
          <p className="text-xl text-gray-300">
            Get in touch with our team of healthcare innovation experts
          </p>
        </motion.div>
      </header>

      {/* Contact Info */}
      <section className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-slate-700"
          >
            <Mail className="w-12 h-12 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Email Support</h3>
            <p className="text-gray-300 mb-4">Get help from our support team</p>
            <a href="mailto:support@bioverse.zm" className="text-cyan-400 hover:text-cyan-300">
              support@bioverse.zm
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-slate-700"
          >
            <Phone className="w-12 h-12 text-purple-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Phone Support</h3>
            <p className="text-gray-300 mb-4">24/7 emergency support line</p>
            <a href="tel:+260123456789" className="text-purple-400 hover:text-purple-300">
              +260 123 456 789
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6 rounded-2xl border border-slate-700"
          >
            <MapPin className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Office Location</h3>
            <p className="text-gray-300 mb-4">Visit our headquarters</p>
            <address className="text-green-400 not-italic">
              Technology Park<br />
              Lusaka, Zambia
            </address>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-8 rounded-2xl border border-slate-700"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Send us a Message</h2>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Your Name"
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
            />
            <textarea
              rows={6}
              placeholder="Your Message"
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-400"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Send Message
            </motion.button>
          </form>
        </motion.div>
      </section>
    </div>
  );
};

export default ContactPage;
