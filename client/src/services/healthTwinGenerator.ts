import { Patient, HealthTwin } from '../types/healthTwin';

export const generateHealthTwinsForAllPatients = async (): Promise<HealthTwin[]> => {
  try {
    const response = await fetch(`${process.env.VITE_API_BASE_URL}/api/patients`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    const patients: Patient[] = await response.json();

    return patients.map((patient) => ({
      patientId: patient.id,
      lastUpdated: new Date().toISOString(),
      basicInfo: patient,
      healthHistory: {
        symptoms: {
          recent: [],
          all: [],
          trends: {
            frequency: {},
            severity: {},
            timeline: [],
          },
          summary: {
            totalReports: 0,
            uniqueSymptoms: 0,
            topSymptoms: [],
            lastReported: null,
          },
        },
        appointments: {
          recent: [],
          all: [],
          frequency: {
            frequency: 0,
            pattern: '',
          },
          adherence: {
            adherence: '',
            status: '',
          },
        },
        labResults: {
          recent: [],
          all: [],
          trends: {
            values: {},
            abnormalCount: 0,
            latestResults: {},
          },
        },
      },
      riskProfile: {
        demographic: { score: 0, factors: [] },
        behavioral: { score: 0, factors: [] },
        clinical: { score: 0, factors: [] },
        environmental: { score: 0, factors: [] },
        overall: 'low',
      },
      insights: {
        healthStatus: {
          status: 'good',
          factors: [],
          summary: '',
        },
        trends: {
          overall: 'stable',
        },
        alerts: [],
        recommendations: [],
        riskIndicators: [],
      },
      predictions: {
        healthTrajectory: {
          direction: 'stable',
          confidence: 100,
          factors: [],
        },
        riskProgression: {
          timeframe: 'immediate',
          progression: 'stable',
          confidence: 100,
          factors: [],
        },
        interventionNeeds: [],
        resourceRequirements: {
          appointments: {
            frequency: 'monthly',
            type: 'check-up',
          },
          monitoring: {
            required: true,
            frequency: 'monthly',
          },
          medications: {
            refillReminder: true,
            adherenceMonitoring: false,
          },
        },
      },
      timeline: [],
    }));
  } catch (error) {
    console.error('Error generating health twins:', error);
    return [];
  }
};

