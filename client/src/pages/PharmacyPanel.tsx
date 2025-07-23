import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// import { useAuth } from '../hooks/useAuth'; // TODO: Add auth when needed

interface Medication {
  id: string;
  name: string;
  quantity: number;
  threshold: number;
  expiryDate: string;
}

interface Prescription {
  id: string;
  patientId: string;
  patientName: string;
  medications: {
    medicationId: string;
    medicationName: string;
    dosage: string;
    quantity: number;
  }[];
  status: 'pending' | 'verified' | 'dispensed' | 'rejected';
  issuedDate: string;
  prescribedBy: string;
}

const PharmacyPanel: React.FC = () => {
  const { t } = useTranslation();
  // const { user } = useAuth(); // TODO: Use user for authorization checks
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'inventory' | 'verification'>('prescriptions');
  const [inventory, setInventory] = useState<Medication[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for demonstration - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      try {
        // Mock inventory data
        setInventory([
          { 
            id: '1', 
            name: 'Paracetamol', 
            quantity: 500, 
            threshold: 100, 
            expiryDate: '2026-05-15' 
          },
          { 
            id: '2', 
            name: 'Amoxicillin', 
            quantity: 200, 
            threshold: 50, 
            expiryDate: '2025-12-10' 
          },
          { 
            id: '3', 
            name: 'Ibuprofen', 
            quantity: 350, 
            threshold: 75, 
            expiryDate: '2026-03-22' 
          },
          { 
            id: '4', 
            name: 'Metformin', 
            quantity: 45, 
            threshold: 50, 
            expiryDate: '2025-10-05' 
          }
        ]);

        // Mock prescription data
        setPrescriptions([
          {
            id: 'p1',
            patientId: 'pat123',
            patientName: 'John Doe',
            medications: [
              { medicationId: '1', medicationName: 'Paracetamol', dosage: '500mg 3x daily', quantity: 30 },
              { medicationId: '2', medicationName: 'Amoxicillin', dosage: '250mg 2x daily', quantity: 20 }
            ],
            status: 'pending',
            issuedDate: '2025-07-15',
            prescribedBy: 'Dr. Sarah Johnson'
          },
          {
            id: 'p2',
            patientId: 'pat456',
            patientName: 'Mary Smith',
            medications: [
              { medicationId: '3', medicationName: 'Ibuprofen', dosage: '400mg as needed', quantity: 15 }
            ],
            status: 'verified',
            issuedDate: '2025-07-16',
            prescribedBy: 'Dr. Michael Wong'
          }
        ]);
        
        setIsLoading(false);
      } catch {
        setError('Failed to load pharmacy data');
        setIsLoading(false);
      }
    }, 1000);
  }, []);

  const handleVerifyPrescription = (id: string) => {
    setPrescriptions(prevPrescriptions => 
      prevPrescriptions.map(prescription => 
        prescription.id === id 
          ? { ...prescription, status: 'verified' } 
          : prescription
      )
    );
    // In a real app, this would make an API call to update the status
  };

  const handleDispensePrescription = (id: string) => {
    // In a real app, this would:
    // 1. Update the prescription status
    // 2. Reduce inventory quantities
    // 3. Record the transaction
    
    setPrescriptions(prevPrescriptions => 
      prevPrescriptions.map(prescription => 
        prescription.id === id 
          ? { ...prescription, status: 'dispensed' } 
          : prescription
      )
    );
    
    // Update inventory (simplified example)
    const prescription = prescriptions.find(p => p.id === id);
    if (prescription) {
      setInventory(prevInventory => 
        prevInventory.map(item => {
          const medicationToDispense = prescription.medications.find(m => m.medicationId === item.id);
          if (medicationToDispense) {
            return {
              ...item,
              quantity: item.quantity - medicationToDispense.quantity
            };
          }
          return item;
        })
      );
    }
  };

  const handleUpdateStock = (id: string, newQuantity: number) => {
    setInventory(prevInventory => 
      prevInventory.map(item => 
        item.id === id 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
    // In a real app, this would make an API call to update the inventory
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="animate-pulse">
          <div className="h-8 bg-white bg-opacity-10 rounded w-1/4 mx-auto mb-4"></div>
          <div className="h-64 bg-white bg-opacity-10 rounded mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-500 bg-opacity-10 text-red-500 p-4 rounded-xl">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{t('pharmacy_dashboard_title')}</h1>
      
      <div className="flex mb-6 border-b border-white border-opacity-10">
        <button 
          className={`px-4 py-2 mr-2 ${activeTab === 'prescriptions' ? 'border-b-2 border-primary font-semibold' : ''}`}
          onClick={() => setActiveTab('prescriptions')}
        >
          {t('pharmacy_medication_requests_title')}
        </button>
        <button 
          className={`px-4 py-2 mr-2 ${activeTab === 'inventory' ? 'border-b-2 border-primary font-semibold' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          {t('pharmacy_inventory_title')}
        </button>
        <button 
          className={`px-4 py-2 ${activeTab === 'verification' ? 'border-b-2 border-primary font-semibold' : ''}`}
          onClick={() => setActiveTab('verification')}
        >
          Patient Verification
        </button>
      </div>

      {activeTab === 'prescriptions' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('pharmacy_medication_requests_title')}</h2>
          
          {prescriptions.length === 0 ? (
            <p className="text-center py-8 text-gray-400">No prescriptions to display</p>
          ) : (
            <div className="grid gap-4">
              {prescriptions.map(prescription => (
                <div key={prescription.id} className="bg-white bg-opacity-10 rounded-xl p-4 shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold">{prescription.patientName}</h3>
                      <p className="text-sm opacity-70">ID: {prescription.patientId}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      prescription.status === 'pending' ? 'bg-yellow-500 bg-opacity-20 text-yellow-500' :
                      prescription.status === 'verified' ? 'bg-blue-500 bg-opacity-20 text-blue-500' :
                      prescription.status === 'dispensed' ? 'bg-green-500 bg-opacity-20 text-green-500' :
                      'bg-red-500 bg-opacity-20 text-red-500'
                    }`}>
                      {prescription.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm mb-2">Prescribed by: {prescription.prescribedBy}</p>
                  <p className="text-sm mb-4">Date: {prescription.issuedDate}</p>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold mb-2">Medications:</h4>
                    <ul className="pl-4">
                      {prescription.medications.map((med, index) => (
                        <li key={index} className="text-sm mb-1">
                          {med.medicationName} - {med.dosage} ({med.quantity} units)
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    {prescription.status === 'pending' && (
                      <button 
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm"
                        onClick={() => handleVerifyPrescription(prescription.id)}
                      >
                        Verify
                      </button>
                    )}
                    {prescription.status === 'verified' && (
                      <button 
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm"
                        onClick={() => handleDispensePrescription(prescription.id)}
                      >
                        Dispense
                      </button>
                    )}
                    {prescription.status === 'pending' && (
                      <button className="px-3 py-1 bg-red-500 text-white rounded text-sm">
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('pharmacy_inventory_title')}</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white bg-opacity-10 rounded-xl">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left">Medication</th>
                  <th className="px-4 py-2 text-left">Quantity</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Expiry Date</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map(item => (
                  <tr key={item.id} className="border-t border-white border-opacity-10">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3">{item.quantity} units</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.quantity <= 0 ? 'bg-red-500 bg-opacity-20 text-red-500' :
                        item.quantity < item.threshold ? 'bg-yellow-500 bg-opacity-20 text-yellow-500' :
                        'bg-green-500 bg-opacity-20 text-green-500'
                      }`}>
                        {item.quantity <= 0 ? 'OUT OF STOCK' :
                         item.quantity < item.threshold ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.expiryDate}</td>
                    <td className="px-4 py-3">
                      <button 
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm mr-2"
                        onClick={() => {
                          const newQuantity = prompt(`Update quantity for ${item.name}:`, item.quantity.toString());
                          if (newQuantity !== null) {
                            const parsedQuantity = parseInt(newQuantity);
                            if (!isNaN(parsedQuantity) && parsedQuantity >= 0) {
                              handleUpdateStock(item.id, parsedQuantity);
                            }
                          }
                        }}
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-6">
            <button className="px-4 py-2 bg-green-500 text-white rounded">
              Add New Medication
            </button>
          </div>
        </div>
      )}

      {activeTab === 'verification' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Patient Verification</h2>
          
          <div className="bg-white bg-opacity-10 rounded-xl p-6 shadow">
            <p className="mb-4">Verify patient identity before dispensing medication.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Patient ID or Phone Number</label>
              <input 
                type="text" 
                className="w-full p-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded"
                placeholder="Enter patient ID or phone number"
              />
            </div>
            
            <button className="px-4 py-2 bg-blue-500 text-white rounded">
              Verify Patient
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacyPanel;