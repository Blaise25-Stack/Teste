import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { db } from '../utils/database';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize database with default data
    db.initializeDefaultData();
    
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // Verify user still exists in database and get fresh data
        const users = db.getUsers();
        const existingUser = users.find(u => u.id === parsedUser.id && u.isActive);
        if (existingUser) {
          setUser(existingUser);
          // Update localStorage with fresh user data
          localStorage.setItem('currentUser', JSON.stringify(existingUser));
        } else {
          localStorage.removeItem('currentUser');
        }
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (username: string, password: string): boolean => {
    try {
      // Get fresh user data from database
      const users = db.getUsers();
      console.log('Tentative de connexion:', { username, password });
      console.log('Utilisateurs disponibles:', users.map(u => ({ 
        username: u.username, 
        role: u.role, 
        isActive: u.isActive,
        id: u.id 
      })));
      
      const foundUser = users.find(u => 
        u.username.toLowerCase().trim() === username.toLowerCase().trim() && 
        u.password === password && 
        u.isActive
      );
      
      if (foundUser) {
        console.log('Connexion réussie pour:', foundUser.name);
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
        return true;
      } else {
        console.log('Échec de connexion - utilisateur non trouvé ou inactif');
        return false;
      }
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};