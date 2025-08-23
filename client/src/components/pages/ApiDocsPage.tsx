import React from 'react';

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
  authentication: boolean;
  parameters?: {
    name: string;
    type: string;
    required: boolean;
    description: string;
  }[];
}

const API_ENDPOINTS: Endpoint[] = [
  {
    method: 'POST',
    path: '/api/auth/login',
    description: 'Authenticate user and receive access token',
    authentication: false,
    parameters: [
      {
        name: 'username',
        type: 'string',
        required: true,
        description: 'User\'s username or email'
      },
      {
        name: 'password',
        type: 'string',
        required: true,
        description: 'User\'s password'
      }
    ]
  },
  {
    method: 'GET',
    path: '/api/patients',
    description: 'Get list of patients',
    authentication: true,
    parameters: [
      {
        name: 'page',
        type: 'number',
        required: false,
        description: 'Page number for pagination'
      },
      {
        name: 'limit',
        type: 'number',
        required: false,
        description: 'Number of records per page'
      }
    ]
  },
  {
    method: 'GET',
    path: '/api/health-twins/:id',
    description: 'Get health twin data for a specific patient',
    authentication: true,
    parameters: [
      {
        name: 'id',
        type: 'string',
        required: true,
        description: 'Patient ID'
      }
    ]
  },
  {
    method: 'POST',
    path: '/api/appointments',
    description: 'Create a new appointment',
    authentication: true,
    parameters: [
      {
        name: 'patientId',
        type: 'string',
        required: true,
        description: 'ID of the patient'
      },
      {
        name: 'doctorId',
        type: 'string',
        required: true,
        description: 'ID of the doctor'
      },
      {
        name: 'dateTime',
        type: 'string',
        required: true,
        description: 'Appointment date and time (ISO format)'
      },
      {
        name: 'type',
        type: 'string',
        required: true,
        description: 'Type of appointment'
      }
    ]
  }
];

const ApiDocsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">API Documentation</h1>
          <p className="text-xl text-gray-600">
            Integrate BioVerse's healthcare services into your applications
          </p>
        </div>

        {/* Authentication Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-4">
              All authenticated endpoints require a valid JWT token in the Authorization header:
            </p>
            <div className="bg-gray-100 p-4 rounded-md">
              <code className="text-sm">
                Authorization: Bearer {'<your-token>'}
              </code>
            </div>
          </div>
        </div>

        {/* Rate Limiting Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limiting</h2>
          <p className="text-gray-600">
            API requests are limited to:
          </p>
          <ul className="list-disc list-inside text-gray-600 mt-2">
            <li>1000 requests per hour for authenticated endpoints</li>
            <li>100 requests per hour for non-authenticated endpoints</li>
          </ul>
        </div>

        {/* Endpoints Section */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Endpoints</h2>
          
          <div className="space-y-8">
            {API_ENDPOINTS.map((endpoint, index) => (
              <div key={index} className="border-b border-gray-200 pb-8 last:border-b-0 last:pb-0">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`
                        inline-block px-2 py-1 text-sm font-semibold rounded
                        ${endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                          endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                          endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}
                      `}>
                        {endpoint.method}
                      </span>
                      <code className="text-gray-800 font-mono">{endpoint.path}</code>
                    </div>
                    <p className="text-gray-600 mt-2">{endpoint.description}</p>
                  </div>
                  {endpoint.authentication && (
                    <span className="bg-gray-100 text-gray-600 px-2 py-1 text-sm rounded">
                      Requires Auth
                    </span>
                  )}
                </div>

                {endpoint.parameters && endpoint.parameters.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Parameters</h4>
                    <div className="bg-gray-50 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Name</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Type</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Required</th>
                            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-600">Description</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {endpoint.parameters.map((param, paramIndex) => (
                            <tr key={paramIndex}>
                              <td className="px-4 py-2 text-sm font-mono text-gray-800">{param.name}</td>
                              <td className="px-4 py-2 text-sm text-gray-600">{param.type}</td>
                              <td className="px-4 py-2 text-sm">
                                {param.required ? (
                                  <span className="text-red-600">Required</span>
                                ) : (
                                  <span className="text-gray-500">Optional</span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-sm text-gray-600">{param.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SDK Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Client SDKs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">JavaScript/TypeScript</h3>
              <code className="text-sm block bg-gray-100 p-2 rounded">
                npm install @bioverse/sdk
              </code>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Python</h3>
              <code className="text-sm block bg-gray-100 p-2 rounded">
                pip install bioverse-sdk
              </code>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold mb-2">Java</h3>
              <code className="text-sm block bg-gray-100 p-2 rounded">
                mvn install bioverse-sdk
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocsPage;
