import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, AlertTriangle, Activity, Truck, FileText, Users, Ambulance, Phone, MapPin } from 'lucide-react';
// import { useAuth } from '../hooks/useAuth'; // TODO: Add auth when needed

interface PregnancyRecord {
  id: string;
  patientId: string;
  patientName: string;
  estimatedDueDate: string;
  lastCheckupDate: string;
  gestationWeeks: number;
  healthStatus: string;
  riskLevel: 'low' | 'medium' | 'high';
  nextAppointment: string;
  transportBooked: boolean;
  phoneNumber: string;
  location: string;
  phoneNumber: string;
  location: string;
}

const MaternalHealthDashboard: React.FC = () => {
  const { t } = useTranslation();
  // const auth = useAuth(); // TODO: Use auth for authorization checks
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [pregnancyRecords, setPregnancyRecords] = useState<PregnancyRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [safeBirthMode, setSafeBirthMode] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<PregnancyRecord | null>(null);
  const [transportType, setTransportType] = useState<'ambulance' | 'yango' | null>(null);
  const [transportStatus, setTransportStatus] = useState<'idle' | 'requesting' | 'confirmed' | 'en-route'>('idle');

  useEffect(() => {
    const fetchPregnancyData = async () => {
      try {
        setLoading(true);
        // In a real app, this would be an API call
        // For now, using mock data
        const mockData: PregnancyRecord[] = [
          {
            id: '1',
            patientId: 'P001',
            patientName: 'Sarah Johnson',
            estimatedDueDate: '2025-10-15',
            lastCheckupDate: '2025-07-10',
            gestationWeeks: 28,
            healthStatus: 'Stable',
            riskLevel: 'low',
            nextAppointment: '2025-07-24',
            transportBooked: true,
            phoneNumber: '+260971234567',
            location: 'Lusaka, Matero Clinic'
          },
          {
            id: '2',
            patientId: 'P002',
            patientName: 'Maria Garcia',
            estimatedDueDate: '2025-08-22',
            lastCheckupDate: '2025-07-05',
            gestationWeeks: 34,
            healthStatus: 'Gestational diabetes',
            riskLevel: 'medium',
            nextAppointment: '2025-07-19',
            transportBooked: false,
            phoneNumber: '+260962345678',
            location: 'Ndola, Main Hospital'
          },
          {
            id: '3',
            patientId: 'P003',
            patientName: 'Aisha Patel',
            estimatedDueDate: '2025-09-10',
            lastCheckupDate: '2025-07-12',
            gestationWeeks: 30,
            healthStatus: 'Hypertension',
            riskLevel: 'high',
            nextAppointment: '2025-07-18',
            transportBooked: true,
            phoneNumber: '+260953456789',
            location: 'Kitwe, Riverside Clinic'
          },
          {
            id: '4',
            patientId: 'P004',
            patientName: 'Emily Chen',
            estimatedDueDate: '2025-11-05',
            lastCheckupDate: '2025-07-08',
            gestationWeeks: 22,
            healthStatus: 'Stable',
            riskLevel: 'low',
            nextAppointment: '2025-07-29',
            transportBooked: false,
            phoneNumber: '+260974567890',
            location: 'Livingstone, Victoria Hospital'
          },
          {
            id: '5',
            patientId: 'P005',
            patientName: 'Fatima Nkosi',
            estimatedDueDate: '2025-08-01',
            lastCheckupDate: '2025-07-14',
            gestationWeeks: 36,
            healthStatus: 'Anemia',
            riskLevel: 'medium',
            nextAppointment: '2025-07-21',
            transportBooked: true,
            phoneNumber: '+260965678901',
            location: 'Chipata, Eastern Clinic'
          }
        ];
        
        setPregnancyRecords(mockData);
        setLoading(false);
      } catch {
        setError('Failed to fetch pregnancy records');
        setLoading(false);
      }
    };

    fetchPregnancyData();
  }, []);

  const getStatusColor = (riskLevel: string): string => {
    switch (riskLevel) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverviewTab = () => {
    const highRiskCount = pregnancyRecords.filter(record => record.riskLevel === 'high').length;
    const upcomingAppointments = pregnancyRecords.filter(
      record => new Date(record.nextAppointment) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    ).length;
    const transportNeeded = pregnancyRecords.filter(record => !record.transportBooked).length;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-2" />
            <h3 className="text-lg font-semibold">{t('High Risk Patients')}</h3>
          </div>
          <p className="text-3xl font-bold">{highRiskCount}</p>
          <p className="text-gray-600 mt-2">{t('Patients requiring immediate attention')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Calendar className="h-6 w-6 text-blue-500 mr-2" />
            <h3 className="text-lg font-semibold">{t('Upcoming Appointments')}</h3>
          </div>
          <p className="text-3xl font-bold">{upcomingAppointments}</p>
          <p className="text-gray-600 mt-2">{t('Appointments in the next 7 days')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center mb-4">
            <Truck className="h-6 w-6 text-purple-500 mr-2" />
            <h3 className="text-lg font-semibold">{t('Transport Needed')}</h3>
          </div>
          <p className="text-3xl font-bold">{transportNeeded}</p>
          <p className="text-gray-600 mt-2">{t('Patients requiring transportation')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md md:col-span-2 lg:col-span-3">
          <div className="flex items-center mb-4">
            <Activity className="h-6 w-6 text-green-500 mr-2" />
            <h3 className="text-lg font-semibold">{t('Patient Distribution by Risk Level')}</h3>
          </div>
          <div className="flex items-center h-12 mt-4">
            <div 
              className="bg-red-500 h-full rounded-l" 
              style={{ width: `${(highRiskCount / pregnancyRecords.length) * 100}%` }}
            ></div>
            <div 
              className="bg-yellow-500 h-full" 
              style={{ width: `${(pregnancyRecords.filter(r => r.riskLevel === 'medium').length / pregnancyRecords.length) * 100}%` }}
            ></div>
            <div 
              className="bg-green-500 h-full rounded-r" 
              style={{ width: `${(pregnancyRecords.filter(r => r.riskLevel === 'low').length / pregnancyRecords.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span>{t('High Risk')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span>{t('Medium Risk')}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>{t('Low Risk')}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPatientsTab = () => {
    return (
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('Patient')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('Due Date')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('Gestation')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('Health Status')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('Risk Level')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('Next Appointment')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pregnancyRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.patientName}</div>
                    <div className="text-sm text-gray-500">ID: {record.patientId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.estimatedDueDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.gestationWeeks} {t('weeks')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.healthStatus}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.riskLevel)}`}>
                      {t(record.riskLevel.charAt(0).toUpperCase() + record.riskLevel.slice(1))}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.nextAppointment).toLocaleDateString()}
                    {!record.transportBooked && (
                      <span className="ml-2 text-xs text-red-500">
                        ({t('Transport needed')})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderAppointmentsTab = () => {
    // Sort appointments by date
    const sortedAppointments = [...pregnancyRecords].sort(
      (a, b) => new Date(a.nextAppointment).getTime() - new Date(b.nextAppointment).getTime()
    );

    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{t('Upcoming Appointments')}</h3>
        <div className="space-y-4">
          {sortedAppointments.map((record) => (
            <div key={record.id} className="border-l-4 border-blue-500 pl-4 py-2">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">{record.patientName}</p>
                  <p className="text-sm text-gray-600">
                    <Clock className="h-4 w-4 inline mr-1" />
                    {new Date(record.nextAppointment).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(record.riskLevel)}`}>
                    {t(record.riskLevel.charAt(0).toUpperCase() + record.riskLevel.slice(1))} {t('Risk')}
                  </span>
                  {!record.transportBooked && (
                    <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 text-xs rounded-full">
                      {t('Transport needed')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderReportsTab = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{t('Reports & Analytics')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">{t('Risk Level Distribution')}</h4>
            <div className="h-40 flex items-end space-x-4">
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-red-500 rounded-t" style={{ height: `${(pregnancyRecords.filter(r => r.riskLevel === 'high').length / pregnancyRecords.length) * 100}%` }}></div>
                <span className="text-sm mt-2">{t('High')}</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-yellow-500 rounded-t" style={{ height: `${(pregnancyRecords.filter(r => r.riskLevel === 'medium').length / pregnancyRecords.length) * 100}%` }}></div>
                <span className="text-sm mt-2">{t('Medium')}</span>
              </div>
              <div className="flex-1 flex flex-col items-center">
                <div className="w-full bg-green-500 rounded-t" style={{ height: `${(pregnancyRecords.filter(r => r.riskLevel === 'low').length / pregnancyRecords.length) * 100}%` }}></div>
                <span className="text-sm mt-2">{t('Low')}</span>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-medium mb-2">{t('Gestation Weeks Distribution')}</h4>
            <div className="h-40 flex items-end space-x-2">
              {[...Array(4)].map((_, i) => {
                const weekStart = i * 10;
                const weekEnd = weekStart + 9;
                const count = pregnancyRecords.filter(r => 
                  r.gestationWeeks >= weekStart && r.gestationWeeks <= weekEnd
                ).length;
                const percentage = (count / pregnancyRecords.length) * 100;
                
                return (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t" 
                      style={{ height: `${percentage}%` }}
                    ></div>
                    <span className="text-sm mt-2">{weekStart}-{weekEnd}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleBookTransport = (type: 'ambulance' | 'yango') => {
    if (selectedPatient) {
      setTransportType(type);
      setTransportStatus('requesting');
      // Simulate API call
      setTimeout(() => {
        setTransportStatus('confirmed');
        setTimeout(() => {
          setTransportStatus('en-route');
        }, 2000);
      }, 3000);
    }
  };

  const renderSafeBirthMode = () => {
    const highRiskPatients = pregnancyRecords.filter(record => record.riskLevel === 'high');

    if (highRiskPatients.length === 0) {
      return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-lg font-semibold">{t('No high-risk patients currently.')}</p>
          <p className="text-gray-600">{t('All patients are low to medium risk.')}</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {highRiskPatients.map(patient => (
          <div key={patient.id} className="bg-white p-6 rounded-lg shadow-md border border-red-300">
            <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center">
              <AlertTriangle className="h-6 w-6 mr-2" />
              {t('High Risk Patient')}: {patient.patientName}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
              <p><strong>{t('Estimated Due Date')}:</strong> {new Date(patient.estimatedDueDate).toLocaleDateString()}</p>
              <p><strong>{t('Health Status')}:</strong> {patient.healthStatus}</p>
              <p><strong>{t('Gestation')}:</strong> {patient.gestationWeeks} {t('weeks')}</p>
              <p><strong>{t('Next Appointment')}:</strong> {new Date(patient.nextAppointment).toLocaleDateString()}</p>
              <p><strong>{t('Phone Number')}:</strong> {patient.phoneNumber}</p>
              <p><strong>{t('Location')}:</strong> {patient.location}</p>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-4">
              <a href={`tel:${patient.phoneNumber}`}
                 className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                {t('Call Patient')}
              </a>
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(patient.location)}`}
                 target="_blank" rel="noopener noreferrer"
                 className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                {t('View on Map')}
              </a>
              <button
                onClick={() => setSelectedPatient(patient)}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
              >
                <Truck className="h-5 w-5 mr-2" />
                {t('Arrange Transport')}
              </button>
            </div>

            {selectedPatient?.id === patient.id && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="font-semibold mb-2">{t('Transport Options')}</h4>
                <div className="flex gap-4">
                  <button
                    onClick={() => handleBookTransport('ambulance')}
                    disabled={transportStatus !== 'idle'}
                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center ${transportType === 'ambulance' ? 'bg-red-600' : 'bg-red-500'} text-white font-bold ${transportStatus !== 'idle' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-600'}`}
                  >
                    <Ambulance className="h-5 w-5 mr-2" />
                    {t('Book Ambulance')}
                  </button>
                  <button
                    onClick={() => handleBookTransport('yango')}
                    disabled={transportStatus !== 'idle'}
                    className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center ${transportType === 'yango' ? 'bg-yellow-600' : 'bg-yellow-500'} text-white font-bold ${transportStatus !== 'idle' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-600'}`}
                  >
                    <Truck className="h-5 w-5 mr-2" />
                    {t('Book Yango')}
                  </button>
                </div>
                {transportStatus !== 'idle' && (
                  <p className="mt-2 text-center text-sm text-gray-600">
                    {t('Status')}: {t(transportStatus)}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">{t('Error!')} </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      );
    }

    if (safeBirthMode) {
      return renderSafeBirthMode();
    }

    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'patients':
        return renderPatientsTab();
      case 'appointments':
        return renderAppointmentsTab();
      case 'reports':
        return renderReportsTab();
      default:
        return renderOverviewTab();
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{t('Maternal Health Dashboard')}</h1>
        <button
          onClick={() => setSafeBirthMode(!safeBirthMode)}
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg flex items-center"
        >
          <Ambulance className="h-5 w-5 mr-2" />
          {t('Safe Birth Mode')} {safeBirthMode ? t('(On)') : t('(Off)')}
        </button>
      </div>

      {!safeBirthMode && (
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Activity className="h-5 w-5 inline mr-1" />
                {t('Overview')}
              </button>
              <button
                onClick={() => setActiveTab('patients')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'patients'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-5 w-5 inline mr-1" />
                {t('Patients')}
              </button>
              <button
                onClick={() => setActiveTab('appointments')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'appointments'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Calendar className="h-5 w-5 inline mr-1" />
                {t('Appointments')}
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-5 w-5 inline mr-1" />
                {t('Reports')}
              </button>
            </nav>
          </div>
        </div>
      )}

      {renderContent()}
    </div>
  );
};

export default MaternalHealthDashboard;