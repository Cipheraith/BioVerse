import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ApiService from '../../services/api';

interface PatientData {
  id: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  medicalHistory: string[];
  allergies: string[];
  medications: string[];
  lastVisit: string;
  upcomingAppointments: Array<{
    id: string;
    date: string;
    type: string;
    doctor: string;
  }>;
}

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getPatient(id || '');
        setPatient(response);
      } catch (err) {
        setError('Failed to fetch patient data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPatientData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error || 'Patient not found'}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{patient.name}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-3">
            <div>
              <span className="font-medium">Age:</span> {patient.age}
            </div>
            <div>
              <span className="font-medium">Gender:</span> {patient.gender}
            </div>
            <div>
              <span className="font-medium">Blood Type:</span> {patient.bloodType}
            </div>
            <div>
              <span className="font-medium">Last Visit:</span> {new Date(patient.lastVisit).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Medical History */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Medical History</h2>
          <ul className="list-disc list-inside space-y-2">
            {patient.medicalHistory.map((item, index) => (
              <li key={index} className="text-gray-700">{item}</li>
            ))}
          </ul>
        </div>

        {/* Allergies */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Allergies</h2>
          <div className="flex flex-wrap gap-2">
            {patient.allergies.map((allergy, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm"
              >
                {allergy}
              </span>
            ))}
          </div>
        </div>

        {/* Current Medications */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Current Medications</h2>
          <ul className="list-disc list-inside space-y-2">
            {patient.medications.map((medication, index) => (
              <li key={index} className="text-gray-700">{medication}</li>
            ))}
          </ul>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white p-6 rounded-lg shadow-sm border col-span-full">
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          <div className="space-y-4">
            {patient.upcomingAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="flex justify-between items-center p-4 border rounded"
              >
                <div>
                  <p className="font-medium">{appointment.type}</p>
                  <p className="text-sm text-gray-500">with Dr. {appointment.doctor}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {new Date(appointment.date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(appointment.date).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {patient.upcomingAppointments.length === 0 && (
              <p className="text-gray-500 italic">No upcoming appointments</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetail;
