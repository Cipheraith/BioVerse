import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ApiService from '../../services/api';

interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  dateTime: string;
  type: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

const AppointmentList: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getAppointments();
        setAppointments(response);
      } catch (err) {
        setError('Failed to fetch appointments');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter(appointment => 
    filter === 'all' || appointment.status === filter
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Appointments</h1>
        <Link
          to="/appointments/add"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          New Appointment
        </Link>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2 mb-6">
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
          onClick={() => setFilter('scheduled')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'scheduled'
              ? 'bg-blue-200 text-blue-800'
              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
          }`}
        >
          Scheduled
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'completed'
              ? 'bg-green-200 text-green-800'
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('cancelled')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'cancelled'
              ? 'bg-red-200 text-red-800'
              : 'bg-red-100 text-red-600 hover:bg-red-200'
          }`}
        >
          Cancelled
        </button>
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.map((appointment) => (
          <div
            key={appointment.id}
            className="bg-white p-6 rounded-lg shadow-sm border"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{appointment.type}</h3>
                <p className="text-gray-600">
                  Patient: {appointment.patientName}
                </p>
                <p className="text-gray-600">
                  Doctor: Dr. {appointment.doctorName}
                </p>
                {appointment.notes && (
                  <p className="text-gray-500 mt-2 text-sm">
                    Notes: {appointment.notes}
                  </p>
                )}
              </div>
              <div className="text-right">
                <span
                  className={`inline-block px-2 py-1 rounded text-sm ${getStatusColor(
                    appointment.status
                  )}`}
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
                <p className="mt-2 text-gray-600">
                  {new Date(appointment.dateTime).toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  {new Date(appointment.dateTime).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="text-center text-gray-500 p-6">
            No appointments found
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentList;
