/**
 * useHealthTwin Hook
 * React hook for managing health twin data with real-time updates and caching
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../SocketContext';
import healthTwinService from '../services/healthTwinService';
import {
  HealthTwin,
  ComprehensiveHealthTwin,
  PredictiveInsights,
  HealthTwinVisualizationData,
  HealthTwinUpdate,
} from '../types/healthTwin';

// Socket event types
interface HealthTwinUpdateEvent {
  patientId: string;
  type: 'vitals' | 'symptoms' | 'medications' | 'lifestyle';
  data: Partial<HealthTwinUpdate>;
  timestamp: string;
}

interface RiskAlertEvent {
  patientId: string;
  alertType: 'risk_score_change' | 'critical_symptoms' | 'vital_alert';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
}

interface UseHealthTwinOptions {
  comprehensive?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  enableRealTimeUpdates?: boolean;
}

interface UseHealthTwinReturn {
  // Data
  healthTwin: HealthTwin | ComprehensiveHealthTwin | null;
  predictiveInsights: PredictiveInsights | null;
  visualizationData: HealthTwinVisualizationData | null;
  
  // State
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isDataFresh: boolean;
  
  // Actions
  refetch: () => Promise<void>;
  updateHealthTwin: (data: HealthTwinUpdate) => Promise<void>;
  clearError: () => void;
  
  // Insights
  healthSummary: {
    score: number;
    status: string;
    keyInsights: string[];
    nextActions: string[];
  } | null;
}

export const useHealthTwin = (
  patientId: string | null,
  options: UseHealthTwinOptions = {}
): UseHealthTwinReturn => {
  const {
    comprehensive = false,
    autoRefresh = false,
    refreshInterval = 300000, // 5 minutes default
    enableRealTimeUpdates = true,
  } = options;

  // State
  const [healthTwin, setHealthTwin] = useState<HealthTwin | ComprehensiveHealthTwin | null>(null);
  const [predictiveInsights, setPredictiveInsights] = useState<PredictiveInsights | null>(null);
  const [visualizationData, setVisualizationData] = useState<HealthTwinVisualizationData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Refs
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  // Socket connection
  const { socket } = useSocket();

  // Computed values
  const isDataFresh = healthTwin ? healthTwinService.isHealthTwinDataFresh(healthTwin.lastUpdated) : false;
  const healthSummary = healthTwin ? healthTwinService.generateHealthSummary(healthTwin) : null;

  // Fetch health twin data
  const fetchHealthTwin = useCallback(async () => {
    if (!patientId) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch core health twin data
      const healthTwinData = comprehensive
        ? await healthTwinService.getComprehensiveHealthTwin(patientId)
        : await healthTwinService.getHealthTwin(patientId);

      if (!mountedRef.current) return;

      setHealthTwin(healthTwinData);
      setLastUpdated(new Date());

      // Fetch additional data in parallel
      const [insights, vizData] = await Promise.allSettled([
        healthTwinService.getPredictiveInsights(patientId),
        healthTwinService.getHealthTwinVisualizationData(patientId),
      ]);

      if (!mountedRef.current) return;

      if (insights.status === 'fulfilled') {
        setPredictiveInsights(insights.value);
      }

      if (vizData.status === 'fulfilled') {
        setVisualizationData(vizData.value);
      }

    } catch (err) {
      if (!mountedRef.current) return;
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch health twin data';
      setError(errorMessage);
      console.error('Health Twin fetch error:', err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [patientId, comprehensive]);

  // Refetch wrapper
  const refetch = useCallback(async () => {
    await fetchHealthTwin();
  }, [fetchHealthTwin]);

  // Update health twin
  const updateHealthTwin = useCallback(async (updateData: HealthTwinUpdate) => {
    if (!patientId) {
      throw new Error('No patient ID provided for update');
    }

    try {
      const response = await healthTwinService.updateHealthTwin(updateData);
      
      if (response.success) {
        // Refresh data after successful update
        await fetchHealthTwin();
        return response;
      } else {
        throw new Error('Update failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update health twin';
      setError(errorMessage);
      throw err;
    }
  }, [patientId, fetchHealthTwin]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Setup real-time updates
  useEffect(() => {
    if (!enableRealTimeUpdates || !socket || !patientId) return;

    const handleHealthTwinUpdate = (data: HealthTwinUpdateEvent) => {
      if (data.patientId === patientId) {
        console.log('Real-time health twin update received:', data);
        // Refresh data when real-time update is received
        fetchHealthTwin();
      }
    };

    const handleRiskAlert = (data: RiskAlertEvent) => {
      if (data.patientId === patientId) {
        console.log('Risk alert received:', data);
        // Could trigger a notification or update state
        fetchHealthTwin();
      }
    };

    // Socket event listeners
    socket.on('healthTwin:updated', handleHealthTwinUpdate);
    socket.on('healthTwin:riskAlert', handleRiskAlert);
    socket.on('patient:dataChanged', handleHealthTwinUpdate);

    return () => {
      socket.off('healthTwin:updated', handleHealthTwinUpdate);
      socket.off('healthTwin:riskAlert', handleRiskAlert);
      socket.off('patient:dataChanged', handleHealthTwinUpdate);
    };
  }, [socket, patientId, enableRealTimeUpdates, fetchHealthTwin]);

  // Setup auto-refresh
  useEffect(() => {
    if (!autoRefresh || !patientId) return;

    refreshIntervalRef.current = setInterval(() => {
      if (!loading) {
        fetchHealthTwin();
      }
    }, refreshInterval);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [autoRefresh, patientId, refreshInterval, loading, fetchHealthTwin]);

  // Initial data fetch
  useEffect(() => {
    if (patientId) {
      fetchHealthTwin();
    }

    return () => {
      mountedRef.current = false;
    };
  }, [fetchHealthTwin, patientId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
      mountedRef.current = false;
    };
  }, []);

  return {
    // Data
    healthTwin,
    predictiveInsights,
    visualizationData,
    
    // State
    loading,
    error,
    lastUpdated,
    isDataFresh,
    
    // Actions
    refetch,
    updateHealthTwin,
    clearError,
    
    // Insights
    healthSummary,
  };
};

export default useHealthTwin;
