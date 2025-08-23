/**
 * Enhanced AI Service for BioVerse Client
 * Integrates with Ollama-powered backend AI services
 */

interface AIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  confidence?: number;
  timestamp?: string;
}

interface SymptomAnalysis {
  diagnosis: Array<{
    condition: string;
    description: string;
    likelihood: number;
  }>;
  recommendations: Array<{
    text: string;
    priority: 'low' | 'medium' | 'high';
    category: string;
  }>;
  suggestedTests: string[];
  warnings: string[];
  confidence: number;
  disclaimer: string;
}

interface HealthPrediction {
  predictions: Array<{
    condition: string;
    probability: number;
    timeframe: string;
    factors: string[];
  }>;
  trends: Array<{
    metric: string;
    direction: 'improving' | 'stable' | 'declining';
    confidence: number;
  }>;
  risks: Array<{
    type: string;
    level: 'low' | 'medium' | 'high' | 'critical';
    description: string;
  }>;
  interventions: Array<{
    type: string;
    urgency: 'routine' | 'urgent';
    description: string;
  }>;
}

interface HealthRecommendation {
  recommendations: Array<{
    category: 'lifestyle' | 'medical' | 'monitoring';
    priority: 'low' | 'medium' | 'high';
    text: string;
    expectedImpact?: number;
    timeframe?: string;
  }>;
  lifestyle: Array<{
    area: string;
    suggestion: string;
    difficulty: 'easy' | 'moderate' | 'challenging';
  }>;
  medical: Array<{
    type: string;
    description: string;
    urgency: string;
  }>;
  monitoring: Array<{
    metric: string;
    frequency: string;
    target: string;
  }>;
}

interface ChatResponse {
  response: string;
  conversationId: string;
  timestamp: string;
  model: string;
  confidence: number;
}

interface DocumentAnalysis {
  analysis: string;
  keyFindings: string[];
  recommendations: string[];
  extractedData: Record<string, any>;
  confidence: number;
  documentType: string;
}

interface HealthEducation {
  topic: string;
  content: string;
  keyPoints: string[];
  actionItems: string[];
  resources: Array<{
    title: string;
    url: string;
    type: 'article' | 'video' | 'tool';
  }>;
  complexity: 'basic' | 'intermediate' | 'advanced';
}

interface AIStatus {
  status: 'healthy' | 'unhealthy' | 'unknown';
  capabilities: {
    medicalDiagnosis: boolean;
    healthPredictions: boolean;
    chatbot: boolean;
    documentAnalysis: boolean;
    healthEducation: boolean;
    dataAnalysis: boolean;
  };
  models: {
    available: number;
    medical: boolean;
    chat: boolean;
    code: boolean;
  };
  stats: {
    activeConversations: number;
    cacheSize: number;
    defaultModel: string;
    medicalModel: string;
  };
}

