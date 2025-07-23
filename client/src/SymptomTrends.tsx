import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';

interface SymptomTrend {
  symptom: string;
  count: number;
  percentage?: string;
  trend?: string;
}

interface SymptomTrendsData {
  trends: SymptomTrend[];
  metadata?: {
    totalChecks: number;
    timeframe: string;
    uniqueSymptoms: number;
    generatedAt: string;
  };
}

const SymptomTrends: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<SymptomTrendsData>({ trends: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrends = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/symptoms/trends`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const responseData = await response.json();
          const errorMsg = responseData?.message || `HTTP error! status: ${response.status}`;
          throw new Error(errorMsg);
        }
        const data = await response.json();
        setData(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchTrends();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-text dark:text-dark-text"
      >
        <Loader2 className="animate-spin mb-4" size={40} />
        <p className="text-lg">{t('loading_symptom_trends')}</p>
      </motion.div>
    );
  }

  if (error) {
    return <div className="text-center text-destructive dark:text-dark-destructive flex flex-col items-center">
             <AlertTriangle size={24} className="mb-2" />
             {t('error_loading_symptom_trends', { error })}
             <button onClick={() => window.location.reload()} className="mt-4 bg-primary-600 text-white px-4 py-2 rounded">
               <RefreshCw className="inline mr-2" />
               {t('retry_loading')}
             </button>
           </div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text dark:text-dark-text mb-2">
            Symptom Trends
          </h1>
          {data.metadata && (
            <div className="text-sm text-muted dark:text-dark-muted">
              <span>Total checks: {data.metadata.totalChecks}</span>
              <span className="mx-2">•</span>
              <span>Timeframe: {data.metadata.timeframe}</span>
              <span className="mx-2">•</span>
              <span>Unique symptoms: {data.metadata.uniqueSymptoms}</span>
            </div>
          )}
        </div>
        
        <div className="bg-card dark:bg-dark-card rounded-lg shadow-lg border border-border dark:border-dark-border">
          {data.trends.length === 0 ? (
            <div className="p-8 sm:p-12 flex flex-col items-center text-center text-muted dark:text-dark-muted">
              <AlertTriangle size={48} className="mb-4 text-amber-500" />
              <h3 className="text-lg font-semibold mb-2">{t('no_symptom_data')}</h3>
              <p className="text-sm mb-6">There are no symptom reports available for the selected time period.</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg transition-colors duration-200 flex items-center"
              >
                <RefreshCw size={18} className="mr-2" />
                {t('retry_loading')}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border dark:divide-dark-border">
              {data.trends.map((trend, index) => (
                <motion.div
                  key={trend.symptom}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row sm:justify-between sm:items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <div className="flex items-center mb-2 sm:mb-0">
                    <span className="text-lg font-bold text-primary dark:text-primary-300 mr-4 min-w-[2rem]">
                      #{index + 1}
                    </span>
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      <span className="text-base sm:text-lg font-medium text-text dark:text-dark-text capitalize">
                        {trend.symptom}
                      </span>
                      {trend.trend && (
                        <div className="flex items-center mt-1 sm:mt-0 sm:ml-3">
                          <span className={`flex items-center text-xs sm:text-sm px-2 py-1 rounded-full ${
                            trend.trend === 'increasing' 
                              ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' 
                              : trend.trend === 'decreasing' 
                                ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30' 
                                : 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-800'
                          }`}>
                            {trend.trend === 'increasing' && <TrendingUp size={14} className="mr-1" />}
                            {trend.trend === 'decreasing' && <TrendingDown size={14} className="mr-1" />}
                            {trend.trend === 'stable' && <Minus size={14} className="mr-1" />}
                            {trend.trend}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end">
                    {trend.percentage && (
                      <span className="text-sm text-muted dark:text-dark-muted mr-4">
                        {trend.percentage}%
                      </span>
                    )}
                    <span className="text-lg sm:text-xl font-bold text-text dark:text-dark-text">
                      {trend.count} reports
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SymptomTrends;