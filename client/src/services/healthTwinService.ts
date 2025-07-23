/**
 * Health Twin Service
 * Handles all API interactions for Health Twin functionality
 */

import {
  HealthTwin,
  ComprehensiveHealthTwin,
  PredictiveInsights,
  HealthTwinVisualizationData,
  PopulationHealthInsights,
  HealthTwinUpdate,
  HealthTwinUpdateResponse,
  HealthTimeline,
} from '../types/healthTwin';

interface HealthTwinInsights {
  patientId: string;
  insights: {
    riskFactors: string[];
    recommendations: string[];
    alerts: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      message: string;
    }>;
  };
  timestamp: string;
}

interface RiskAnalysis {
  patientId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: Array<{
    category: string;
    risk: string;
    impact: number;
  }>;
  recommendations: string[];
}

interface PotentialIssues {
  patientId: string;
  predictions: Array<{
    condition: string;
    probability: number;
    timeframe: string;
    symptoms: string[];
    recommendations: string[];
  }>;
  timestamp: string;
}

interface TrendAnalysis {
  patientId: string;
  trends: Array<{
    metric: string;
    direction: 'increasing' | 'decreasing' | 'stable';
    confidence: number;
    timeframe: string;
    values: Array<{ date: string; value: number }>;
  }>;
  summary: string;
}

interface EarlyWarnings {
  patientId: string;
  warnings: Array<{
    type: string;
    severity: 'low' | 'medium' | 'high';
    message: string;
    triggers: string[];
    recommendations: string[];
  }>;
  timestamp: string;
}

interface ResourceAllocation {
  recommendations: Array<{
    resource: string;
    priority: 'low' | 'medium' | 'high';
    allocation: number;
    justification: string;
  }>;
  totalBudget: number;
  estimatedImpact: string;
}

