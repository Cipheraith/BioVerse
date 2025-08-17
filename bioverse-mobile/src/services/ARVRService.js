import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

class ARVRService {
  constructor() {
    this.apiClient = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
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

    this.activeSessions = new Map();
  }

  // AR Sessions
  async startARSession(experience) {
    try {
      const response = await this.apiClient.post('/ar/sessions/start', {
        experienceId: experience.id,
        experienceType: experience.type,
      });

      const session = {
        id: response.data.sessionId || `ar_${Date.now()}`,
        name: experience.name,
        type: 'AR',
        experienceId: experience.id,
        startTime: new Date().toISOString(),
        status: 'active',
        progress: 0,
        duration: 0,
      };

      this.activeSessions.set(session.id, session);
      this.startSessionTracking(session);

      return session;
    } catch (error) {
      console.error('Error starting AR session:', error);
      // Mock successful AR session start
      const session = {
        id: `ar_${Date.now()}`,
        name: experience.name,
        type: 'AR',
        experienceId: experience.id,
        startTime: new Date().toISOString(),
        status: 'active',
        progress: 0,
        duration: 0,
      };

      this.activeSessions.set(session.id, session);
      this.startSessionTracking(session);
      return session;
    }
  }

  async endARSession(sessionId) {
    try {
      const response = await this.apiClient.post(`/ar/sessions/${sessionId}/end`);
      
      const session = this.activeSessions.get(sessionId);
      if (session) {
        session.status = 'completed';
        session.endTime = new Date().toISOString();
        session.duration = Date.now() - new Date(session.startTime).getTime();
      }

      return response.data;
    } catch (error) {
      console.error('Error ending AR session:', error);
      // Mock successful session end
      const session = this.activeSessions.get(sessionId);
      if (session) {
        session.status = 'completed';
        session.endTime = new Date().toISOString();
        session.duration = Date.now() - new Date(session.startTime).getTime();
      }
      return { success: true };
    }
  }

  // VR Sessions
  async startVRSession(experience) {
    try {
      const response = await this.apiClient.post('/vr/sessions/start', {
        experienceId: experience.id,
        experienceType: experience.type,
        therapyType: experience.id,
      });

      const session = {
        id: response.data.sessionId || `vr_${Date.now()}`,
        name: experience.name,
        type: 'VR',
        experienceId: experience.id,
        startTime: new Date().toISOString(),
        status: 'active',
        progress: 0,
        duration: 0,
        biometricMonitoring: true,
        therapeuticGoals: this.getTherapeuticGoals(experience.id),
      };

      this.activeSessions.set(session.id, session);
      this.startSessionTracking(session);
      this.startBiometricMonitoring(session);

      return session;
    } catch (error) {
      console.error('Error starting VR session:', error);
      // Mock successful VR session start
      const session = {
        id: `vr_${Date.now()}`,
        name: experience.name,
        type: 'VR',
        experienceId: experience.id,
        startTime: new Date().toISOString(),
        status: 'active',
        progress: 0,
        duration: 0,
        biometricMonitoring: true,
        therapeuticGoals: this.getTherapeuticGoals(experience.id),
      };

      this.activeSessions.set(session.id, session);
      this.startSessionTracking(session);
      this.startBiometricMonitoring(session);
      return session;
    }
  }

  async endVRSession(sessionId) {
    try {
      const response = await this.apiClient.post(`/vr/sessions/${sessionId}/end`);
      
      const session = this.activeSessions.get(sessionId);
      if (session) {
        session.status = 'completed';
        session.endTime = new Date().toISOString();
        session.duration = Date.now() - new Date(session.startTime).getTime();
        session.therapeuticOutcome = this.calculateTherapeuticOutcome(session);
      }

      return response.data;
    } catch (error) {
      console.error('Error ending VR session:', error);
      // Mock successful session end
      const session = this.activeSessions.get(sessionId);
      if (session) {
        session.status = 'completed';
        session.endTime = new Date().toISOString();
        session.duration = Date.now() - new Date(session.startTime).getTime();
        session.therapeuticOutcome = this.calculateTherapeuticOutcome(session);
      }
      return { success: true };
    }
  }

  // Session Management
  async getActiveSessions() {
    try {
      const response = await this.apiClient.get('/ar-vr/sessions/active');
      return response.data;
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      // Return mock active sessions
      return Array.from(this.activeSessions.values()).filter(s => s.status === 'active');
    }
  }

