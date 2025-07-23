import { createContext } from 'react';
import { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
}

export const SocketContext = createContext<SocketContextType | undefined>(undefined);
