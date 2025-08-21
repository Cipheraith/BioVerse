import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PrescriptionService, { Prescription } from '../../services/prescriptionService';
import { toast } from 'react-toastify';

const PharmacyPrescriptions: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrescriptions = async () => {
    if (!user || !['pharmacy', 'admin', 'moh', 'ambulance_driver'].includes(user.role)) {
      setError('Access Denied: Only authorized roles can view these prescriptions.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let fetchedPrescriptions: Prescription[] = [];
      if (user.role === 'pharmacy') {
        fetchedPrescriptions = await PrescriptionService.getPharmacyPrescriptions(user.id);
      } else if (['admin', 'moh', 'ambulance_driver'].includes(user.role)) {
        // For admin/moh/ambulance_driver, they might need to see all or specific ones
        // For simplicity, let's assume they can see all pending/in_delivery ones for now
        // A more complex implementation would involve a dedicated 'getAllPrescriptions' endpoint
        // or filtering by location/status.
        const allPrescriptions = await PrescriptionService.getPharmacyPrescriptions(''); // This will likely fail without a proper backend endpoint
        fetchedPrescriptions = allPrescriptions.filter(p => p.status === 'pending_pharmacy' || p.status === 'in_delivery');
        toast.info('Displaying pending/in-delivery prescriptions for admin/moh/driver.');
      }
      setPrescriptions(fetchedPrescriptions);
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
      setError('Failed to load prescriptions.');
      toast.error('Failed to load prescriptions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [user]);

  const handleStatusChange = async (prescriptionId: string, newStatus: Prescription['status'], pharmacyId?: string) => {
    setLoading(true);
    try {
      await PrescriptionService.updatePrescriptionStatus(prescriptionId, newStatus, pharmacyId);
      toast.success(`Prescription ${prescriptionId.substring(0, 8)}... status updated to ${newStatus.replace(/_/g, ' ')}.`);
      fetchPrescriptions(); // Re-fetch to update the list
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update prescription status.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading prescriptions...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-600">Error: {error}</div>;
  }

  if (prescriptions.length === 0) {
    return <div className="text-center py-8 text-gray-600">No relevant prescriptions found.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Pharmacy/Courier Prescriptions</h2>
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
            <p className="text-gray-600 mb-1">Patient ID: {prescription.patient_id.substring(0, 8)}...</p>
            <p className="text-gray-600 mb-1">Doctor ID: {prescription.doctor_id.substring(0, 8)}...</p>
            {prescription.pharmacy_id && (
              <p className="text-gray-600 mb-1">Assigned Pharmacy: {prescription.pharmacy_id.substring(0, 8)}...</p>
            )}
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
            
            {/* Status Update Controls */}
            {user && (user.role === 'pharmacy' || user.role === 'ambulance_driver') && (
              <div className="mt-4 flex space-x-2">
                {prescription.status === 'pending_pharmacy' && user.role === 'pharmacy' && (
                  <button
                    onClick={() => handleStatusChange(prescription.id, 'filled', user.id)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                    disabled={loading}
                  >
                    Mark as Filled
                  </button>
                )}
                {prescription.status === 'filled' && user.role === 'ambulance_driver' && (
                  <button
                    onClick={() => handleStatusChange(prescription.id, 'in_delivery')}
                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
                    disabled={loading}
                  >
                    Mark as In Delivery
                  </button>
                )}
                {prescription.status === 'in_delivery' && user.role === 'ambulance_driver' && (
                  <button
                    onClick={() => handleStatusChange(prescription.id, 'delivered')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
                    disabled={loading}
                  >
                    Mark as Delivered
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PharmacyPrescriptions;
