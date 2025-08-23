import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../services/api';

interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  lastVisit: string;
  status: 'active' | 'inactive' | 'critical';
}

const PatientList: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'critical'>('all');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getPatients();
        setPatients(response);
      } catch (err) {
        setError('Failed to fetch patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filteredPatients = patients
    .filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(patient => 
      filter === 'all' || patient.status === filter
    );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patients</h1>
        <Link
          to="/patients/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Add Patient
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'all'
                ? 'bg-gray-200 text-gray-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'active'
                ? 'bg-green-200 text-green-800'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('inactive')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'inactive'
                ? 'bg-gray-200 text-gray-800'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Inactive
          </button>
          <button
            onClick={() => setFilter('critical')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              filter === 'critical'
                ? 'bg-red-200 text-red-800'
                : 'bg-red-100 text-red-600 hover:bg-red-200'
            }`}
          >
            Critical
          </button>
        </div>
      </div>

      {/* Patient List */}
      <div className="space-y-4">
        {filteredPatients.map((patient) => (
          <Link
            key={patient.id}
            to={`/patients/${patient.id}`}
            className="block bg-white p-6 rounded-lg shadow-sm border hover:border-blue-500 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{patient.name}</h3>
                <p className="text-gray-600">ID: {patient.id}</p>
                <div className="mt-2 text-sm text-gray-500">
                  <p>Age: {patient.age}</p>
                  <p>Gender: {patient.gender}</p>
                  <p>Blood Type: {patient.bloodType}</p>
                  <p>Last Visit: {new Date(patient.lastVisit).toLocaleDateString()}</p>
                </div>
              </div>
              <span
                className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(
                  patient.status
                )}`}
              >
                {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
              </span>
            </div>
          </Link>
        ))}

        {filteredPatients.length === 0 && (
          <div className="text-center text-gray-500 p-6">
            No patients found
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientList;
