import React, { useContext, useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';
import { SocketContext } from './contexts/SocketContext';

// Custom hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [, setConnectionState] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');

  useEffect(() => {
    // Only connect if we have a valid API URL and token
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const token = localStorage.getItem('token');
    
    // Don't establish socket connection if no token (user not logged in)
    if (!token) {
      console.log('No token found, skipping socket connection');
      setConnectionState('disconnected');
      return;
    }

    console.log('Attempting socket connection to:', apiUrl);
    
    const newSocket = io(apiUrl, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5, // Reduced attempts
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      maxReconnectionAttempts: 5,
      forceNew: false,
      autoConnect: true,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setConnectionState('connected');
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnectionState('disconnected');
    });

    newSocket.on('connect_error', (error) => {
      console.warn('Socket connection error:', error.message);
      setConnectionState('error');
      
      // Don't spam the console with connection errors
      if (error.message.includes('server') || error.message.includes('ECONNREFUSED')) {
        console.warn('Socket server appears to be unavailable. Some real-time features may not work.');
      }
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      setConnectionState('connected');
    });

    newSocket.on('reconnect_failed', () => {
      console.warn('Socket reconnection failed. Real-time features will be disabled.');
      setConnectionState('error');
    });

    setSocket(newSocket);

    return () => {
      if (newSocket.connected) {
        newSocket.disconnect();
      }
      setSocket(null);
      setConnectionState('disconnected');
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};


