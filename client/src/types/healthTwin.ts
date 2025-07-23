/**
 * Health Twin Data Types
 * Comprehensive TypeScript interfaces for the BioVerse Health Twin system
 */

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  contact: string;
  address: string;
  medicalHistory: string[];
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  bloodType: string;
  lastCheckupDate: string;
  riskFactors: string[];
  isPregnant: boolean;
}

export interface PregnancyData {
  id: string;
  patientId: string;
  estimatedDueDate: string;
  healthStatus: string;
  transportBooked: boolean;
  alerts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SymptomCheck {
  id: string;
  patientId: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  timestamp: number;
  notes?: string;
  aiRecommendation?: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  value: number;
  unit: string;
  normalRange: string;
  timestamp: number;
  status: 'normal' | 'abnormal' | 'critical';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  appointmentDate: number;
  type: string;
  notes: string;
  healthWorkerId: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: string;
}

export interface RiskAssessment {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
}

export interface RiskProfile {
  demographic: {
    score: number;
    factors: string[];
  };
  behavioral: {
    score: number;
    factors: string[];
  };
  clinical: {
    score: number;
    factors: string[];
  };
  environmental: {
    score: number;
    factors: string[];
  };
  overall: 'low' | 'medium' | 'high' | 'critical';
}

export interface HealthInsights {
  healthStatus: {
    status: string;
    factors: string[];
    summary: string;
  };
  trends: {
    symptoms?: {
      increasing: string[];
      decreasing: string[];
      stable: string[];
    };
    appointments?: {
      frequency: 'increasing' | 'decreasing' | 'stable';
      compliance: number;
    };
    overall: string;
  };
  alerts: Array<{
    type: string;
    message: string;
    priority: 'low' | 'medium' | 'high';
  }>;
  recommendations: string[];
  riskIndicators: Array<{
    type: string;
    factor: string;
    risk: 'low' | 'medium' | 'high';
  }>;
}

export interface HealthPredictions {
  healthTrajectory: {
    direction: 'improving' | 'stable' | 'declining';
    confidence: number;
    factors: string[];
  };
  riskProgression: {
    timeframe: string;
    progression: 'stable' | 'increasing' | 'decreasing';
    confidence: number;
    factors: string[];
  };
  interventionNeeds: Array<{
    type: string;
    urgency: 'routine' | 'urgent';
    description: string;
  }>;
  resourceRequirements: {
    appointments: {
      frequency: string;
      type: string;
    };
    monitoring: {
      required: boolean;
      frequency: string;
    };
    medications: {
      refillReminder: boolean;
      adherenceMonitoring: boolean;
    };
  };
}

export interface HealthTimeline {
  date: Date;
  type: 'symptom' | 'appointment' | 'lab_result' | 'medication' | 'emergency';
  description: string;
  severity?: 'low' | 'medium' | 'high';
  status?: string;
  data?: {
    value?: string | number;
    notes?: string;
    metadata?: Record<string, unknown>;
  };
}

export interface HealthTwin {
  patientId: string;
  lastUpdated: string;
  basicInfo: Patient;
  pregnancyData?: PregnancyData;
  healthHistory: {
    symptoms: {
      recent: SymptomCheck[];
      all: SymptomCheck[];
      trends: {
        frequency: Record<string, number>;
        severity: Record<string, number>;
        timeline: Array<{ date: string; count: number }>;
      };
      summary: {
        totalReports: number;
        uniqueSymptoms: number;
        topSymptoms: Array<{ symptom: string; count: number }>;
        lastReported: string | null;
      };
    };
    appointments: {
      recent: Appointment[];
      all: Appointment[];
      frequency: {
        frequency: number;
        pattern: string;
      };
      adherence: {
        adherence: string;
        status: string;
      };
    };
    labResults: {
      recent: LabResult[];
      all: LabResult[];
      trends: {
        values: Record<string, Array<{ date: string; value: number }>>;
        abnormalCount: number;
        latestResults: Record<string, { value: number; status: string }>;
      };
    };
  };
  riskProfile: RiskProfile;
  insights: HealthInsights;
  predictions: HealthPredictions;
  timeline: HealthTimeline[];
  riskAssessment?: RiskAssessment; // Legacy support
}

export interface ComprehensiveHealthTwin extends HealthTwin {
  // Extended with additional analytics
  populationComparison?: {
    riskPercentile: number;
    healthScorePercentile: number;
  };
  aiInsights?: {
    predictiveAnalysis: {
      confidenceScore: number;
      predictionAccuracy: number;
      modelVersion: string;
    };
    potentialConditions: Array<{
      condition: string;
      probability: number;
      symptoms: string[];
      timeframe: string;
    }>;
    earlyWarnings: Array<{
      type: string;
      severity: 'low' | 'medium' | 'high';
      description: string;
      timeframe: string;
    }>;
  };
}

export interface PredictiveInsights {
  patientId: string;
  timestamp: string;
  insights: {
    status: 'success' | 'insufficient_data' | 'error';
    insights?: {
      healthTrajectory: string;
      overallConcernLevel: 'low' | 'medium' | 'high';
      symptomInsights?: {
        recurringSymptoms: Array<{
          name: string;
          frequency: number;
          trend: string;
        }>;
        patterns: Array<{
          type: string;
          description: string;
          confidence: number;
        }>;
      };
      vitalInsights?: {
        trends: {
          bloodPressure?: Array<{ date: string; systolic: number; diastolic: number }>;
          heartRate?: Array<{ date: string; value: number }>;
          temperature?: Array<{ date: string; value: number }>;
        };
        status: string;
      };
      riskFactors: string[];
    };
    earlyWarnings?: Array<{
      type: string;
      message: string;
      urgency: 'low' | 'medium' | 'high';
      symptoms?: string[];
      vitals?: string[];
    }>;
    recommendations?: string[];
    nextSteps?: Array<{
      action: string;
      frequency?: string;
      urgency?: string;
      type?: string;
      description: string;
    }>;
  };
}

export interface HealthTwinVisualizationData {
  patientId: string;
  patientInfo: {
    name: string;
    age: number;
    gender: string;
    chronicConditions: string[];
    riskFactors: string[];
  };
  symptomData: {
    timeline: Record<string, string[]>;
    raw: Array<{
      id: string;
      timestamp: number;
      date: string;
      symptoms: string[];
      count: number;
    }>;
  };
  vitalSigns: Record<string, Array<{
    timestamp: number;
    date: string;
    value: number;
    unit: string;
    normalRange: string;
  }>>;
  appointments: Array<{
    id: string;
    scheduledTime: number;
    status: string;
    type: string;
    notes: string;
  }>;
  timestamp: string;
}

export interface PopulationHealthInsights {
  population: {
    totalPatients: number;
    activePregnancies: number;
    demographics: {
      ageGroups: Array<{ age_group: string; count: number }>;
      genderDistribution: Array<{ gender: string; count: number }>;
    };
  };
  health: {
    commonSymptoms: Array<{ symptom: string; count: number }>;
    riskDistribution: {
      low: number;
      medium: number;
      high: number;
      critical: number;
    };
    trends: {
      symptomTrends: Record<string, Array<{ date: string; count: number }>>;
      appointmentTrends: Array<{ date: string; count: number; type: string }>;
      riskTrends: Array<{ date: string; riskLevel: string; score: number }>;
    };
  };
  alerts: {
    outbreakRisk: { level: string; confidence: number };
    resourceStrain: { level: string; areas: Array<{ area: string; strain: number }> };
    emergencyPatterns: { patterns: Array<{ type: string; frequency: number; trend: string }>; frequency: string };
  };
}

export interface HealthMetric {
  type: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  lastUpdated: string;
  trend?: 'increasing' | 'decreasing' | 'stable';
  normalRange?: {
    min: number;
    max: number;
  };
}

export interface HealthTwinUpdate {
  vitals?: {
    bloodPressure?: { systolic: number; diastolic: number };
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
    oxygenSaturation?: number;
    bloodGlucose?: number;
  };
  symptoms?: string[];
  medications?: string[];
  lifestyle?: {
    exercise: 'low' | 'moderate' | 'high';
    diet: 'poor' | 'average' | 'healthy';
    sleep: number; // hours
    stress: 'low' | 'medium' | 'high';
    smoking: boolean;
    alcohol: boolean;
  };
  notes?: string;
}

export interface HealthTwinUpdateResponse {
  success: boolean;
  healthTwin: {
    healthScore: number;
    riskFactors: string[];
    recommendations: Array<{
      category: 'lifestyle' | 'medical' | 'monitoring';
      priority: 'low' | 'medium' | 'high';
      message: string;
    }>;
  };
}
