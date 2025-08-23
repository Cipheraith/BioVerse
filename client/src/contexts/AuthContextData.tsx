import React, { createContext } from 'react';

interface User {
  id: string;
  username?: string;
  fullName?: string;
  role: string;
}

interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string, role: string, userId: string, userData?: Partial<User>) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
