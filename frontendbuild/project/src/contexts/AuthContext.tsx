import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService, { UserProfile, LoginCredentials } from '../services/authService';

interface UserPermissions {
  peut_creer_projet: boolean;
  peut_modifier_projet: boolean;
  peut_supprimer_projet: boolean;
  peut_gerer_utilisateurs: boolean;
  peut_voir_analytics: boolean;
  peut_exporter_donnees: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  permissions: UserPermissions | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  hasRole: (role: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      if (AuthService.isAuthenticated()) {
        const currentUser = await AuthService.getCurrentUser();
        setUser(currentUser);
        
        // Récupérer les permissions
        const userPermissions = await AuthService.getUserPermissions();
        setPermissions(userPermissions);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setPermissions(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(credentials);
      setUser(response.user);
      
      // Récupérer les permissions après connexion
      const userPermissions = await AuthService.getUserPermissions();
      setPermissions(userPermissions);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setPermissions(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    if (!permissions) return false;
    return permissions[permission] || false;
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.profilutilisateur?.role === role;
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    permissions,
    login,
    logout,
    checkAuth,
    hasPermission,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 