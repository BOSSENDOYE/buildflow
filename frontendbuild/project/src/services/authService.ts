import api from './api';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profilutilisateur?: {
    id: number;
    role: 'GESTIONNAIRE' | 'ADMINISTRATEUR' | 'CONSULTANT';
    permissions?: {
      peut_creer_projet: boolean;
      peut_modifier_projet: boolean;
      peut_supprimer_projet: boolean;
      peut_gerer_utilisateurs: boolean;
      peut_voir_analytics: boolean;
      peut_exporter_donnees: boolean;
    };
  };
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: UserProfile;
}

export interface UserPermissions {
  peut_creer_projet: boolean;
  peut_modifier_projet: boolean;
  peut_supprimer_projet: boolean;
  peut_gerer_utilisateurs: boolean;
  peut_voir_analytics: boolean;
  peut_exporter_donnees: boolean;
}

export interface RoleInfo {
  id: number;
  name: string;
  permissions: UserPermissions;
}

export interface RoleDetails {
  display: string;
  description: string;
  permissions: string[];
  features: string[];
}

// Forme normalisée pour l'IU
export interface RoleOption {
  id: number;
  name: string;
  permissions: UserPermissions;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

export interface UpdateRoleResponse {
  success: boolean;
  message: string;
  user?: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post('/token/', credentials);
      const { access, refresh } = response.data;
      
      // Store tokens
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      
      // Get current user profile (endpoint dédié)
      const userResponse = await api.get('/users/profils/me/');
      const user = userResponse.data;
      
      return {
        access,
        refresh,
        user: {
          id: user.utilisateur.id,
          username: user.utilisateur.username,
          email: user.utilisateur.email,
          first_name: user.utilisateur.first_name,
          last_name: user.utilisateur.last_name,
          profilutilisateur: {
            id: user.id,
            role: user.role,
            permissions: user.permissions,
          },
        },
      };
    } catch {
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_profile');
  }

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return null;

      const response = await api.get('/users/profils/me/');
      const user = response.data;
      
      return {
        id: user.utilisateur.id,
        username: user.utilisateur.username,
        email: user.utilisateur.email,
        first_name: user.utilisateur.first_name,
        last_name: user.utilisateur.last_name,
        profilutilisateur: {
          id: user.id,
          role: user.role,
          permissions: user.permissions,
        },
      };
    } catch {
      return null;
    }
  }

  async getUserPermissions(): Promise<UserPermissions> {
    try {
      const response = await api.get('/users/permissions/');
      return response.data.profil.permissions;
    } catch (error) {
      console.error('Error fetching permissions:', error);
      // Retourner des permissions par défaut en cas d'erreur
      return {
        peut_creer_projet: false,
        peut_modifier_projet: false,
        peut_supprimer_projet: false,
        peut_gerer_utilisateurs: false,
        peut_voir_analytics: true,
        peut_exporter_donnees: false,
      };
    }
  }

  async getRolesInfo(): Promise<Record<string, RoleDetails>> {
    try {
      const response = await api.get('/users/roles/');
      return response.data;
    } catch (error) {
      console.error('Error fetching roles info:', error);
      return {} as Record<string, RoleDetails>;
    }
  }

  async getRolesOptions(): Promise<RoleOption[]> {
    try {
      const data = await this.getRolesInfo();
      const rolesArray: RoleOption[] = Object.keys(data).map((name, index) => {
        const role = data[name];
        const perms = new Set(role.permissions);
        return {
          id: index + 1,
          name,
          permissions: {
            peut_creer_projet: perms.has('peut_creer_projet'),
            peut_modifier_projet: perms.has('peut_modifier_projet'),
            peut_supprimer_projet: perms.has('peut_supprimer_projet'),
            peut_gerer_utilisateurs: perms.has('peut_gerer_utilisateurs'),
            peut_voir_analytics: perms.has('peut_voir_analytics'),
            peut_exporter_donnees: perms.has('peut_exporter_donnees'),
          }
        };
      });
      return rolesArray;
    } catch (error) {
      console.error('Error building roles options:', error);
      return [];
    }
  }

  async listAllUsers(): Promise<User[]> {
    try {
      const response = await api.get('/users/users/');
      const apiUsers = response.data as Array<{
        id: number;
        username: string;
        email: string;
        first_name: string;
        last_name: string;
        role: string;
        actif?: boolean;
      }>;
      return apiUsers.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        role: u.role,
        is_active: u.actif ?? true,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async updateUserRole(userId: number, newRole: string): Promise<UpdateRoleResponse> {
    try {
      const response = await api.put(`/users/users/${userId}/role/`, {
        role: newRole
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  async createUser(params: { username: string; email: string; first_name?: string; last_name?: string; password: string; role: string }): Promise<User> {
    const response = await api.post('/users/users/create/', params);
    const u = response.data;
    return {
      id: u.id,
      username: u.username,
      email: u.email,
      first_name: u.first_name,
      last_name: u.last_name,
      role: u.role,
      is_active: u.actif ?? true,
    };
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  async register(credentials: { username: string; password: string; email: string; first_name: string; last_name: string; role: string }): Promise<AuthResponse> {
    try {
      // Register the user
      const response = await api.post('/users/register/', credentials);
      const { tokens, user } = response.data;

      // Store tokens
      localStorage.setItem('access_token', tokens.access);
      localStorage.setItem('refresh_token', tokens.refresh);

      return {
        access: tokens.access,
        refresh: tokens.refresh,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          profilutilisateur: {
            id: user.profilutilisateur.id,
            role: user.profilutilisateur.role,
            permissions: user.profilutilisateur.permissions,
          },
        },
      };
    } catch {
      throw new Error('Registration failed. Please check your information.');
    }
  }
}

export default new AuthService(); 