  async getSessionHistory() {
    try {
      const response = await this.apiClient.get('/ar-vr/sessions/history');
      return response.data;
    } catch (error) {
      console.error('Error fetching session history:', error);
      return [];
    }
  }

  async getAvailableExperiences() {
    try {
      const response = await this.apiClient.get('/ar-vr/experiences');
      return response.data;
    } catch (error) {
      console.error('Error fetching available experiences:', error);
      return this.getMockExperiences();
    }
  }

  // Session Tracking
  startSessionTracking(session) {
    const interval = setInterval(() => {
      if (!this.activeSessions.has(session.id) || session.status !== 'active') {
        clearInterval(interval);
        return;
      }

      // Update session progress
      session.duration = Date.now() - new Date(session.startTime).getTime();
      session.progress = Math.min((session.duration / (30 * 60 * 1000)) * 100, 100); // 30 min max

      // Update session data
      this.activeSessions.set(session.id, session);
    }, 1000); // Update every second
  }

  // Biometric Monitoring for VR Sessions
  startBiometricMonitoring(session) {
    if (!session.biometricMonitoring) return;

    const interval = setInterval(() => {
      if (!this.activeSessions.has(session.id) || session.status !== 'active') {
        clearInterval(interval);
        return;
      }

      // Simulate biometric data collection
      const biometricData = this.generateBiometricData();
      
      // Check for alerts
      const alerts = this.checkBiometricAlerts(biometricData);
      if (alerts.length > 0) {
        this.handleBiometricAlerts(session.id, alerts);
      }

      // Store biometric data
      if (!session.biometricData) {
        session.biometricData = [];
      }
      session.biometricData.push({
        timestamp: new Date().toISOString(),
        ...biometricData,
      });

    }, 5000); // Update every 5 seconds
  }

  generateBiometricData() {
    return {
      heartRate: 70 + Math.floor(Math.random() * 30),
      stressLevel: Math.random(),
      immersionLevel: 0.7 + Math.random() * 0.3,
      motionIntensity: Math.random(),
      eyeStrain: Math.random() * 0.5,
    };
  }

  checkBiometricAlerts(data) {
    const alerts = [];

    if (data.heartRate > 120) {
      alerts.push({
        type: 'elevated_heart_rate',
        severity: 'medium',
        value: data.heartRate,
        message: 'Heart rate is elevated during VR session',
      });
    }

    if (data.stressLevel > 0.8) {
      alerts.push({
        type: 'high_stress',
        severity: 'high',
        value: data.stressLevel,
        message: 'High stress levels detected',
      });
    }

    if (data.eyeStrain > 0.7) {
      alerts.push({
        type: 'eye_strain',
        severity: 'low',
        value: data.eyeStrain,
        message: 'Consider taking a break to rest your eyes',
      });
    }

    return alerts;
  }

  handleBiometricAlerts(sessionId, alerts) {
    // In a real app, this would trigger appropriate responses
    console.log(`Biometric alerts for session ${sessionId}:`, alerts);
    
    // For high severity alerts, consider pausing the session
    const highSeverityAlerts = alerts.filter(a => a.severity === 'high');
    if (highSeverityAlerts.length > 0) {
      this.pauseSession(sessionId);
    }
  }