class AIService {
  private baseUrl: string;
  private token: string | null = null;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    this.token = localStorage.getItem('token');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<AIResponse<T>> {
    try {
      const url = `${this.baseUrl}/api/ai${endpoint}`;
      
      const defaultHeaders = {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      };

      const config: RequestInit = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`AI Service Error (${endpoint}):`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Enhanced Luma chatbot interaction
   */
  async chat(
    message: string,
    patientId?: string,
    conversationId?: string
  ): Promise<AIResponse<ChatResponse>> {
    return this.makeRequest<ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        patientId,
        conversationId,
      }),
    });
  }

  /**
   * Advanced symptom analysis with AI diagnosis
   */
  async analyzeSymptoms(
    symptoms: Array<{
      symptom: string;
      severity?: 'mild' | 'moderate' | 'severe';
      duration?: string;
      description?: string;
    }>,
    patientId: string,
    additionalInfo?: Record<string, any>
  ): Promise<AIResponse<SymptomAnalysis>> {
    return this.makeRequest<SymptomAnalysis>('/symptoms/analyze', {
      method: 'POST',
      body: JSON.stringify({
        symptoms,
        patientId,
        additionalInfo,
      }),
    });
  }

  /**
   * Generate health predictions using AI
   */
  async generateHealthPredictions(
    patientId: string,
    timeframe: '1m' | '3m' | '6m' | '1y' | '5y' = '6m'
  ): Promise<AIResponse<HealthPrediction>> {
    return this.makeRequest<HealthPrediction>(`/predictions/${patientId}/${timeframe}`);
  }

  /**
   * Get personalized health recommendations
   */
  async getHealthRecommendations(
    patientId: string,
    goals: string[] = [],
    preferences: Record<string, any> = {}
  ): Promise<AIResponse<HealthRecommendation>> {
    return this.makeRequest<HealthRecommendation>(`/recommendations/${patientId}`, {
      method: 'POST',
      body: JSON.stringify({
        goals,
        preferences,
      }),
    });
  }

  /**
   * Analyze health documents with AI
   */
  async analyzeDocument(
    documentText: string,
    documentType: 'lab_report' | 'prescription' | 'medical_note' | 'discharge_summary' | 'general' = 'general',
    patientId?: string
  ): Promise<AIResponse<DocumentAnalysis>> {
    return this.makeRequest<DocumentAnalysis>('/documents/analyze', {
      method: 'POST',
      body: JSON.stringify({
        documentText,
        documentType,
        patientId,
      }),
    });
  }

  /**
   * Generate health education content
   */
  async generateHealthEducation(
    topic: string,
    patientId?: string,
    complexity: 'basic' | 'intermediate' | 'advanced' = 'intermediate'
  ): Promise<AIResponse<HealthEducation>> {
    return this.makeRequest<HealthEducation>('/education', {
      method: 'POST',
      body: JSON.stringify({
        topic,
        patientId,
        complexity,
      }),
    });
  }

  /**
   * Analyze health data patterns
   */
  async analyzeHealthDataPatterns(
    patientId: string,
    analysisType: 'trends' | 'patterns' | 'anomalies' | 'correlations' = 'trends',
    timeRange: '1w' | '1m' | '3m' | '6m' | '1y' = '3m'
  ): Promise<AIResponse<any>> {
    return this.makeRequest('/data/analyze', {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        analysisType,
        timeRange,
      }),
    });
  }

  /**
   * Get comprehensive health insights
   */
  async getHealthInsights(patientId: string): Promise<AIResponse<any>> {
    return this.makeRequest(`/insights/${patientId}`);
  }

  /**
   * Batch symptom analysis for multiple patients
   */
  async batchAnalyzeSymptoms(
    analyses: Array<{
      patientId: string;
      symptoms: Array<{
        symptom: string;
        severity?: string;
        duration?: string;
      }>;
    }>
  ): Promise<AIResponse<any>> {
    return this.makeRequest('/symptoms/batch-analyze', {
      method: 'POST',
      body: JSON.stringify({
        analyses,
      }),
    });
  }

  /**
   * Get AI service status and capabilities
   */
  async getAIStatus(): Promise<AIResponse<AIStatus>> {
    return this.makeRequest<AIStatus>('/status');
  }

  /**
   * Get available AI models (admin only)
   */
  async getAvailableModels(): Promise<AIResponse<any>> {
    return this.makeRequest('/models');
  }

  /**
   * Pull new AI model (admin only)
   */
  async pullModel(modelName: string): Promise<AIResponse<any>> {
    return this.makeRequest('/models/pull', {
      method: 'POST',
      body: JSON.stringify({
        modelName,
      }),
    });
  }

  /**
   * Clear conversation history
   */
  async clearConversationHistory(patientId: string): Promise<AIResponse<any>> {
    return this.makeRequest(`/conversations/${patientId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get AI analytics (admin only)
   */
  async getAIAnalytics(): Promise<AIResponse<any>> {
    return this.makeRequest('/analytics');
  }

  /**
   * Update authentication token
   */
  updateToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  /**
   * Utility method to format AI responses for display
   */
  formatResponse(response: any): string {
    if (typeof response === 'string') {
      return response;
    }
    
    if (response && typeof response === 'object') {
      // Handle different response types
      if (response.response) {
        return response.response;
      }
      
      if (response.content) {
        return response.content;
      }
      
      if (response.analysis) {
        return response.analysis;
      }
      
      // Fallback to JSON string
      return JSON.stringify(response, null, 2);
    }
    
    return 'No response available';
  }

  /**
   * Check if AI service is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const status = await this.getAIStatus();
      return status.success && status.data?.status === 'healthy';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get confidence level styling
   */
  getConfidenceStyle(confidence: number): {
    color: string;
    label: string;
    bgColor: string;
  } {
    if (confidence >= 0.9) {
      return { color: 'text-green-600', label: 'Very High', bgColor: 'bg-green-100' };
    } else if (confidence >= 0.8) {
      return { color: 'text-blue-600', label: 'High', bgColor: 'bg-blue-100' };
    } else if (confidence >= 0.7) {
      return { color: 'text-yellow-600', label: 'Medium', bgColor: 'bg-yellow-100' };
    } else if (confidence >= 0.6) {
      return { color: 'text-orange-600', label: 'Low', bgColor: 'bg-orange-100' };
    } else {
      return { color: 'text-red-600', label: 'Very Low', bgColor: 'bg-red-100' };
    }
  }

  /**
   * Format medical recommendations for display
   */
  formatRecommendations(recommendations: any[]): Array<{
    text: string;
    priority: string;
    category: string;
    icon: string;
  }> {
    return recommendations.map(rec => ({
      text: rec.text || rec.description || rec.message || 'No description available',
      priority: rec.priority || 'medium',
      category: rec.category || rec.type || 'general',
      icon: this.getRecommendationIcon(rec.category || rec.type || 'general'),
    }));
  }

  /**
   * Get icon for recommendation category
   */
  private getRecommendationIcon(category: string): string {
    const iconMap: Record<string, string> = {
      lifestyle: '🏃‍♂️',
      medical: '🏥',
      monitoring: '📊',
      nutrition: '🥗',
      exercise: '💪',
      medication: '💊',
      general: '💡',
      urgent: '🚨',
      routine: '📅',
    };
    
    return iconMap[category.toLowerCase()] || '💡';
  }
}

// Create and export singleton instance
export const aiService = new AIService();
export default aiService;