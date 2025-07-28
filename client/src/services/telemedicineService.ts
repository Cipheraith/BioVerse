/**
 * Telemedicine Service with 3D Integration
 * Handles video, voice, screen sharing, and 3D model streaming for consultations
 */

import { io, Socket } from 'socket.io-client';

export interface TelemedicineSession {
  sessionId: string;
  patientId: string;
  doctorId: string;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  startedAt?: string;
  completedAt?: string;
  videoEnabled: boolean;
  screenSharing: boolean;
  voiceEnabled: boolean;
  isRecording: boolean;
  platform: 'web' | 'mobile';
  connectedDevices?: string[];
  sessionRecordings?: string[];
  3DIntegrationEnabled: boolean;
}

export interface Consultant {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  availability: Array<{ day: string; start: string; end: string }>;
  photo?: string;
  activeSessions: string[];
  contactMethods: Array<'email' | 'phone' | 'video' | 'text'>;
  languages: string[];
}

class TelemedicineService {
  private socket: Socket | null = null;
  private baseUrl: string;
  private sessions: Map<string, TelemedicineSession> = new Map();
  private consultants: Map<string, Consultant> = new Map();

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    this.initializeConnection();
  }

  /**
   * Initialize WebSocket connection for telemedicine sessions
   */
  private initializeConnection(): void {
    this.socket = io(this.baseUrl, {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Telemedicine Service connected');
    });

    this.socket.on('session_update', (session: TelemedicineSession) => {
      this.sessions.set(session.sessionId, session);
    });

    this.socket.on('session_end', (sessionId: string) => {
      this.sessions.delete(sessionId);
    });

    this.socket.on('disconnect', () => {
      console.log('Telemedicine Service disconnected');
    });
  }

  /**
   * Start a new telemedicine session
   */
  async startSession(patientId: string, doctorId: string): Promise<TelemedicineSession> {
    const response = await fetch(`${this.baseUrl}/api/telemedicine/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ patientId, doctorId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to start session: ${response.statusText}`);
    }

    const session = await response.json();
    this.sessions.set(session.sessionId, session);

    return session;
  }

  /**
   * Get all active telemedicine sessions
   */
  async getActiveSessions(patientId: string): Promise<TelemedicineSession[]> {
    const response = await fetch(`${this.baseUrl}/api/telemedicine/active/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch active sessions: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Enable 3D model streaming during the session
   */
  async enable3DIntegration(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/telemedicine/${sessionId}/3d/enable`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to enable 3D integration: ${response.statusText}`);
    }

    const session = this.sessions.get(sessionId);
    if (session) {
      session.3DIntegrationEnabled = true;
      this.sessions.set(sessionId, session);
    }
  }

  /**
   * Start screen sharing in a session
   */
  async startScreenShare(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/telemedicine/${sessionId}/screen-share/start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to start screen sharing: ${response.statusText}`);
    }

    const session = this.sessions.get(sessionId);
    if (session) {
      session.screenSharing = true;
      this.sessions.set(sessionId, session);
    }
  }

  /**
   * End a telemedicine session
   */
  async endSession(sessionId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/telemedicine/${sessionId}/end`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to end session: ${response.statusText}`);
    }

    this.sessions.delete(sessionId);
  }

  /**
   * Subscribe to session updates
   */
  subscribeToSessionUpdates(callback: (session: TelemedicineSession) => void): void {
    this.socket?.on('session_update', callback);
  }

  /**
   * Unsubscribe from session updates
   */
  unsubscribeFromSessionUpdates(callback: (session: TelemedicineSession) => void): void {
    this.socket?.off('session_update', callback);
  }

  /**
   * Manage consultation details and consultants
   */
  async getConsultants(): Promise<Consultant[]> {
    const response = await fetch(`${this.baseUrl}/api/consultants`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch consultants: ${response.statusText}`);
    }

    const consultants = await response.json();
    consultants.forEach((consultant: Consultant) => {
      this.consultants.set(consultant.id, consultant);
    });

    return consultants;
  }

  /**
   * Disconnect from Telemedicine service
   */
  disconnect(): void {
    this.socket?.disconnect();
    this.sessions.clear();
    this.consultants.clear();
  }
}

export const telemedicineService = new TelemedicineService();
export default telemedicineService;

