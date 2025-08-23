import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';

interface EmergencyAlert {
  id: string;
  location: {
    lat: number;
    lng: number;
  };
  status: 'pending' | 'accepted' | 'completed';
  timestamp: string;
  description: string;
}

const DispatchMap: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);

  useEffect(() => {
    // Listen for new emergency alerts
    socket?.on('emergency:new', (alert: EmergencyAlert) => {
      setAlerts(prev => [...prev, alert]);
    });

    // Listen for alert status updates
    socket?.on('emergency:update', (updatedAlert: EmergencyAlert) => {
      setAlerts(prev => prev.map(alert => 
        alert.id === updatedAlert.id ? updatedAlert : alert
      ));
    });

    return () => {
      socket?.off('emergency:new');
      socket?.off('emergency:update');
    };
  }, [socket]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Emergency Dispatch Map</h1>
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <p className="text-gray-500 mb-4">
          This is a placeholder for the emergency dispatch map interface.
          In a complete implementation, this would include:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>Interactive map showing emergency locations</li>
          <li>Real-time ambulance tracking</li>
          <li>Emergency alert status updates</li>
          <li>Dispatch coordination tools</li>
        </ul>
      </div>
      
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-3">Active Alerts</h2>
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert.id} className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">Emergency Alert #{alert.id}</p>
                  <p className="text-sm text-gray-500">{alert.description}</p>
                  <p className="text-sm text-gray-500">
                    Location: {alert.location.lat}, {alert.location.lng}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded text-sm ${
                  alert.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  alert.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
          {alerts.length === 0 && (
            <p className="text-gray-500 italic">No active emergency alerts</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DispatchMap;
