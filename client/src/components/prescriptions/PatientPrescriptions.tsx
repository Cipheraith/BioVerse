import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PrescriptionService, { Prescription } from '../../services/prescriptionService';
import { toast } from 'react-toastify';

const PatientPrescriptions: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      if (!user || user.role !== 'patient') {
        setError('Access Denied: Only patients can view their prescriptions.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await PrescriptionService.getPatientPrescriptions(user.id);
        setPrescriptions(data);
      } catch (err) {
        console.error('Failed to fetch prescriptions:', err);
        setError('Failed to load prescriptions.');
        toast.error('Failed to load prescriptions.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescriptions();
  }, [user]);

  if (loading) {
    return <div className="text-center py-8">Loading prescriptions...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  if (prescriptions.length === 0) {
    return <div className="text-center py-8 text-gray-600">No prescriptions found.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">My Prescriptions</h2>
      <div className="space-y-4">
        {prescriptions.map((prescription) => (
          <div key={prescription.id} className="border border-gray-200 rounded-md p-4 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-blue-700">Prescription ID: {prescription.id.substring(0, 8)}...</h3>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${{
                issued: 'bg-blue-100 text-blue-800',
                pending_pharmacy: 'bg-yellow-100 text-yellow-800',
                filled: 'bg-green-100 text-green-800',
                in_delivery: 'bg-purple-100 text-purple-800',
                delivered: 'bg-gray-100 text-gray-800',
                cancelled: 'bg-red-100 text-red-800',
              }[prescription.status]}`}>
                {prescription.status.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
            <p className="text-gray-600 mb-1">Issued Date: {new Date(prescription.issue_date).toLocaleDateString()}</p>
            {prescription.delivery_address && (
              <p className="text-gray-600 mb-1">Delivery Address: {prescription.delivery_address}</p>
            )}
            {prescription.notes && (
              <p className="text-gray-600 mb-1">Notes: {prescription.notes}</p>
            )}
            <div className="mt-3">
              <h4 className="text-md font-medium text-gray-700">Medications:</h4>
              <ul className="list-disc list-inside text-gray-600">
                {prescription.medications.map((med, idx) => (
                  <li key={idx}>{med.name} - {med.dosage} ({med.quantity} units)</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientPrescriptions;
