import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PrescriptionService, { CreatePrescriptionData, MedicationItem } from '../../services/prescriptionService';
import { toast } from 'react-toastify';

interface PrescriptionFormProps {
  onPrescriptionCreated?: () => void;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ onPrescriptionCreated }) => {
  const { user } = useAuth();
  const [patientId, setPatientId] = useState<string>('');
  const [medications, setMedications] = useState<MedicationItem[]>([{ name: '', dosage: '', quantity: 1 }]);
  const [deliveryAddress, setDeliveryAddress] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleMedicationChange = (index: number, field: keyof MedicationItem, value: string | number) => {
    const newMedications = [...medications];
    (newMedications[index][field] as any) = value; // Type assertion for simplicity
    setMedications(newMedications);
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', quantity: 1 }]);
  };

  const removeMedication = (index: number) => {
    const newMedications = medications.filter((_, i) => i !== index);
    setMedications(newMedications);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'doctor') {
      toast.error('Only doctors can create prescriptions.');
      return;
    }

    setLoading(true);
    try {
      const prescriptionData: CreatePrescriptionData = {
        patient_id: patientId,
        doctor_id: user.id, // Auto-fill doctor_id from authenticated user
        medications,
        delivery_address: deliveryAddress,
        notes,
      };
      await PrescriptionService.createPrescription(prescriptionData);
      toast.success('Prescription created successfully!');
      // Clear form
      setPatientId('');
      setMedications([{ name: '', dosage: '', quantity: 1 }]);
      setDeliveryAddress('');
      setNotes('');
      onPrescriptionCreated?.();
    } catch (error) {
      console.error('Failed to create prescription:', error);
      toast.error('Failed to create prescription. Please check your input.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Prescription</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="patientId" className="block text-sm font-medium text-gray-700">Patient ID</label>
          <input
            type="text"
            id="patientId"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            required
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Medications</label>
          {medications.map((med, index) => (
            <div key={index} className="flex space-x-2 items-end">
              <div className="flex-1">
                <label htmlFor={`med-name-${index}`} className="block text-xs font-medium text-gray-600">Name</label>
                <input
                  type="text"
                  id={`med-name-${index}`}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  value={med.name}
                  onChange={(e) => handleMedicationChange(index, 'name', e.target.value)}
                  required
                />
              </div>
              <div className="flex-1">
                <label htmlFor={`med-dosage-${index}`} className="block text-xs font-medium text-gray-600">Dosage</label>
                <input
                  type="text"
                  id={`med-dosage-${index}`}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  value={med.dosage}
                  onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                  required
                />
              </div>
              <div className="w-20">
                <label htmlFor={`med-quantity-${index}`} className="block text-xs font-medium text-gray-600">Qty</label>
                <input
                  type="number"
                  id={`med-quantity-${index}`}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm"
                  value={med.quantity}
                  onChange={(e) => handleMedicationChange(index, 'quantity', parseInt(e.target.value))}
                  min="1"
                  required
                />
              </div>
              {medications.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMedication(index)}
                  className="p-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addMedication}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Add Medication
          </button>
        </div>

        <div>
          <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-700">Delivery Address</label>
          <input
            type="text"
            id="deliveryAddress"
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            id="notes"
            rows={3}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Prescription'}
        </button>
      </form>
    </div>
  );
};

export default PrescriptionForm;