  async pauseSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'paused';
      session.pausedAt = new Date().toISOString();
    }
  }

  async resumeSession(sessionId) {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'active';
      session.resumedAt = new Date().toISOString();
    }
  }

  // Therapeutic Goals and Outcomes
  getTherapeuticGoals(experienceId) {
    const goals = {
      'pain_management': [
        'Reduce pain perception by 30%',
        'Improve relaxation response',
        'Learn coping strategies',
      ],
      'anxiety_treatment': [
        'Decrease anxiety levels',
        'Practice breathing techniques',
        'Build confidence in calm environments',
      ],
      'phobia_exposure': [
        'Gradual exposure to feared stimulus',
        'Reduce avoidance behaviors',
        'Build tolerance and confidence',
      ],
      'physical_rehab': [
        'Improve range of motion',
        'Increase strength and coordination',
        'Enhance motor skills',
      ],
    };

    return goals[experienceId] || ['General wellness improvement'];
  }

  calculateTherapeuticOutcome(session) {
    // Simplified therapeutic outcome calculation
    const baseScore = 70;
    const durationBonus = Math.min(session.duration / (20 * 60 * 1000) * 20, 20); // Up to 20 points for 20+ min
    const progressBonus = (session.progress / 100) * 10; // Up to 10 points for completion
    
    let biometricBonus = 0;
    if (session.biometricData && session.biometricData.length > 0) {
      const avgStress = session.biometricData.reduce((sum, d) => sum + d.stressLevel, 0) / session.biometricData.length;
      biometricBonus = (1 - avgStress) * 10; // Lower stress = better outcome
    }

    const totalScore = Math.min(baseScore + durationBonus + progressBonus + biometricBonus, 100);

    return {
      score: Math.round(totalScore),
      level: totalScore > 80 ? 'excellent' : totalScore > 60 ? 'good' : 'fair',
      improvements: this.generateImprovementSuggestions(session),
      goalsAchieved: session.therapeuticGoals?.slice(0, Math.floor(totalScore / 30)) || [],
    };
  }

  generateImprovementSuggestions(session) {
    const suggestions = [];

    if (session.duration < 15 * 60 * 1000) {
      suggestions.push('Try longer sessions for better therapeutic benefits');
    }

    if (session.progress < 80) {
      suggestions.push('Complete the full experience for maximum benefit');
    }

    if (session.biometricData) {
      const avgStress = session.biometricData.reduce((sum, d) => sum + d.stressLevel, 0) / session.biometricData.length;
      if (avgStress > 0.6) {
        suggestions.push('Practice relaxation techniques before starting VR therapy');
      }
    }

    return suggestions;
  }

  // Experience Customization
  async customizeExperience(experienceId, customizations) {
    try {
      const response = await this.apiClient.put(`/ar-vr/experiences/${experienceId}/customize`, customizations);
      return response.data;
    } catch (error) {
      console.error('Error customizing experience:', error);
      return { success: false };
    }
  }

  async getExperienceSettings(experienceId) {
    try {
      const response = await this.apiClient.get(`/ar-vr/experiences/${experienceId}/settings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching experience settings:', error);
      return this.getDefaultExperienceSettings(experienceId);
    }
  }

  getDefaultExperienceSettings(experienceId) {
    const defaultSettings = {
      'pain_management': {
        environment: 'beach',
        intensity: 'medium',
        duration: 20,
        biofeedback: true,
      },
      'anxiety_treatment': {
        environment: 'forest',
        intensity: 'low',
        duration: 15,
        guidedBreathing: true,
      },
      'phobia_exposure': {
        exposureLevel: 'minimal',
        duration: 30,
        safetyControls: true,
        progressiveExposure: true,
      },
      'physical_rehab': {
        exerciseType: 'range_of_motion',
        difficulty: 'beginner',
        duration: 25,
        motionTracking: true,
      },
    };

    return defaultSettings[experienceId] || {};
  }

  // Mock Data
  getMockExperiences() {
    return [
      {
        id: 'anatomy_education',
        name: 'Interactive Anatomy',
        type: 'AR',
        category: 'education',
        description: 'Explore 3D human anatomy with AR visualization',
        duration: '15-30 min',
        difficulty: 'beginner',
        features: ['3D Organs', 'Interactive Learning', 'Real-time Info'],
      },
      {
        id: 'pain_management',
        name: 'Pain Management VR',
        type: 'VR',
        category: 'therapy',
        description: 'Immersive VR therapy for chronic pain relief',
        duration: '20-45 min',
        difficulty: 'beginner',
        features: ['Guided Meditation', 'Biofeedback', 'Pain Tracking'],
      },
    ];
  }

  // Analytics and Reporting
  async getSessionAnalytics(timeframe = '1M') {
    try {
      const response = await this.apiClient.get('/ar-vr/analytics', {
        params: { timeframe },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching session analytics:', error);
      return this.getMockAnalytics();
    }
  }

  getMockAnalytics() {
    return {
      totalSessions: 15,
      totalDuration: 450, // minutes
      averageSessionDuration: 30,
      completionRate: 85,
      therapeuticOutcomes: {
        excellent: 6,
        good: 7,
        fair: 2,
      },
      mostUsedExperiences: [
        { name: 'Pain Management VR', sessions: 8 },
        { name: 'Anxiety Treatment', sessions: 4 },
        { name: 'Interactive Anatomy', sessions: 3 },
      ],
    };
  }

  // Device Compatibility
  async checkDeviceCompatibility() {
    // In a real app, this would check device capabilities
    return {
      ar: {
        supported: true,
        features: ['camera', 'gyroscope', 'accelerometer'],
        performance: 'high',
      },
      vr: {
        supported: true,
        features: ['gyroscope', 'accelerometer', 'magnetometer'],
        performance: 'medium',
        requiresHeadset: false, // Mobile VR
      },
    };
  }
}

export { ARVRService };
export default new ARVRService();