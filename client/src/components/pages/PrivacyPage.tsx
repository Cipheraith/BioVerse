import React from 'react';
import { Link } from 'react-router-dom';

const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-xl text-gray-600">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="prose max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-600 mb-4">
                BioVerse is committed to protecting your privacy and ensuring the security of your
                personal and health information. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our platform.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
              <h3 className="text-xl font-semibold mb-2">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4">
                <li>Name and contact information</li>
                <li>Date of birth and gender</li>
                <li>Government-issued identification numbers</li>
                <li>Insurance information</li>
                <li>Emergency contact details</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">Health Information</h3>
              <ul className="list-disc list-inside text-gray-600 mb-4">
                <li>Medical history and conditions</li>
                <li>Medications and allergies</li>
                <li>Test results and diagnoses</li>
                <li>Treatment plans and progress notes</li>
                <li>Healthcare provider communications</li>
              </ul>

              <h3 className="text-xl font-semibold mb-2">Technical Information</h3>
              <ul className="list-disc list-inside text-gray-600">
                <li>Device and browser information</li>
                <li>IP address and location data</li>
                <li>Usage data and analytics</li>
                <li>Cookies and tracking information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-600">
                <li>Provide and improve our healthcare services</li>
                <li>Process appointments and prescriptions</li>
                <li>Facilitate communication with healthcare providers</li>
                <li>Ensure platform security and prevent fraud</li>
                <li>Comply with legal and regulatory requirements</li>
                <li>Send important notifications and updates</li>
                <li>Analyze and improve our platform performance</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
              <p className="text-gray-600 mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside text-gray-600">
                <li>Healthcare providers involved in your care</li>
                <li>Insurance companies for billing purposes</li>
                <li>Third-party service providers who assist in our operations</li>
                <li>Legal authorities when required by law</li>
                <li>Emergency services in case of medical emergencies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-600 mb-4">
                We implement robust security measures to protect your information:
              </p>
              <ul className="list-disc list-inside text-gray-600">
                <li>End-to-end encryption for all data transmission</li>
                <li>Regular security audits and assessments</li>
                <li>Strict access controls and authentication</li>
                <li>Secure data centers and backup systems</li>
                <li>Employee training on privacy and security</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
              <p className="text-gray-600 mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside text-gray-600">
                <li>Access your personal information</li>
                <li>Request corrections to your data</li>
                <li>Delete your account and associated data</li>
                <li>Opt-out of marketing communications</li>
                <li>File a complaint about privacy concerns</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy or our privacy practices,
                please contact our Privacy Officer:
              </p>
              <div className="mt-4">
                <p className="text-gray-600">Email: privacy@bioverse.health</p>
                <p className="text-gray-600">Phone: 1-800-BIOVERSE</p>
                <p className="text-gray-600">
                  Address: 123 Healthcare Ave, Suite 456<br />
                  Medical District, Health City, 12345
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Related Documents:
            {' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </Link>
            {' | '}
            <Link to="/security" className="text-blue-600 hover:text-blue-500">
              Security Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPage;
