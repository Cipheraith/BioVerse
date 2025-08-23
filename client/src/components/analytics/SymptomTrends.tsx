import React, { useEffect, useState } from 'react';
import ApiService from '../../services/api';

interface SymptomData {
  symptom: string;
  count: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  timeframe: string;
}

interface RegionData {
  region: string;
  topSymptoms: SymptomData[];
}

const SymptomTrends: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regionData, setRegionData] = useState<RegionData[]>([]);

  useEffect(() => {
    const fetchSymptomTrends = async () => {
      try {
        // Example response shape that would come from the API
        const response = await ApiService.getAnalytics('symptoms');
        setRegionData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch symptom trends data');
        setLoading(false);
      }
    };

    fetchSymptomTrends();
  }, []);

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
      <h1 className="text-2xl font-bold mb-6">Symptom Trends Analysis</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {regionData.map((region) => (
          <div 
            key={region.region} 
            className="bg-white p-6 rounded-lg shadow-sm border"
          >
            <h2 className="text-xl font-semibold mb-4">{region.region}</h2>
            
            <div className="space-y-4">
              {region.topSymptoms.map((symptom) => (
                <div 
                  key={symptom.symptom}
                  className="border-b pb-4 last:border-b-0 last:pb-0"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{symptom.symptom}</span>
                    <span className="text-sm">
                      {symptom.count} cases
                    </span>
                  </div>
                  
                  <div className="flex items-center mt-2">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${
                        symptom.trend === 'increasing' 
                          ? 'bg-red-100 text-red-800'
                          : symptom.trend === 'decreasing'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    `}>
                      {symptom.trend === 'increasing' && '↑'}
                      {symptom.trend === 'decreasing' && '↓'}
                      {symptom.trend === 'stable' && '→'}
                      {' '}
                      {symptom.trend}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      over {symptom.timeframe}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {regionData.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No symptom trend data available
        </div>
      )}
    </div>
  );
};

export default SymptomTrends;
