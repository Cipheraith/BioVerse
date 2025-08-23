import React from 'react';
import { Link } from 'react-router-dom';

interface Resource {
  title: string;
  description: string;
  icon: string;
  link: string;
}

const resources: Resource[] = [
  {
    title: 'Telemedicine Consultations',
    description: 'Connect with healthcare providers for private consultations about sexual and reproductive health.',
    icon: '👨‍⚕️',
    link: '/telemedicine'
  },
  {
    title: 'Family Planning',
    description: 'Access information and resources about contraception methods and family planning services.',
    icon: '👨‍👩‍👧‍👦',
    link: '/srh/family-planning'
  },
  {
    title: 'STI Information',
    description: 'Learn about sexually transmitted infections, testing, prevention, and treatment options.',
    icon: '🏥',
    link: '/srh/sti-info'
  },
  {
    title: 'Prenatal Care',
    description: 'Access resources and guidance for pregnancy care and maternal health services.',
    icon: '🤰',
    link: '/srh/prenatal-care'
  },
  {
    title: 'Mental Health Support',
    description: 'Connect with mental health professionals specializing in sexual and reproductive health.',
    icon: '🧠',
    link: '/srh/mental-health'
  },
  {
    title: 'Emergency Services',
    description: 'Find information about emergency contraception and urgent care services.',
    icon: '🚨',
    link: '/srh/emergency'
  }
];

const SRHPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sexual & Reproductive Health
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Access confidential resources, information, and healthcare services for your sexual
            and reproductive health needs.
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {resources.map((resource, index) => (
            <Link
              key={index}
              to={resource.link}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="text-4xl mb-4">{resource.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
              <p className="text-gray-600">{resource.description}</p>
            </Link>
          ))}
        </div>

        {/* Information Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Confidential & Private Care
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Your Privacy Matters</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Secure and encrypted communications
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Private medical records
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Confidential consultations
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Discreet billing options
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Available Services</h3>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Virtual consultations
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Prescription services
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Lab testing referrals
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Follow-up care
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Need to Talk to Someone?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our healthcare providers are available 24/7 for confidential consultations.
            Connect with a provider now or schedule an appointment at your convenience.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/telemedicine"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Start Consultation
            </Link>
            <Link
              to="/appointments"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Schedule Appointment
            </Link>
          </div>
        </div>

        {/* Emergency Notice */}
        <div className="mt-12 bg-red-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Emergency Services
          </h3>
          <p className="text-red-700">
            If you are experiencing a medical emergency, please dial your local emergency
            number (911 in the US) or visit the nearest emergency room immediately.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SRHPage;
