const request = require('supertest');
const app = require('../app');

describe('Health Twin', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        dob: '1990-01-01',
        nationalId: 'test12345'
      });

    authToken = registerResponse.body.token;
  });

  describe('POST /api/health-twin/update', () => {
    it('should update health twin with new data', async () => {
      const healthData = {
        vitals: {
          bloodPressure: { systolic: 120, diastolic: 80 },
          heartRate: 72,
          temperature: 36.5,
          weight: 70,
          height: 175
        },
        symptoms: ['headache', 'fatigue'],
        medications: ['aspirin'],
        lifestyle: {
          exercise: 'moderate',
          diet: 'balanced',
          sleep: 7,
          stress: 'low'
        }
      };

      const response = await request(app)
        .post('/api/health-twin/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(healthData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.healthTwin.healthScore).toBeDefined();
      expect(response.body.healthTwin.riskFactors).toBeDefined();
    });

    it('should calculate health score correctly', async () => {
      const healthData = {
        vitals: {
          bloodPressure: { systolic: 130, diastolic: 85 },
          heartRate: 78,
          temperature: 36.7,
          weight: 75,
          height: 175
        },
        symptoms: [],
        medications: [],
        lifestyle: {
          exercise: 'high',
          diet: 'healthy',
          sleep: 8,
          stress: 'low'
        }
      };

      const response = await request(app)
        .post('/api/health-twin/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(healthData)
        .expect(200);

      expect(response.body.healthTwin.healthScore).toBeGreaterThan(7);
      expect(response.body.healthTwin.riskFactors).toHaveLength(0);
    });

    it('should identify risk factors', async () => {
      const healthData = {
        vitals: {
          bloodPressure: { systolic: 150, diastolic: 95 },
          heartRate: 95,
          temperature: 37.5,
          weight: 90,
          height: 175
        },
        symptoms: ['chest pain', 'shortness of breath'],
        medications: ['beta-blocker'],
        lifestyle: {
          exercise: 'low',
          diet: 'poor',
          sleep: 5,
          stress: 'high'
        }
      };

      const response = await request(app)
        .post('/api/health-twin/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send(healthData)
        .expect(200);

      expect(response.body.healthTwin.riskFactors.length).toBeGreaterThan(0);
      expect(response.body.healthTwin.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/health-twin/analytics', () => {
    beforeEach(async () => {
      // Create sample health records
      // Note: HealthRecord.insertMany is not directly supported by the database.js setup.
      // This part of the test will need to be adapted to use runQuery or getQuery.
      // For now, we'll assume the health twin update creates necessary records.
      await request(app)
        .post('/api/health-twin/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vitals: {
            bloodPressure: { systolic: 120, diastolic: 80 },
            heartRate: 72,
            temperature: 36.5,
            weight: 70,
            height: 175
          },
          symptoms: [],
          medications: [],
          lifestyle: {
            exercise: 'moderate',
            diet: 'balanced',
            sleep: 7,
            stress: 'low'
          }
        });
    });

    it('should return health analytics', async () => {
      const response = await request(app)
        .get('/api/health-twin/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.trends).toBeDefined();
      expect(response.body.patterns).toBeDefined();
      expect(response.body.insights).toBeDefined();
    });

    it('should return trend analysis', async () => {
      const response = await request(app)
        .get('/api/health-twin/analytics')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.trends.bloodPressure).toBeDefined();
      expect(response.body.trends.heartRate).toBeDefined();
      expect(response.body.trends.weight).toBeDefined();
    });
  });

  describe('GET /api/health-twin/predictions', () => {
    beforeEach(async () => {
      // Create health twin with data
      await request(app)
        .post('/api/health-twin/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vitals: {
            bloodPressure: { systolic: 140, diastolic: 90 },
            heartRate: 85,
            temperature: 36.8,
            weight: 80,
            height: 175
          },
          symptoms: ['headache'],
          medications: [],
          lifestyle: {
            exercise: 'low',
            diet: 'average',
            sleep: 6,
            stress: 'medium'
          }
        });
    });

    it('should return health predictions', async () => {
      const response = await request(app)
        .get('/api/health-twin/predictions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.predictions).toBeDefined();
      expect(response.body.predictions.length).toBeGreaterThan(0);
    });

    it('should include risk assessment', async () => {
      const response = await request(app)
        .get('/api/health-twin/predictions')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.riskAssessment).toBeDefined();
      expect(response.body.riskAssessment.cardiovascular).toBeDefined();
      expect(response.body.riskAssessment.diabetes).toBeDefined();
    });
  });

  describe('GET /api/health-twin/recommendations', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/health-twin/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vitals: {
            bloodPressure: { systolic: 145, diastolic: 92 },
            heartRate: 88,
            temperature: 36.9,
            weight: 85,
            height: 175
          },
          symptoms: ['fatigue', 'dizziness'],
          medications: [],
          lifestyle: {
            exercise: 'low',
            diet: 'poor',
            sleep: 5,
            stress: 'high'
          }
        });
    });

    it('should return personalized recommendations', async () => {
      const response = await request(app)
        .get('/api/health-twin/recommendations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.recommendations).toBeDefined();
      expect(response.body.recommendations.length).toBeGreaterThan(0);
    });

    it('should include actionable advice', async () => {
      const response = await request(app)
        .get('/api/health-twin/recommendations')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const recommendations = response.body.recommendations;
      expect(recommendations.some(r => r.category === 'lifestyle')).toBe(true);
      expect(recommendations.some(r => r.priority === 'high')).toBe(true);
    });
  });

  describe('GET /api/health-twin/status', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/health-twin/update')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          vitals: {
            bloodPressure: { systolic: 125, diastolic: 82 },
            heartRate: 74,
            temperature: 36.6,
            weight: 72,
            height: 175
          },
          symptoms: [],
          medications: [],
          lifestyle: {
            exercise: 'moderate',
            diet: 'balanced',
            sleep: 7,
            stress: 'low'
          }
        });
    });

    it('should return current health status', async () => {
      const response = await request(app)
        .get('/api/health-twin/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.healthScore).toBeDefined();
      expect(response.body.overallStatus).toBeDefined();
      expect(response.body.lastUpdated).toBeDefined();
    });

    it('should include health metrics summary', async () => {
      const response = await request(app)
        .get('/api/health-twin/status')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.metrics).toBeDefined();
      expect(response.body.metrics.vitals).toBeDefined();
      expect(response.body.metrics.riskFactors).toBeDefined();
    });
  });
});
