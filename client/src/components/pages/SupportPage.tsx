import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqs: FAQItem[] = [
  {
    question: "How do I schedule a telemedicine appointment?",
    answer: "To schedule a telemedicine appointment, log in to your account, click on 'Telemedicine' in the navigation menu, and select 'Schedule Appointment'. Choose your preferred healthcare provider, date, and time slot.",
    category: "Appointments"
  },
  {
    question: "What should I do if I can't access my account?",
    answer: "If you're having trouble accessing your account, try resetting your password using the 'Forgot Password' link on the login page. If the issue persists, contact our support team at support@bioverse.health.",
    category: "Account"
  },
  {
    question: "Is my health information secure?",
    answer: "Yes, we take your privacy seriously. All health information is encrypted and stored securely following HIPAA guidelines. We use industry-standard security measures to protect your data.",
    category: "Privacy"
  },
  {
    question: "How do I view my medical records?",
    answer: "You can view your medical records by logging into your account and navigating to the 'Health Records' section. Here you'll find your medical history, test results, and prescriptions.",
    category: "Records"
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept major credit cards (Visa, MasterCard, American Express), PayPal, and most insurance plans. Contact your insurance provider to verify coverage for our services.",
    category: "Billing"
  },
  {
    question: "How do I update my insurance information?",
    answer: "To update your insurance information, go to your account settings and select 'Insurance Information'. Click 'Edit' to update your current insurance details or add a new insurance plan.",
    category: "Billing"
  },
  {
    question: "What should I do in case of a technical issue during a video consultation?",
    answer: "If you experience technical issues during a video consultation, try refreshing your browser or checking your internet connection. You can also call our technical support hotline at 1-800-BIOVERSE for immediate assistance.",
    category: "Technical"
  },
  {
    question: "How can I access emergency services?",
    answer: "For medical emergencies, always dial your local emergency number (911 in the US). For non-emergency situations, you can use our platform to locate the nearest healthcare facility or request an ambulance through the Emergency Services section.",
    category: "Emergency"
  }
];

const categories = Array.from(new Set(faqs.map(faq => faq.category)));

const SupportPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Center</h1>
          <p className="text-xl text-gray-600">
            Find answers to common questions or get in touch with our support team
          </p>
        </div>

        {/* Support Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-4xl mb-4">📞</div>
            <h3 className="text-xl font-semibold mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-4">
              Call us at 1-800-BIOVERSE<br />
              Available 24/7
            </p>
            <a
              href="tel:1-800-BIOVERSE"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Call Now
            </a>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-4xl mb-4">💬</div>
            <h3 className="text-xl font-semibold mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-4">
              Chat with our support team<br />
              Response time: 2 minutes
            </p>
            <button
              className="text-blue-600 hover:text-blue-500 font-medium"
              onClick={() => alert('Chat feature coming soon!')}
            >
              Start Chat
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="text-4xl mb-4">📧</div>
            <h3 className="text-xl font-semibold mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">
              Send us an email anytime<br />
              Response within 24 hours
            </p>
            <Link
              to="/contact"
              className="text-blue-600 hover:text-blue-500 font-medium"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Frequently Asked Questions
          </h2>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  !selectedCategory
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-md text-sm font-medium ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ List */}
          <div className="space-y-6">
            {filteredFaqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-6 last:border-b-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {faq.question}
                </h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}

            {filteredFaqs.length === 0 && (
              <p className="text-center text-gray-500">
                No FAQs found matching your search criteria.
              </p>
            )}
          </div>
        </div>

        {/* Still Need Help */}
        <div className="bg-blue-50 rounded-lg p-8 mt-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still Need Help?
          </h2>
          <p className="text-gray-600 mb-6">
            Our support team is here to assist you with any questions or concerns.
          </p>
          <Link
            to="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
