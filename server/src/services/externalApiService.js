const axios = require('axios');
const { logger } = require('./logger');

class ExternalApiService {
  constructor() {
    this.fhirClient = axios.create({
      baseURL: process.env.FHIR_SERVER_URL || 'https://hapi.fhir.org/baseR4',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/fhir+json',
        'Accept': 'application/fhir+json'
      }
    });

    this.openFdaClient = axios.create({
      baseURL: 'https://api.fda.gov',
      timeout: 10000
    });

    this.clinicalTrialsClient = axios.create({
      baseURL: 'https://clinicaltrials.gov/api/v2',
      timeout: 10000
    });
  }

  // FHIR (Fast Healthcare Interoperability Resources) Integration
  async searchPatients(query) {
    try {
      const response = await this.fhirClient.get(`/Patient?name=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error) {
      logger.error('FHIR Patient search failed:', error);
      throw new Error('Healthcare record lookup failed');
    }
  }

  async getPatientObservations(patientId) {
    try {
      const response = await this.fhirClient.get(`/Observation?patient=${patientId}`);
      return response.data;
    } catch (error) {
      logger.error('FHIR Observations fetch failed:', error);
      return null;
    }
  }

  // FDA Drug Information API
  async getDrugInformation(drugName) {
    try {
      const response = await this.openFdaClient.get(`/drug/label.json?search=openfda.brand_name:"${drugName}"`);
      return response.data;
    } catch (error) {
      logger.error('FDA Drug info fetch failed:', error);
      return null;
    }
  }

  async getDrugInteractions(drugName) {
    try {
      const response = await this.openFdaClient.get(`/drug/event.json?search=patient.drug.medicinalproduct:"${drugName}"`);
      return response.data;
    } catch (error) {
      logger.error('FDA Drug interactions fetch failed:', error);
      return null;
    }
  }

  // Clinical Trials API
  async searchClinicalTrials(condition, location = 'global') {
    try {
      const response = await this.clinicalTrialsClient.get('/studies', {
        params: {
          'query.cond': condition,
          'query.locn': location,
          'format': 'json',
          'pageSize': 10
        }
      });
      return response.data;
    } catch (error) {
      logger.error('Clinical trials search failed:', error);
      return null;
    }
  }

  // NIH PubMed Literature Search
  async searchMedicalLiterature(query) {
    try {
      const response = await axios.get('https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi', {
        params: {
          db: 'pubmed',
          term: query,
          retmode: 'json',
          retmax: 10
        }
      });
      return response.data;
    } catch (error) {
      logger.error('PubMed search failed:', error);
      return null;
    }
  }

  // WHO Disease Outbreak API
  async getDiseaseOutbreaks() {
    try {
      const response = await axios.get('https://disease.sh/v3/covid-19/all');
      return response.data;
    } catch (error) {
      logger.error('Disease outbreak data fetch failed:', error);
      return null;
    }
  }

  // ICD-10 Diagnosis Codes
  async searchICD10Codes(query) {
    try {
      const response = await axios.get(`https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search`, {
        params: {
          terms: query,
          maxList: 10
        }
      });
      return response.data;
    } catch (error) {
      logger.error('ICD-10 search failed:', error);
      return null;
    }
  }
}

module.exports = new ExternalApiService();
