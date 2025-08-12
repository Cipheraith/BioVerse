/**
 * AI Service Integration for Frontend
 * Handles communication with Python AI backend through Node.js API
 */

import { api } from './api';

export interface HealthTwinData {
  patient_id: string;
  medical_history?: any;
  current_vitals?: any;
  lifestyle_data?: any;
}

export interface HealthTwinUpdate {
  vitals?: any;
  symptoms?: string[];
  medications?: any[];
  lifestyle_changes?: any;
}

export interface SymptomAnalysis {
  symptoms: string[];
  patient_history?: any;
  severity?: 'mild' | 'moderate' | 'severe';
}

export interface HealthRiskPrediction {
  patient_data: any;
  risk_factors?: string[];
  timeframe?: '1m' | '3m' | '6m' | '1y';
}

export interface HealthInsights {
  patient_id: string;
  data_points: any[];
  insight_type?: 'trends' | 'anomalies' | 'recommendations' | 'all';
}

export interface AIChat {
  message: string;
  context?: any;
  model?: string;
}

export interface AIAnalysis {
  analysis_type: 'medical' | 'diagnostic' | 'risk_assessment' | 'treatment_plan';
  data: any;
  instructions?: string;
}

export interface VisualizationRequest {
  type: 'chart' | 'graph' | '3d_model' | 'heatmap' | 'timeline';
  data: any;
  options?: any;
}

export interface InteractiveChart {
  chart_type: 'line' | 'bar' | 'scatter' | 'pie' | 'area' | 'radar';
  data: any;
  config?: any;
}

class AIService {
  private baseURL = '/api/ai';

  // Health check for AI service
  async checkHealth() {
    try {
      const response = await api.get(`${this.baseURL}/health`);
      return response.data;
    } catch (error) {
      console.error('AI service health check failed:', error);
      throw error;
    }
  }

  // ==================== HEALTH TWIN METHODS ====================

