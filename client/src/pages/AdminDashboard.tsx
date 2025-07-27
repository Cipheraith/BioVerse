import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users, Calendar, Activity, AlertTriangle, TrendingUp, RefreshCw, Heart, Brain, Shield, Eye
} from 'lucide-react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change }) => (
  <motion.div
    className="bg-card dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg border border-border dark:border-dark-border cursor-pointer"
    whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0,0,0,0.2)" }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
  >
    <div className="flex items-center justify-between mb-2 sm:mb-4">
      <h3 className="text-md sm:text-lg font-semibold text-muted dark:text-dark-muted">{title}</h3>
      <div className="text-primary dark:text-primary-300">{icon}</div>
    </div>
    <p className="text-2xl sm:text-3xl font-bold text-text dark:text-dark-text">{value}</p>
    <p className="text-xs sm:text-sm text-muted dark:text-dark-muted">{change}</p>
  </motion.div>
);

interface RecentActivity {
  type: 'patient' | 'symptomCheck' | 'appointment' | 'emergency';
  name?: string;
  patientId?: string;
  timestamp: string;
  severity?: string;
  location?: string;
  formattedTime?: string;
}

interface HealthTwinSummary {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  healthScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
  activeAlerts: number;
  chronicConditions: string[];
  recentActivity: string;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    patientsToday: 0,
    totalAppointments: 0,
    appointmentsToday: 0,
    totalSymptomChecks: 0,
    symptomChecksToday: 0,
    highRiskAlerts: 0,
    riskPercentChange: '0.0',
    predictedPatientLoad: 0,
    predictedChangePercent: 0,
    riskDistribution: { high: 0, medium: 0, low: 0 }
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [healthTwins, setHealthTwins] = useState<HealthTwinSummary[]>([]);
  const [healthTwinsLoading, setHealthTwinsLoading] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const navigate = useNavigate();

