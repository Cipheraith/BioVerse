import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface DocSection {
  id: string;
  title: string;
  content: string[];
}

const documentation: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    content: [
      'Create an account on BioVerse',
      'Complete your profile with basic information',
      'Set up your medical history and preferences',
      'Connect with healthcare providers',
      'Start using BioVerse\'s healthcare services'
    ]
  },
  {
    id: 'telemedicine',
    title: 'Telemedicine',
    content: [
      'Schedule video consultations with healthcare providers',
      'Join virtual waiting rooms for appointments',
      'Share medical documents during consultations',
      'Receive digital prescriptions and referrals',
      'Access consultation history and notes'
    ]
  },
  {
    id: 'health-records',
    title: 'Health Records',
    content: [
      'View and manage your medical history',
      'Upload medical documents and test results',
      'Track medications and allergies',
      'Share records with healthcare providers',
      'Export health data in standard formats'
    ]
  },
  {
    id: 'emergency',
    title: 'Emergency Services',
    content: [
      'Request emergency medical assistance',
      'Track ambulance location in real-time',
      'Share location and medical information',
      'Contact emergency support team',
      'Access emergency care guidelines'
    ]
  },
  {
    id: 'prescriptions',
    title: 'Prescriptions',
    content: [
      'View active prescriptions',
      'Request prescription renewals',
      'Find nearby pharmacies',
      'Track medication schedules',
      'Set medication reminders'
    ]
  },
  {
    id: 'security',
    title: 'Security & Privacy',
    content: [
      'Two-factor authentication setup',
      'Manage privacy settings',
      'Control data sharing preferences',
      'Monitor account activity',
      'Report security concerns'
    ]
  }
];

const DocsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const filteredDocs = documentation.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.content.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Documentation</h1>
          <p className="text-xl text-gray-600">
            Learn how to use BioVerse's healthcare platform
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-12">
          <input
            type="text"
            placeholder="Search documentation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <nav className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contents</h2>
              <ul className="space-y-2">
                {filteredDocs.map(section => (
                  <li key={section.id}>
                    <button
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium
                        ${activeSection === section.id
                          ? 'bg-blue-100 text-blue-800'
                          : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {section.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {filteredDocs.map(section => (
                <div
                  key={section.id}
                  id={section.id}
                  className={`bg-white rounded-lg shadow-sm p-8 ${
                    activeSection === section.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">{section.title}</h2>
                  <ul className="space-y-4">
                    {section.content.map((item, index) => (
                      <li key={index} className="flex items-start">
                        <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-800 rounded-full mr-3 text-sm">
                          {index + 1}
                        </span>
                        <span className="text-gray-600">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {filteredDocs.length === 0 && (
                <div className="text-center text-gray-500 py-12">
                  No documentation found matching your search criteria.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link
              to="/api"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">API Documentation</h3>
              <p className="text-gray-600">
                Integrate BioVerse into your applications
              </p>
            </Link>
            <Link
              to="/support"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">Support Center</h3>
              <p className="text-gray-600">
                Get help with common questions and issues
              </p>
            </Link>
            <Link
              to="/contact"
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-2">Contact Us</h3>
              <p className="text-gray-600">
                Reach out to our team for assistance
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
