import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Pill, Shield, Calendar, Info, RefreshCw, AlertCircle } from 'lucide-react';

interface ContraceptionOption {
  id: number;
  name: string;
  type: string;
  effectiveness: string;
  duration: string;
  benefits: string[];
  sideEffects: string[];
  contraindications: string[];
}

const ContraceptionExplorer: React.FC = () => {
  const [options, setOptions] = useState<ContraceptionOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<ContraceptionOption | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchOptions = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
        setError(null);
      }

      const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
      const response = await axios.get(`${baseURL}/api/srh/contraception/options`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('API Response:', response.data); // Debug log
        
      // Check if response has the expected structure
      if (response.data && response.data.options && Array.isArray(response.data.options)) {
        setOptions(response.data.options);
        setError(null);
        setRetryCount(0);
      } else if (response.data && Array.isArray(response.data)) {
        // Handle case where API returns array directly
        setOptions(response.data);
        setError(null);
        setRetryCount(0);
      } else {
        console.error('Invalid response structure:', response.data);
        throw new Error('Invalid data structure received from server.');
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error('API Error:', err);
        
        let errorMessage = 'An unexpected error occurred.';
        
        if (err.response) {
          // Server responded with error status
          const status = err.response.status;
          const message = err.response.data?.message || err.response.statusText;
          
          if (status === 404) {
            errorMessage = 'Contraception options service not found. Please try again later.';
          } else if (status >= 500) {
            errorMessage = `Server error (${status}). Please try again later.`;
          } else if (status === 401 || status === 403) {
            errorMessage = 'Access denied. Please check your permissions.';
          } else {
            errorMessage = `Server error: ${status} - ${message}`;
          }
        } else if (err.request) {
          // Request made but no response received
          errorMessage = 'Unable to connect to server. Please check your internet connection.';
        } else if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout. Please try again.';
        } else {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
        
        // Auto-retry on network errors (up to 2 times)
        if (retryCount < 2 && (err.code === 'ECONNABORTED' || !err.response)) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            fetchOptions(true);
          }, 2000 * (retryCount + 1)); // Exponential backoff
        }
      } else {
        console.error('Unknown error:', err);
        setError('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(0);
    fetchOptions();
  };

  useEffect(() => {
    fetchOptions();
  }, [fetchOptions]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 bg-card dark:bg-dark-card rounded-xl shadow-lg border border-border dark:border-dark-border">
        <div className="flex items-center justify-center py-8">
          <div className="text-muted dark:text-dark-muted text-sm sm:text-base">Loading contraception options...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-8 bg-card dark:bg-dark-card rounded-xl shadow-lg border border-border dark:border-dark-border">
        <div className="flex flex-col items-center text-center py-8">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">
            Unable to Load Contraception Options
          </h3>
          <p className="text-red-500 text-sm sm:text-base break-words mb-6 max-w-md">
            {error}
          </p>
          <button
            onClick={handleRetry}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-card dark:bg-dark-card rounded-xl shadow-lg border border-border dark:border-dark-border">
      <h3 className="text-2xl sm:text-3xl font-bold text-text dark:text-dark-text mb-4 sm:mb-6 flex items-center">
        <Pill className="mr-2 sm:mr-4 text-primary-400" size={28} />
        <span className="break-words">Contraception Explorer</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {options.map(option => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setSelectedOption(option)}
          >
            <h4 className="text-lg sm:text-xl font-bold mb-2 text-text dark:text-dark-text break-words">{option.name}</h4>
            <p className="text-sm text-muted dark:text-dark-muted break-words">{option.type} - {option.effectiveness} effective</p>
          </motion.div>
        ))}
      </div>

      {selectedOption && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedOption(null)}
        >
          <div 
            className="bg-card dark:bg-dark-card p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" 
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl sm:text-2xl font-bold mb-4 break-words">{selectedOption.name}</h3>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold flex items-center text-sm sm:text-base">
                  <Shield size={16} className="mr-2 flex-shrink-0"/>Type & Effectiveness
                </h4>
                <p className="text-sm sm:text-base break-words">{selectedOption.type} - {selectedOption.effectiveness} effective</p>
              </div>
              <div>
                <h4 className="font-bold flex items-center text-sm sm:text-base">
                  <Calendar size={16} className="mr-2 flex-shrink-0"/>Duration
                </h4>
                <p className="text-sm sm:text-base break-words">{selectedOption.duration}</p>
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">Benefits</h4>
                <ul className="list-disc pl-5 text-sm sm:text-base">
                  {selectedOption.benefits.map((benefit, i) => <li key={i} className="break-words">{benefit}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">Side Effects</h4>
                <ul className="list-disc pl-5 text-sm sm:text-base">
                  {selectedOption.sideEffects.map((effect, i) => <li key={i} className="break-words">{effect}</li>)}
                </ul>
              </div>
              <div>
                <h4 className="font-bold flex items-center text-sm sm:text-base">
                  <Info size={16} className="mr-2 flex-shrink-0"/>Contraindications
                </h4>
                <ul className="list-disc pl-5 text-sm sm:text-base">
                  {selectedOption.contraindications.map((contra, i) => <li key={i} className="break-words">{contra}</li>)}
                </ul>
              </div>
            </div>
            <button 
              onClick={() => setSelectedOption(null)} 
              className="mt-6 w-full sm:w-auto bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ContraceptionExplorer;