  const fetchHealthTwins = async () => {
    try {
      setHealthTwinsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${process.env.VITE_API_BASE_URL}/api/health-twins/summary`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setHealthTwins(data);
    } catch (e) {
      console.error('Error fetching health twins:', e);
      // Generate mock data for demonstration
      const mockData: HealthTwinSummary[] = [
        {
          patientId: '1',
          patientName: 'Sarah Johnson',
          age: 34,
          gender: 'Female',
          healthScore: 85,
          riskLevel: 'low',
          lastUpdated: '2 hours ago',
          activeAlerts: 0,
          chronicConditions: ['Hypertension'],
          recentActivity: 'Vital signs updated'
        },
        {
          patientId: '2',
          patientName: 'Michael Chen',
          age: 45,
          gender: 'Male',
          healthScore: 62,
          riskLevel: 'medium',
          lastUpdated: '4 hours ago',
          activeAlerts: 1,
          chronicConditions: ['Diabetes', 'High Cholesterol'],
          recentActivity: 'Symptom check reported'
        },
        {
          patientId: '3',
          patientName: 'Maria Rodriguez',
          age: 67,
          gender: 'Female',
          healthScore: 45,
          riskLevel: 'high',
          lastUpdated: '1 hour ago',
          activeAlerts: 3,
          chronicConditions: ['Heart Disease', 'Diabetes'],
          recentActivity: 'Emergency alert triggered'
        }
      ];
      setHealthTwins(mockData);
    } finally {
      setHealthTwinsLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      
      // Fetch stats
      const statsResponse = await fetch(`${process.env.VITE_API_BASE_URL}/api/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!statsResponse.ok) {
        throw new Error(`HTTP error! status: ${statsResponse.status}`);
      }
      const statsData = await statsResponse.json();
      setStats(statsData);
      
      // Fetch recent activity
      const activityResponse = await fetch(`${process.env.VITE_API_BASE_URL}/api/dashboard/recent-activity`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!activityResponse.ok) {
        throw new Error(`HTTP error! status: ${activityResponse.status}`);
      }
      const activityData = await activityResponse.json();
      setRecentActivity(activityData);
      
      // Fetch health twins
      await fetchHealthTwins();
      
      // Update last updated timestamp
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      console.error('Error fetching dashboard data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  if (loading) {
    return <div className="text-center text-text dark:text-dark-text">Loading...</div>;
  }

  if (error) {
    return <div className="text-center text-destructive dark:text-dark-destructive">Error: {error}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex flex-col items-center bg-background dark:bg-dark-background p-4 sm:p-8"
    >
      <div className="w-full max-w-6xl bg-card dark:bg-dark-card p-4 sm:p-8 rounded-lg shadow-lg border border-border dark:border-dark-border">
        <div className="flex justify-between items-center mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-text dark:text-dark-text">Dashboard Overview</h1>
          <div className="flex items-center">
            {lastUpdated && (
              <span className="text-xs text-muted dark:text-dark-muted mr-3">
                Last updated: {lastUpdated.toLocaleString()}
              </span>
            )}
            <button 
              onClick={fetchData}
              disabled={refreshing}
              className="flex items-center bg-primary hover:bg-primary-700 text-primary-text font-medium py-1 px-3 rounded-lg transition-all duration-300 text-sm"
            >
              <RefreshCw size={16} className={`mr-1 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-4 sm:mb-8">
          <StatCard icon={<Users size={24} />} title="Total Patients" value={stats.totalPatients.toString()} change={`+${stats.patientsToday} today`} />
          <StatCard icon={<Calendar size={24} />} title="Appointments" value={stats.totalAppointments.toString()} change={`+${stats.appointmentsToday} today`} />
          <StatCard icon={<Activity size={24} />} title="Symptom Reports" value={stats.totalSymptomChecks.toString()} change={`+${stats.symptomChecksToday} today`} />
          <StatCard icon={<AlertTriangle size={24} />} title="High-Risk Alerts" value={stats.highRiskAlerts.toString()} change={`${stats.riskPercentChange > '0' ? '+' : ''}${stats.riskPercentChange}% from yesterday`} />
          <StatCard icon={<TrendingUp size={24} />} title="Predicted Patient Load" value={stats.predictedPatientLoad?.toString() || "0"} change={`+${stats.predictedChangePercent || 0}% next week`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 sm:mb-8">
          <div className="lg:col-span-2 bg-card dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg border border-border dark:border-dark-border">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-text dark:text-dark-text">Recent Activity</h2>
            <ul className="space-y-2 sm:space-y-3">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <li key={index} className="flex items-center text-muted dark:text-dark-muted text-sm sm:text-base">
                    {activity.type === 'patient' && <Users size={18} className="mr-2 text-blue-400" />}
                    {activity.type === 'symptomCheck' && <Activity size={18} className="mr-2 text-green-400" />}
                    {activity.type === 'appointment' && <Calendar size={18} className="mr-2 text-purple-400" />}
                    <span>
                      {activity.type === 'patient' && `New patient registered: ${activity.name}`}
                      {activity.type === 'symptomCheck' && `Symptom check for: ${activity.name || 'Unknown'}`}
                      {activity.type === 'appointment' && `Appointment for: ${activity.name || 'Unknown'}`}
                      <span className="text-xs sm:text-sm text-gray-500 ml-2">
                        ({activity.formattedTime || new Date(activity.timestamp).toLocaleString()})
                      </span>
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-muted dark:text-dark-muted text-sm sm:text-base">No recent activity.</p>
              )}
            </ul>
          </div>
          <div className="bg-card dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg border border-border dark:border-dark-border">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-text dark:text-dark-text">Quick Actions</h2>
            <div className="flex flex-col space-y-2 sm:space-y-3">
              <button
                onClick={() => navigate('/patients')}
                className="w-full bg-primary hover:bg-primary-700 text-primary-text font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 text-sm sm:text-base"
              >
                Manage Patients
              </button>
              <button
                onClick={() => navigate('/add-patient')}
                className="w-full bg-primary hover:bg-primary-700 text-primary-text font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 text-sm sm:text-base"
              >
                Add New Patient
              </button>
              <button
                onClick={() => navigate('/appointments')}
                className="w-full bg-primary hover:bg-primary-700 text-primary-text font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 text-sm sm:text-base"
              >
                Manage Appointments
              </button>
              <button
                onClick={() => navigate('/symptom-trends')}
                className="w-full bg-primary hover:bg-primary-700 text-primary-text font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 text-sm sm:text-base"
              >
                View Symptom Trends
              </button>
              <button
                onClick={fetchHealthTwins}
                className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-bold py-2 sm:py-3 px-3 sm:px-4 rounded-lg transition-all duration-300 text-sm sm:text-base flex items-center justify-center"
              >
                <Heart className="h-4 w-4 mr-2" />
                View Health Twins
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-8 bg-card dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg border border-border dark:border-dark-border">
          <h2 className="text-xl sm:text-2xl font-semibold mb-4 text-text dark:text-dark-text">Patient Risk Level Distribution</h2>
          <div className="flex items-center h-32 mt-4">
            <div 
              className="bg-red-500 h-full rounded-l" 
              style={{ width: `${(stats.riskDistribution.high / stats.totalPatients) * 100 || 0}%` }}
            ></div>
            <div 
              className="bg-yellow-500 h-full" 
              style={{ width: `${(stats.riskDistribution.medium / stats.totalPatients) * 100 || 0}%` }}
            ></div>
            <div 
              className="bg-green-500 h-full rounded-r" 
              style={{ width: `${(stats.riskDistribution.low / stats.totalPatients) * 100 || 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
              <span>High Risk ({stats.riskDistribution.high})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
              <span>Medium Risk ({stats.riskDistribution.medium})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
              <span>Low Risk ({stats.riskDistribution.low})</span>
            </div>
          </div>
        </div>

        {/* Health Twins Management Section */}
        <div className="mt-4 sm:mt-8 bg-card dark:bg-dark-card p-4 sm:p-6 rounded-xl shadow-lg border border-border dark:border-dark-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl sm:text-2xl font-semibold text-text dark:text-dark-text flex items-center">
              <Heart className="h-6 w-6 text-red-500 mr-2" />
              Health Twins Management
            </h2>
            <button
              onClick={fetchHealthTwins}
              disabled={healthTwinsLoading}
              className="flex items-center bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300 text-sm"
            >
              <Brain className={`h-4 w-4 mr-1 ${healthTwinsLoading ? 'animate-spin' : ''}`} />
              {healthTwinsLoading ? 'Loading...' : 'View All Health Twins'}
            </button>
          </div>
          
          {healthTwinsLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-lg font-medium text-text dark:text-dark-text">Loading Health Twins...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Patient
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Health Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Risk Level
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Alerts
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                  {healthTwins.map((twin, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                      onClick={() => navigate(`/patients/${twin.patientId}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-medium text-sm">{twin.patientName.charAt(0)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{twin.patientName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{twin.age} years old, {twin.gender}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mr-2">
                            <div 
                              className={`h-2.5 rounded-full ${
                                twin.healthScore >= 80 ? 'bg-green-500' :
                                twin.healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${twin.healthScore}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{twin.healthScore}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          twin.riskLevel === 'low' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          twin.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          twin.riskLevel === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          <Shield className="h-3 w-3 mr-1" />
                          {twin.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {twin.activeAlerts > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {twin.activeAlerts} Alert{twin.activeAlerts > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-500 dark:text-gray-400">No alerts</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {twin.lastUpdated}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/patients/${twin.patientId}`);
                          }}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Twin
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              
              {healthTwins.length === 0 && !healthTwinsLoading && (
                <div className="text-center py-12">
                  <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Health Twins Found</p>
                  <p className="text-gray-500 dark:text-gray-400">Health twins will appear here once patients are registered and their health data is processed.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
