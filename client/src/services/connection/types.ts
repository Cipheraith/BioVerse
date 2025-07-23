/**
 * Connection status enum representing different states of connection
 */
export enum ConnectionStatus {
  CONNECTED = 'connected',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting'
}

/**
 * Connection state interface representing the current state of connection
 */
export interface ConnectionState {
  status: ConnectionStatus;
  lastConnected: Date | null;
  reconnectAttempts: number;
  error?: Error;
}

/**
 * API request configuration extending Axios request config
 */
export interface ApiRequestConfig {
  retryOnFailure?: boolean;
  maxRetries?: number;
  priority?: 'high' | 'normal' | 'low';
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * API response interface
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
}

/**
 * API error interface
 */
export interface ApiError {
  status: number;
  message: string;
  code?: string;
  details?: unknown;
}

/**
 * Socket options interface
 */
export interface SocketOptions {
  autoReconnect: boolean;
  reconnectAttempts: number;
  reconnectDelay: number;
  maxReconnectDelay: number;
}

/**
 * Socket event interface
 */
export interface SocketEvent {
  id: string;
  type: string;
  payload: unknown;
  timestamp: number;
}

/**
 * Queued request interface for offline request queueing
 */
export interface QueuedRequest {
  id: string;
  timestamp: Date;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  data?: unknown;
  headers: Record<string, string>;
  priority: 'high' | 'normal' | 'low';
  retryCount: number;
  maxRetries: number;
  lastRetry?: Date;
}

/**
 * Connection metrics interface for tracking connection quality
 */
export interface ConnectionMetrics {
  uptime: number; // Percentage
  disconnectionCount: number;
  averageLatency: number;
  lastDowntime?: {
    start: Date;
    end: Date;
    duration: number; // milliseconds
  };
}

/**
 * Connection event interface for tracking connection events
 */
export interface ConnectionEvent {
  id: string;
  timestamp: Date;
  type: 'connected' | 'disconnected' | 'reconnecting' | 'reconnected' | 'failed';
  duration?: number; // For disconnection events
  error?: {
    code: string;
    message: string;
  };
}