class HealthTwinService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('token');
    const url = `${this.baseUrl}${endpoint}`;

    const defaultHeaders = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      return await response.json();
    } catch (error) {
      console.error(`Health Twin API Error (${endpoint}):`, error);
      throw error;
    }
  }

  /**
   * Get basic health twin for a patient
   */
  async getHealthTwin(patientId: string): Promise<HealthTwin> {
    return this.makeRequest<HealthTwin>(`/api/health-twin/${patientId}`);
  }

  /**
   * Get comprehensive health twin with advanced analytics
   */
  async getComprehensiveHealthTwin(patientId: string): Promise<ComprehensiveHealthTwin> {
    return this.makeRequest<ComprehensiveHealthTwin>(`/api/health-twin/${patientId}/comprehensive`);
  }

  /**
   * Get health twin insights (AI-powered analysis)
   */
  async getHealthTwinInsights(patientId: string): Promise<HealthTwinInsights> {
    return this.makeRequest(`/api/health-twin/insights/patient/${patientId}`);
  }

  /**
   * Get health twin visualization data
   */
  async getHealthTwinVisualizationData(patientId: string): Promise<HealthTwinVisualizationData> {
    return this.makeRequest<HealthTwinVisualizationData>(`/api/health-twin/data/patient/${patientId}`);
  }

  /**
   * Get health timeline for a patient
   */
  async getHealthTimeline(patientId: string, limit: number = 50): Promise<HealthTimeline[]> {
    return this.makeRequest(`/api/health-twin/${patientId}/timeline?limit=${limit}`);
  }

  /**
   * Get risk analysis for a patient
   */
  async getRiskAnalysis(patientId: string): Promise<RiskAnalysis> {
    return this.makeRequest(`/api/health-twin/${patientId}/risk-analysis`);
  }

  /**
   * Update health twin data
   */
  async updateHealthTwin(data: HealthTwinUpdate): Promise<HealthTwinUpdateResponse> {
    return this.makeRequest<HealthTwinUpdateResponse>('/api/health-twin/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get predictive insights for a patient
   */
  async getPredictiveInsights(patientId: string): Promise<PredictiveInsights> {
    return this.makeRequest<PredictiveInsights>(`/api/predictive/insights/patient/${patientId}`);
  }

  /**
   * Get potential health issues predictions
   */
  async getPotentialIssues(patientId: string): Promise<PotentialIssues> {
    return this.makeRequest(`/api/predictive/potential-issues/patient/${patientId}`);
  }

  /**
   * Get symptom trend analysis
   */
  async getSymptomTrends(patientId: string): Promise<TrendAnalysis> {
    return this.makeRequest(`/api/predictive/symptom-trends/patient/${patientId}`);
  }

  /**
   * Get vital sign trend analysis
   */
  async getVitalTrends(patientId: string): Promise<TrendAnalysis> {
    return this.makeRequest(`/api/predictive/vital-trends/patient/${patientId}`);
  }

  /**
   * Get early warnings for a patient
   */
  async getEarlyWarnings(patientId: string): Promise<EarlyWarnings> {
    return this.makeRequest(`/api/predictive/early-warnings/patient/${patientId}`);
  }

  // Population Health Methods (for Ministry/Admin dashboards)

  /**
   * Get population health insights
   */
  async getPopulationHealthInsights(): Promise<PopulationHealthInsights> {
    return this.makeRequest<PopulationHealthInsights>('/api/health-twin/population/insights');
  }

  /**
   * Get resource allocation recommendations
   */
  async getResourceAllocationRecommendations(): Promise<ResourceAllocation> {
    return this.makeRequest('/api/health-twin/population/resource-allocation');
  }

  // Utility Methods

  /**
   * Check if health twin data is up to date (within last 24 hours)
   */
  isHealthTwinDataFresh(lastUpdated: string): boolean {
    const lastUpdate = new Date(lastUpdated);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    return hoursDiff < 24;
  }

  /**
   * Format risk level for display
   */
  formatRiskLevel(level: string): { color: string; label: string; bgColor: string } {
    switch (level.toLowerCase()) {
      case 'low':
        return { color: 'text-green-600', label: 'Low Risk', bgColor: 'bg-green-100' };
      case 'medium':
        return { color: 'text-yellow-600', label: 'Medium Risk', bgColor: 'bg-yellow-100' };
      case 'high':
        return { color: 'text-orange-600', label: 'High Risk', bgColor: 'bg-orange-100' };
      case 'critical':
        return { color: 'text-red-600', label: 'Critical Risk', bgColor: 'bg-red-100' };
      default:
        return { color: 'text-gray-600', label: 'Unknown', bgColor: 'bg-gray-100' };
    }
  }

  /**
   * Get health status color and styling
   */
  getHealthStatusStyling(status: string): { color: string; bgColor: string; icon: string } {
    switch (status.toLowerCase()) {
      case 'stable':
      case 'good':
        return { color: 'text-green-600', bgColor: 'bg-green-100', icon: '✓' };
      case 'needs_attention':
      case 'managing_conditions':
        return { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: '⚠' };
      case 'critical':
      case 'emergency':
        return { color: 'text-red-600', bgColor: 'bg-red-100', icon: '🚨' };
      default:
        return { color: 'text-gray-600', bgColor: 'bg-gray-100', icon: '?' };
    }
  }

  /**
   * Calculate health score based on various factors
   */
  calculateHealthScore(healthTwin: HealthTwin): number {
    let score = 85; // Base score

    // Adjust based on risk level
    switch (healthTwin.riskProfile.overall) {
      case 'low':
        score += 10;
        break;
      case 'medium':
        score -= 5;
        break;
      case 'high':
        score -= 15;
        break;
      case 'critical':
        score -= 30;
        break;
    }

    // Adjust based on chronic conditions
    const chronicCount = healthTwin.basicInfo.chronicConditions.length;
    score -= chronicCount * 5;

    // Adjust based on recent symptoms
    const recentSymptomCount = healthTwin.healthHistory.symptoms.recent.length;
    score -= recentSymptomCount * 2;

    // Adjust based on appointment adherence
    const adherenceScore = parseFloat(healthTwin.healthHistory.appointments.adherence.adherence);
    if (adherenceScore > 80) score += 5;
    else if (adherenceScore < 50) score -= 10;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get trending direction for a metric
   */
  getTrendIcon(trend: string): string {
    switch (trend.toLowerCase()) {
      case 'improving':
      case 'increasing':
        return '↗️';
      case 'stable':
        return '➡️';
      case 'declining':
      case 'decreasing':
        return '↘️';
      case 'worsening':
        return '⬇️';
      default:
        return '◦';
    }
  }

  /**
   * Generate health twin summary for quick overview
   */
  generateHealthSummary(healthTwin: HealthTwin): {
    score: number;
    status: string;
    keyInsights: string[];
    nextActions: string[];
  } {
    const score = this.calculateHealthScore(healthTwin);
    const status = healthTwin.insights.healthStatus.status;
    
    const keyInsights: string[] = [];
    
    // Add risk insights
    if (healthTwin.riskProfile.overall !== 'low') {
      keyInsights.push(`Risk Level: ${healthTwin.riskProfile.overall.toUpperCase()}`);
    }
    
    // Add chronic conditions insight
    if (healthTwin.basicInfo.chronicConditions.length > 0) {
      keyInsights.push(`Managing ${healthTwin.basicInfo.chronicConditions.length} chronic conditions`);
    }
    
    // Add recent symptoms insight
    if (healthTwin.healthHistory.symptoms.recent.length > 0) {
      keyInsights.push(`${healthTwin.healthHistory.symptoms.recent.length} recent symptom reports`);
    }
    
    // Add pregnancy status
    if (healthTwin.basicInfo.isPregnant) {
      keyInsights.push('Currently pregnant - monitoring required');
    }

    const nextActions = healthTwin.insights.recommendations.slice(0, 3);

    return {
      score,
      status,
      keyInsights,
      nextActions,
    };
  }
}

export const healthTwinService = new HealthTwinService();
export default healthTwinService;
