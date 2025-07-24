const axios = require('axios');
const { logger } = require('./logger');

class FreeApiService {
  constructor() {
    // All these APIs are FREE and don't require API keys
    this.clients = {
      // Free health data APIs
      diseaseInfo: axios.create({
        baseURL: 'https://disease.sh/v3/covid-19',
        timeout: 5000
      }),
      
      // Free drug information
      rxnorm: axios.create({
        baseURL: 'https://rxnav.nlm.nih.gov/REST',
        timeout: 5000
      }),
      
      // Free medical terms
      medicalTerms: axios.create({
        baseURL: 'https://clinicaltables.nlm.nih.gov/api',
        timeout: 5000
      }),
      
      // Free location/weather (for health correlation)
      weather: axios.create({
        baseURL: 'https://api.open-meteo.com/v1',
        timeout: 5000
      }),
      
      // Free news for health updates
      news: axios.create({
        baseURL: 'https://newsapi.org/v2',
        timeout: 5000
      })
    };
  }

  // === DISEASE & HEALTH DATA ===
  async getGlobalHealthStats() {
    try {
      const response = await this.clients.diseaseInfo.get('/all');
      return {
        source: 'World Health Data',
        data: response.data,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Global health stats fetch failed:', error);
      return this.getMockGlobalHealthStats();
    }
  }

  async getCountryHealthData(country = 'zambia') {
    try {
      const response = await this.clients.diseaseInfo.get(`/countries/${country}`);
      return {
        source: 'Country Health Data',
        country: country,
        data: response.data,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Country health data fetch failed:', error);
      return this.getMockCountryHealthData(country);
    }
  }

  // === DRUG INFORMATION ===
  async searchDrugInfo(drugName) {
    try {
      const response = await this.clients.rxnorm.get(`/drugs.json?name=${encodeURIComponent(drugName)}`);
      return {
        source: 'RxNorm Drug Database',
        query: drugName,
        data: response.data,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Drug search failed:', error);
      return this.getMockDrugInfo(drugName);
    }
  }

  async getDrugInteractions(rxcui) {
    try {
      const response = await this.clients.rxnorm.get(`/interaction/interaction.json?rxcui=${rxcui}`);
      return {
        source: 'Drug Interaction Database',
        data: response.data,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Drug interactions fetch failed:', error);
      return this.getMockDrugInteractions();
    }
  }

  // === MEDICAL TERMS & ICD CODES ===
  async searchMedicalTerms(term) {
    try {
      const response = await this.clients.medicalTerms.get(`/icd10cm/v3/search?terms=${encodeURIComponent(term)}`);
      return {
        source: 'ICD-10 Medical Terms',
        query: term,
        data: response.data,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Medical terms search failed:', error);
      return this.getMockMedicalTerms(term);
    }
  }

  // === ENVIRONMENTAL HEALTH DATA ===
  async getEnvironmentalHealthData(latitude = -15.4067, longitude = 28.2833) {
    try {
      const response = await this.clients.weather.get('/forecast', {
        params: {
          latitude,
          longitude,
          hourly: 'temperature_2m,relative_humidity_2m,uv_index',
          daily: 'temperature_2m_max,temperature_2m_min,uv_index_max',
          timezone: 'Africa/Lusaka'
        }
      });
      
      return {
        source: 'Environmental Health Data',
        location: { latitude, longitude },
        data: response.data,
        healthCorrelations: this.generateHealthCorrelations(response.data),
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Environmental data fetch failed:', error);
      return this.getMockEnvironmentalData();
    }
  }

  // === HEALTH NEWS & UPDATES ===
  async getHealthNews() {
    try {
      // Using free tier of NewsAPI (limited requests)
      const response = await this.clients.news.get('/everything', {
        params: {
          q: 'health OR medical OR healthcare',
          sortBy: 'publishedAt',
          pageSize: 5,
          apiKey: process.env.NEWS_API_KEY || 'demo' // Use demo for offline/free mode
        }
      });
      
      return {
        source: 'Health News Feed',
        data: response.data.articles,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Health news fetch failed:', error);
      return this.getMockHealthNews();
    }
  }

  // === MOCK DATA GENERATORS (for offline demo) ===
  getMockGlobalHealthStats() {
    return {
      source: 'Mock Global Health Data',
      data: {
        cases: 704753890,
        deaths: 7010681,
        recovered: 675580946,
        active: 22162263,
        critical: 42893,
        casesPerOneMillion: 90284,
        deathsPerOneMillion: 898,
        tests: 7127031815,
        testsPerOneMillion: 913061,
        population: 7802674356,
        oneCasePerPeople: 11,
        oneDeathPerPeople: 1113,
        oneTestPerPeople: 1,
        activePerOneMillion: 2839,
        recoveredPerOneMillion: 86547,
        criticalPerOneMillion: 5.5
      },
      lastUpdated: new Date().toISOString()
    };
  }

  getMockCountryHealthData(country) {
    return {
      source: 'Mock Country Health Data',
      country: country,
      data: {
        cases: 348229,
        deaths: 4057,
        recovered: 343182,
        active: 990,
        critical: 15,
        casesPerOneMillion: 18456,
        deathsPerOneMillion: 215,
        tests: 3747032,
        testsPerOneMillion: 198615,
        population: 18865618
      },
      lastUpdated: new Date().toISOString()
    };
  }

  getMockDrugInfo(drugName) {
    return {
      source: 'Mock Drug Database',
      query: drugName,
      data: {
        drugGroup: {
          name: drugName,
          conceptProperties: [
            {
              "rxcui": "161",
              "name": drugName,
              "synonym": "Generic Medicine",
              "tty": "IN",
              "language": "ENG",
              "suppress": "N",
              "umlscui": ""
            }
          ]
        }
      },
      lastUpdated: new Date().toISOString()
    };
  }

  getMockDrugInteractions() {
    return {
      source: 'Mock Drug Interactions',
      data: {
        nlmDisclaimer: "Mock data for demonstration purposes",
        interactionTypeGroup: [
          {
            sourceDisclaimer: "Demo interaction data",
            sourceName: "BioVerse Demo",
            interactionType: [
              {
                comment: "Monitor patient closely for side effects",
                minConcept: [
                  {
                    rxcui: "161",
                    name: "Acetaminophen",
                    tty: "IN"
                  }
                ]
              }
            ]
          }
        ]
      },
      lastUpdated: new Date().toISOString()
    };
  }

  getMockMedicalTerms(term) {
    return {
      source: 'Mock Medical Terms',
      query: term,
      data: [
        [`${term} related condition`, "R50.9", "Fever, unspecified"],
        [`${term} symptoms`, "R06.02", "Shortness of breath"],
        [`${term} diagnosis`, "Z51.11", "Encounter for routine medical checkup"]
      ],
      lastUpdated: new Date().toISOString()
    };
  }

  getMockEnvironmentalData() {
    return {
      source: 'Mock Environmental Health Data',
      location: { latitude: -15.4067, longitude: 28.2833 },
      data: {
        current_weather: {
          temperature: 24.5,
          humidity: 65,
          uv_index: 6.2
        },
        daily: {
          temperature_2m_max: [26, 28, 25, 27, 24],
          temperature_2m_min: [18, 19, 17, 20, 16],
          uv_index_max: [7.2, 8.1, 6.5, 7.8, 6.9]
        }
      },
      healthCorrelations: {
        heatStressRisk: 'Low',
        uvExposureRisk: 'Moderate',
        respiratoryConditionsAlert: false,
        recommendations: [
          'Use sunscreen when outdoors',
          'Stay hydrated in warm weather',
          'Monitor air quality for respiratory health'
        ]
      },
      lastUpdated: new Date().toISOString()
    };
  }

  getMockHealthNews() {
    return {
      source: 'Mock Health News',
      data: [
        {
          title: "New Advances in Digital Health Technology",
          description: "Recent developments in AI-powered healthcare solutions are transforming patient care globally.",
          url: "#",
          publishedAt: new Date().toISOString(),
          source: { name: "Health Tech Today" }
        },
        {
          title: "Telemedicine Adoption Continues to Grow",
          description: "Remote healthcare services are becoming increasingly popular in developing nations.",
          url: "#",
          publishedAt: new Date(Date.now() - 3600000).toISOString(),
          source: { name: "Medical Innovation Weekly" }
        }
      ],
      lastUpdated: new Date().toISOString()
    };
  }

  generateHealthCorrelations(weatherData) {
    // Generate health insights based on weather data
    const temp = weatherData.current_weather?.temperature || 25;
    const humidity = weatherData.current_weather?.humidity || 60;
    const uv = weatherData.current_weather?.uv_index || 5;

    return {
      heatStressRisk: temp > 35 ? 'High' : temp > 30 ? 'Moderate' : 'Low',
      uvExposureRisk: uv > 8 ? 'High' : uv > 5 ? 'Moderate' : 'Low',
      respiratoryConditionsAlert: humidity > 80 || temp > 40,
      recommendations: [
        temp > 30 ? 'Stay hydrated and avoid prolonged sun exposure' : 'Weather conditions are favorable',
        uv > 6 ? 'Use sunscreen and protective clothing' : 'UV levels are manageable',
        humidity > 75 ? 'Monitor for respiratory symptoms' : 'Humidity levels are comfortable'
      ]
    };
  }

  // === HEALTH TWIN AI SIMULATION ===
  async generateHealthInsights(patientData) {
    // Simulate AI-powered health insights using patient data
    const insights = {
      riskScore: this.calculateRiskScore(patientData),
      predictions: this.generatePredictions(patientData),
      recommendations: this.generateRecommendations(patientData),
      alerts: this.generateAlerts(patientData),
      trends: this.generateTrends(patientData)
    };

    return {
      source: 'BioVerse AI Health Twin',
      patientId: patientData.id,
      insights,
      confidence: 0.87,
      lastUpdated: new Date().toISOString()
    };
  }

  calculateRiskScore(patientData) {
    // Simple risk calculation based on available data
    let score = 0;
    const age = patientData.age || 30;
    
    // Age factor
    if (age > 65) score += 30;
    else if (age > 50) score += 20;
    else if (age > 35) score += 10;
    
    // Chronic conditions
    const conditions = patientData.chronicConditions || [];
    score += conditions.length * 15;
    
    // Lifestyle factors (simulated)
    score += Math.floor(Math.random() * 20);
    
    return Math.min(100, Math.max(0, score));
  }

  generatePredictions(patientData) {
    return [
      {
        condition: 'Cardiovascular Risk',
        probability: 0.23,
        timeframe: '5 years',
        confidence: 0.78
      },
      {
        condition: 'Diabetes Risk',
        probability: 0.15,
        timeframe: '3 years',
        confidence: 0.82
      }
    ];
  }

  generateRecommendations(patientData) {
    return [
      'Regular cardiovascular exercise (30 min, 3x/week)',
      'Annual comprehensive health screening',
      'Maintain healthy BMI (18.5-24.9)',
      'Monitor blood pressure monthly',
      'Balanced diet with reduced sodium intake'
    ];
  }

  generateAlerts(patientData) {
    return [
      {
        type: 'routine',
        message: 'Annual checkup due in 2 months',
        priority: 'medium'
      },
      {
        type: 'medication',
        message: 'Prescription renewal needed',
        priority: 'low'
      }
    ];
  }

  generateTrends(patientData) {
    // Generate sample trend data
    const dates = Array.from({length: 30}, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split('T')[0];
    });

    return {
      bloodPressure: {
        systolic: dates.map(() => 120 + Math.floor(Math.random() * 20)),
        diastolic: dates.map(() => 80 + Math.floor(Math.random() * 15)),
        dates
      },
      heartRate: {
        values: dates.map(() => 70 + Math.floor(Math.random() * 20)),
        dates
      },
      weight: {
        values: dates.map(() => 70 + Math.floor(Math.random() * 5)),
        dates
      }
    };
  }
}

module.exports = new FreeApiService();
