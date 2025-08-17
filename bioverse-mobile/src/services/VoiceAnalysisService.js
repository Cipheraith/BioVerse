import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';

export class VoiceAnalysisService {
  constructor() {
    this.recording = null;
    this.isRecording = false;
    this.apiBaseUrl = 'http://localhost:3000/api';
  }

  async startRecording() {
    try {
      console.log('Requesting permissions..');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('Starting recording..');
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      this.recording = recording;
      this.isRecording = true;

      return true;
    } catch (err) {
      console.error('Failed to start recording', err);
      return false;
    }
  }

  async stopRecording() {
    if (!this.recording || !this.isRecording) {
      return null;
    }

    try {
      console.log('Stopping recording..');
      await this.recording.stopAndUnloadAsync();
      const uri = this.recording.getURI();
      this.recording = null;
      this.isRecording = false;

      return uri;
    } catch (error) {
      console.error('Error stopping recording:', error);
      return null;
    }
  }

  async analyzeVoiceForMentalHealth(audioUri, userId) {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'voice_sample.m4a',
      });
      formData.append('userId', userId);

      const response = await axios.post(
        `${this.apiBaseUrl}/health/analyze-voice`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Voice analysis failed:', error);
      throw new Error('Voice analysis failed. Please try again.');
    }
  }

  async getVoiceAnalysisHistory(userId) {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/health/voice-history/${userId}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to get voice analysis history:', error);
      return [];
    }
  }

  async analyzeSpeechPatterns(audioUri, options = {}) {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'speech_sample.m4a',
      });
      formData.append('analysisType', 'speech-patterns');
      formData.append('options', JSON.stringify(options));

      const response = await axios.post(
        `${this.apiBaseUrl}/health/analyze-speech`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Speech pattern analysis failed:', error);
      throw new Error('Speech analysis failed. Please try again.');
    }
  }

  async getRecordingPermissions() {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  async transcribeAudio(audioUri) {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'transcription_sample.m4a',
      });

      const response = await axios.post(
        `${this.apiBaseUrl}/health/transcribe-audio`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 30000,
        }
      );

      return response.data.transcription;
    } catch (error) {
      console.error('Transcription failed:', error);
      throw new Error('Audio transcription failed.');
    }
  }

  async analyzeVoiceBiomarkers(audioUri, userId) {
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'biomarker_sample.m4a',
      });
      formData.append('userId', userId);

      const response = await axios.post(
        `${this.apiBaseUrl}/health/voice-biomarkers`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          timeout: 45000,
        }
      );

      return response.data;
    } catch (error) {
      console.error('Voice biomarker analysis failed:', error);
      throw new Error('Biomarker analysis failed. Please try again.');
    }
  }

  formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getHealthScoreColor(score) {
    if (score >= 0.8) return '#4CAF50'; // Green - Excellent
    if (score >= 0.6) return '#8BC34A'; // Light Green - Good
    if (score >= 0.4) return '#FF9800'; // Orange - Fair
    if (score >= 0.2) return '#FF5722'; // Red Orange - Poor
    return '#F44336'; // Red - Critical
  }

  getRiskLevel(score) {
    if (score < 0.2) return 'Very Low';
    if (score < 0.4) return 'Low';
    if (score < 0.6) return 'Moderate';
    if (score < 0.8) return 'High';
    return 'Very High';
  }

  generateHealthRecommendations(analysisResult) {
    const recommendations = [];

    if (analysisResult.depressionRisk > 0.7) {
      recommendations.push({
        type: 'urgent',
        title: 'Mental Health Support',
        message: 'Consider speaking with a mental health professional',
        action: 'Schedule consultation'
      });
    }

    if (analysisResult.anxietyLevel > 0.6) {
      recommendations.push({
        type: 'moderate',
        title: 'Anxiety Management',
        message: 'Try daily meditation and breathing exercises',
        action: 'Start mindfulness practice'
      });
    }

    if (analysisResult.stressLevel > 7) {
      recommendations.push({
        type: 'moderate',
        title: 'Stress Reduction',
        message: 'Focus on stress management and adequate sleep',
        action: 'Improve sleep hygiene'
      });
    }

    if (analysisResult.energyLevel < 0.3) {
      recommendations.push({
        type: 'low',
        title: 'Energy Boost',
        message: 'Consider regular physical exercise and nutrition review',
        action: 'Plan exercise routine'
      });
    }

    if (analysisResult.voiceStability < 0.4) {
      recommendations.push({
        type: 'moderate',
        title: 'Voice Health',
        message: 'Stay hydrated and consider vocal exercises',
        action: 'Vocal care routine'
      });
    }

    return recommendations;
  }
}
