import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mission Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About BioVerse</h1>
          <p className="text-xl text-gray-600">
            Transforming healthcare through technology and innovation
          </p>
        </div>

        {/* Mission and Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-600">
              To make quality healthcare accessible to everyone through innovative digital solutions
              that connect patients with healthcare providers seamlessly and securely.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-600">
              To be the leading digital healthcare platform that transforms how people access and
              experience healthcare services worldwide.
            </p>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-semibold mb-2">Patient-Centered</h3>
              <p className="text-gray-600">
                We put patients first in everything we do, ensuring their needs and experiences
                drive our innovations.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold mb-2">Security & Privacy</h3>
              <p className="text-gray-600">
                We maintain the highest standards of security and privacy protection for all user data.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-semibold mb-2">Innovation</h3>
              <p className="text-gray-600">
                We continuously innovate to improve healthcare delivery and patient outcomes.
              </p>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Leadership</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold">Dr. Sarah Johnson</h3>
              <p className="text-gray-600">Chief Executive Officer</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold">Michael Chen</h3>
              <p className="text-gray-600">Chief Technology Officer</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <div className="w-24 h-24 rounded-full bg-gray-200 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold">Dr. Emily Rodriguez</h3>
              <p className="text-gray-600">Chief Medical Officer</p>
            </div>
          </div>
        </div>

        {/* Impact Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="text-4xl font-bold text-blue-600">10K+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">5K+</div>
              <div className="text-gray-600">Healthcare Providers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">50K+</div>
              <div className="text-gray-600">Consultations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">100+</div>
              <div className="text-gray-600">Partner Hospitals</div>
            </div>
          </div>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Since our founding, we've been committed to improving healthcare access and quality
            through digital innovation. Our platform has helped thousands of patients receive
            better care and enabled healthcare providers to work more efficiently.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
