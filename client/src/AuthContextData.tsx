import { createContext, useContext } from "react";

interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: string | null;
  login: (token: string, role: string, userId: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