  async createHealthTwin(data: HealthTwinData) {
    try {
      const response = await api.post(`${this.baseURL}/health-twins/create`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to create health twin:', error);
      throw error;
    }
  }

  async getHealthTwin(twinId: string) {
    try {
      const response = await api.get(`${this.baseURL}/health-twins/${twinId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get health twin:', error);
      throw error;
    }
  }

  async updateHealthTwin(twinId: string, data: HealthTwinUpdate) {
    try {
      const response = await api.put(`${this.baseURL}/health-twins/${twinId}`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update health twin:', error);
      throw error;
    }
  }

  async getHealthTwinPredictions(twinId: string, timeframe: '7d' | '30d' | '90d' | '1y' = '30d') {
    try {
      const response = await api.get(`${this.baseURL}/health-twins/${twinId}/predictions`, {
        params: { timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get health twin predictions:', error);
      throw error;
    }
  }

  async getHealthTwinVisualization(twinId: string, type: '3d' | '2d' | 'chart' | 'timeline' = '3d') {
    try {
      const response = await api.get(`${this.baseURL}/health-twins/${twinId}/visualization`, {
        params: { type }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to get health twin visualization:', error);
      throw error;
    }
  }

  // ==================== MACHINE LEARNING METHODS ====================

  async analyzeSymptoms(data: SymptomAnalysis) {
    try {
      const response = await api.post(`${this.baseURL}/ml/analyze-symptoms`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to analyze symptoms:', error);
      throw error;
    }
  }

  async predictHealthRisks(data: HealthRiskPrediction) {
    try {
      const response = await api.post(`${this.baseURL}/ml/predict-risks`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to predict health risks:', error);
      throw error;
    }
  }

  async generateHealthInsights(data: HealthInsights) {
    try {
      const response = await api.post(`${this.baseURL}/ml/health-insights`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to generate health insights:', error);
      throw error;
    }
  }

  async runDiagnosticModel(modelName: string, inputData: any, confidenceThreshold?: number) {
    try {
      const payload = {
        input_data: inputData,
        ...(confidenceThreshold && { confidence_threshold: confidenceThreshold })
      };
      const response = await api.post(`${this.baseURL}/ml/models/${modelName}/predict`, payload);
      return response.data;
    } catch (error) {
      console.error('Failed to run diagnostic model:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS METHODS ====================

  async getPopulationHealthAnalytics(region?: string, timeframe: '1m' | '3m' | '6m' | '1y' | '2y' = '1y') {
    try {
      const params: any = { timeframe };
      if (region) params.region = region;
      
      const response = await api.get(`${this.baseURL}/analytics/population-health`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get population health analytics:', error);
      throw error;
    }
  }

  async getDiseaseSurveillanceData(disease?: string, region?: string, timeframe: '1m' | '3m' | '6m' | '1y' = '6m') {
    try {
      const params: any = { timeframe };
      if (disease) params.disease = disease;
      if (region) params.region = region;
      
      const response = await api.get(`${this.baseURL}/analytics/disease-surveillance`, { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get disease surveillance data:', error);
      throw error;
    }
  }

  async generateHealthReport(reportType: 'population' | 'disease' | 'facility' | 'custom', parameters: any, format?: 'json' | 'pdf' | 'excel' | 'csv') {
    try {
      const payload = {
        report_type: reportType,
        parameters,
        ...(format && { format })
      };
      const response = await api.post(`${this.baseURL}/analytics/reports`, payload);
      return response.data;
    } catch (error) {
      console.error('Failed to generate health report:', error);
      throw error;
    }
  }

  // ==================== AI CHAT METHODS ====================

  async chatWithAI(data: AIChat) {
    try {
      const response = await api.post(`${this.baseURL}/chat`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to chat with AI:', error);
      throw error;
    }
  }

  async analyzeWithAI(data: AIAnalysis) {
    try {
      const response = await api.post(`${this.baseURL}/analyze`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to analyze with AI:', error);
      throw error;
    }
  }

  // ==================== VISUALIZATION METHODS ====================

  async generateVisualization(data: VisualizationRequest) {
    try {
      const response = await api.post(`${this.baseURL}/visualizations/generate`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to generate visualization:', error);
      throw error;
    }
  }

  async getInteractiveChart(data: InteractiveChart) {
    try {
      const response = await api.post(`${this.baseURL}/visualizations/interactive-chart`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to get interactive chart:', error);
      throw error;
    }
  }

  // ==================== UTILITY METHODS ====================

  async isAIServiceAvailable(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.success && health.data.connected;
    } catch (error) {
      return false;
    }
  }

  async getAIServiceStatus() {
    try {
      const response = await this.checkHealth();
      return response.data;
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // ==================== CONVENIENCE METHODS ====================

  // Quick symptom checker
  async quickSymptomCheck(symptoms: string[], patientHistory?: any) {
    return this.analyzeSymptoms({
      symptoms,
      patient_history: patientHistory,
      severity: 'moderate'
    });
  }

  // Quick health risk assessment
  async quickRiskAssessment(patientData: any) {
    return this.predictHealthRisks({
      patient_data: patientData,
      timeframe: '6m'
    });
  }

  // Quick AI consultation
  async quickAIConsultation(medicalQuestion: string, patientContext?: any) {
    return this.chatWithAI({
      message: medicalQuestion,
      context: {
        type: 'medical_consultation',
        patient_context: patientContext
      },
      model: 'deepseek-r1:1.5b'
    });
  }

  // Generate patient health summary
  async generatePatientSummary(patientId: string, dataPoints: any[]) {
    return this.generateHealthInsights({
      patient_id: patientId,
      data_points: dataPoints,
      insight_type: 'all'
    });
  }

  // Create comprehensive health visualization
  async createHealthDashboard(patientData: any) {
    return this.generateVisualization({
      type: 'timeline',
      data: patientData,
      options: {
        theme: 'bioverse',
        interactive: true,
        export_formats: ['png', 'svg', 'html']
      }
    });
  }
}

// Create singleton instance
export const aiService = new AIService();

// Export types for use in components
export type {
  HealthTwinData,
  HealthTwinUpdate,
  SymptomAnalysis,
  HealthRiskPrediction,
  HealthInsights,
  AIChat,
  AIAnalysis,
  VisualizationRequest,
  InteractiveChart
};