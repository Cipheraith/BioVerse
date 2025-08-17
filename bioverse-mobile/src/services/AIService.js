import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const AI_BACKEND_URL = 'http://localhost:8000';

class AIService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
    });

    this.aiClient = axios.create({
      baseURL: AI_BACKEND_URL,
      timeout: 30000,
    });

    // Add request interceptor for auth token
    this.apiClient.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  // Health Predictions
  async generateHealthPrediction(patientData = null) {
    try {
      const data = patientData || await this.getDefaultPatientData();
      
      const response = await this.aiClient.post('/quantum/predict', {
        patient_data: data,
      });

      return {
        id: `pred_${Date.now()}`,
        type: 'health_prediction',
        confidence: response.data.confidence_score || 0.92,
        lifeExpectancy: response.data.life_expectancy || 78.5,
        qualityOfLife: response.data.quality_of_life_score || 85,
        diseaseRisks: response.data.disease_risks || {},
        recommendations: response.data.recommendations || [],
        interventions: response.data.optimal_interventions || [],
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating health prediction:', error);
      // Return mock prediction
      return this.getMockHealthPrediction();
    }
  }

  async getHealthPredictions() {
    try {
      const response = await this.apiClient.get('/ai/predictions');
      return response.data;
    } catch (error) {
      console.error('Error fetching health predictions:', error);
      return [this.getMockHealthPrediction()];
    }
  }

  async getHealthInsights() {
    try {
      const response = await this.apiClient.get('/ai/insights');
      return response.data;
    } catch (error) {
      console.error('Error fetching health insights:', error);
      return this.getMockHealthInsights();
    }
  }

  // Risk Assessment
  async getRiskFactors() {
    try {
      const response = await this.apiClient.get('/ai/risk-factors');
      return response.data;
    } catch (error) {
      console.error('Error fetching risk factors:', error);
      return this.getMockRiskFactors();
    }
  }

  async analyzeRiskFactors(healthData) {
    try {
      const response = await this.aiClient.post('/risk/analyze', {
        health_data: healthData,
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing risk factors:', error);
      return this.getMockRiskAnalysis();
    }
  }

  // Medical Image Analysis
  async analyzeMedicalImage(imageData, modality) {
    try {
      const response = await this.aiClient.post('/vision/analyze', {
        image_data: imageData,
        modality: modality,
      });

      return {
        id: `analysis_${Date.now()}`,
        modality,
        findings: response.data.primary_findings || [],
        confidence: response.data.confidence_score || 0.88,
        urgencyLevel: response.data.urgency_level || 'ROUTINE',
        recommendations: response.data.follow_up_recommendations || [],
        aiReport: response.data.ai_generated_report || '',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error analyzing medical image:', error);
      throw error;
    }
  }

  // Symptom Analysis
  async analyzeSymptoms(symptoms) {
    try {
      const response = await this.aiClient.post('/symptoms/analyze', {
        symptoms: symptoms,
      });

      return {
        possibleConditions: response.data.possible_conditions || [],
        urgencyLevel: response.data.urgency_level || 'low',
        recommendations: response.data.recommendations || [],
        confidence: response.data.confidence || 0.75,
      };
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      return this.getMockSymptomAnalysis(symptoms);
    }
  }

  // Personalized Recommendations
  async getPersonalizedRecommendations(healthProfile) {
    try {
      const response = await this.aiClient.post('/recommendations/generate', {
        health_profile: healthProfile,
      });
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return this.getMockRecommendations();
    }
  }

  // Health Coaching
  async getHealthCoachingAdvice(query) {
    try {
      const response = await this.aiClient.post('/coaching/advice', {
        query: query,
      });
      return response.data;
    } catch (error) {
      console.error('Error getting health coaching advice:', error);
      return {
        advice: 'I recommend consulting with a healthcare professional for personalized advice.',
        confidence: 0.8,
        sources: ['General health guidelines'],
      };
    }
  }

  // Drug Interaction Checker
  async checkDrugInteractions(medications) {
    try {
      const response = await this.aiClient.post('/drugs/interactions', {
        medications: medications,
      });
      return response.data;
    } catch (error) {
      console.error('Error checking drug interactions:', error);
      return { interactions: [], warnings: [] };
    }
  }

  // Mental Health Assessment
  async assessMentalHealth(responses) {
    try {
      const response = await this.aiClient.post('/mental-health/assess', {
        responses: responses,
      });
      return response.data;
    } catch (error) {
      console.error('Error assessing mental health:', error);
      return {
        score: 75,
        level: 'moderate',
        recommendations: ['Consider stress management techniques', 'Maintain regular sleep schedule'],
      };
    }
  }

  // Nutrition Analysis
  async analyzeNutrition(foodData) {
    try {
      const response = await this.aiClient.post('/nutrition/analyze', {
        food_data: foodData,
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing nutrition:', error);
      return {
        calories: 0,
        macros: { protein: 0, carbs: 0, fat: 0 },
        recommendations: [],
      };
    }
  }

  // Exercise Recommendations
  async getExerciseRecommendations(fitnessLevel, goals, restrictions = []) {
    try {
      const response = await this.aiClient.post('/exercise/recommendations', {
        fitness_level: fitnessLevel,
        goals: goals,
        restrictions: restrictions,
      });
      return response.data.recommendations || [];
    } catch (error) {
      console.error('Error getting exercise recommendations:', error);
      return this.getMockExerciseRecommendations();
    }
  }

  // Mock Data Methods
  async getDefaultPatientData() {
    return {
      demographics: { age: 35, gender: 'female' },
      vital_signs: { heart_rate: 72, blood_pressure: '120/80', bmi: 22.5 },
      lifestyle_factors: {
        exercise_frequency: 4,
        smoking: false,
        alcohol_consumption: 2,
        sleep_quality: 7,
        stress_level: 4,
      },
      medical_history: [],
    };
  }

  getMockHealthPrediction() {
    return {
      id: `pred_${Date.now()}`,
      type: 'health_prediction',
      confidence: 0.92,
      lifeExpectancy: 78.5 + Math.random() * 10,
      qualityOfLife: 80 + Math.random() * 15,
      diseaseRisks: {
        cardiovascular: Math.random() * 0.3,
        diabetes: Math.random() * 0.2,
        cancer: Math.random() * 0.15,
        alzheimer: Math.random() * 0.1,
      },
      recommendations: [
        'Maintain regular exercise routine',
        'Follow balanced nutrition plan',
        'Monitor blood pressure regularly',
        'Schedule annual health checkups',
      ],
      interventions: [
        {
          type: 'lifestyle_modification',
          priority: 'high',
          description: 'Increase physical activity to 150 minutes per week',
        },
        {
          type: 'preventive_screening',
          priority: 'medium',
          description: 'Schedule cardiovascular screening',
        },
      ],
      timestamp: new Date().toISOString(),
    };
  }

  getMockHealthInsights() {
    return [
      {
        id: 'insight_001',
        type: 'activity',
        title: 'Excellent Activity Trend',
        description: 'Your activity levels have increased by 15% this month. Keep up the great work!',
        icon: 'trending-up',
        priority: 'medium',
        actionable: true,
        action: 'View detailed activity report',
      },
      {
        id: 'insight_002',
        type: 'sleep',
        title: 'Sleep Quality Improvement',
        description: 'Your sleep quality has improved. Consider maintaining your current bedtime routine.',
        icon: 'moon',
        priority: 'low',
        actionable: false,
      },
      {
        id: 'insight_003',
        type: 'nutrition',
        title: 'Nutrition Goal Achievement',
        description: 'You\'ve met your daily nutrition goals 6 out of 7 days this week!',
        icon: 'nutrition',
        priority: 'medium',
        actionable: true,
        action: 'View nutrition breakdown',
      },
    ];
  }

  getMockRiskFactors() {
    return [
      {
        id: 'risk_001',
        type: 'cardiovascular',
        level: 'low',
        score: 0.15,
        description: 'Low cardiovascular risk based on current health metrics',
        factors: ['Regular exercise', 'Normal blood pressure', 'Healthy BMI'],
        recommendations: ['Continue current lifestyle', 'Annual heart health checkup'],
      },
      {
        id: 'risk_002',
        type: 'diabetes',
        level: 'very_low',
        score: 0.08,
        description: 'Very low diabetes risk with excellent glucose control',
        factors: ['Normal glucose levels', 'Healthy weight', 'Active lifestyle'],
        recommendations: ['Maintain current diet', 'Regular glucose monitoring'],
      },
    ];
  }

  getMockRiskAnalysis() {
    return {
      overallRisk: 'low',
      riskScore: 0.12,
      primaryRisks: ['cardiovascular', 'diabetes'],
      recommendations: [
        'Continue regular exercise',
        'Maintain healthy diet',
        'Monitor blood pressure',
      ],
    };
  }

  getMockSymptomAnalysis(symptoms) {
    return {
      possibleConditions: [
        {
          condition: 'Common Cold',
          probability: 0.75,
          severity: 'mild',
        },
        {
          condition: 'Seasonal Allergies',
          probability: 0.45,
          severity: 'mild',
        },
      ],
      urgencyLevel: 'low',
      recommendations: [
        'Rest and stay hydrated',
        'Monitor symptoms for changes',
        'Consider over-the-counter remedies',
      ],
      confidence: 0.75,
    };
  }

  getMockRecommendations() {
    return [
      {
        id: 'rec_001',
        type: 'exercise',
        title: 'Increase Cardio Activity',
        description: 'Add 15 minutes of cardio exercise 3 times per week',
        priority: 'high',
        category: 'fitness',
      },
      {
        id: 'rec_002',
        type: 'nutrition',
        title: 'Increase Vegetable Intake',
        description: 'Aim for 5 servings of vegetables daily',
        priority: 'medium',
        category: 'nutrition',
      },
      {
        id: 'rec_003',
        type: 'sleep',
        title: 'Optimize Sleep Schedule',
        description: 'Maintain consistent bedtime and wake time',
        priority: 'medium',
        category: 'wellness',
      },
    ];
  }

  getMockExerciseRecommendations() {
    return [
      {
        id: 'ex_001',
        name: 'Brisk Walking',
        type: 'cardio',
        duration: 30,
        intensity: 'moderate',
        frequency: 'daily',
        description: 'Great low-impact cardio exercise for beginners',
      },
      {
        id: 'ex_002',
        name: 'Bodyweight Squats',
        type: 'strength',
        duration: 15,
        intensity: 'moderate',
        frequency: '3x per week',
        description: 'Builds lower body strength and improves mobility',
      },
      {
        id: 'ex_003',
        name: 'Yoga Flow',
        type: 'flexibility',
        duration: 20,
        intensity: 'low',
        frequency: '2x per week',
        description: 'Improves flexibility and reduces stress',
      },
    ];
  }

  // Offline AI Processing
  async processOfflineAI(data, type) {
    try {
      // Simple offline AI processing for basic health insights
      switch (type) {
        case 'heart_rate_analysis':
          return this.analyzeHeartRateOffline(data);
        case 'activity_analysis':
          return this.analyzeActivityOffline(data);
        default:
          return null;
      }
    } catch (error) {
      console.error('Error in offline AI processing:', error);
      return null;
    }
  }

  analyzeHeartRateOffline(heartRateData) {
    const avgHR = heartRateData.reduce((sum, hr) => sum + hr, 0) / heartRateData.length;
    
    let status = 'normal';
    let recommendation = 'Heart rate is within normal range';
    
    if (avgHR < 60) {
      status = 'low';
      recommendation = 'Consider consulting a healthcare provider about bradycardia';
    } else if (avgHR > 100) {
      status = 'high';
      recommendation = 'Monitor for sustained elevated heart rate';
    }
    
    return {
      averageHeartRate: Math.round(avgHR),
      status,
      recommendation,
      confidence: 0.8,
    };
  }

  analyzeActivityOffline(activityData) {
    const totalSteps = activityData.reduce((sum, day) => sum + day.steps, 0);
    const avgSteps = totalSteps / activityData.length;
    
    let status = 'good';
    let recommendation = 'Great activity level!';
    
    if (avgSteps < 5000) {
      status = 'low';
      recommendation = 'Try to increase daily steps for better health';
    } else if (avgSteps > 12000) {
      status = 'excellent';
      recommendation = 'Outstanding activity level! Keep it up!';
    }
    
    return {
      averageSteps: Math.round(avgSteps),
      totalSteps,
      status,
      recommendation,
      confidence: 0.85,
    };
  }
}

export { AIService };
export default new AIService();