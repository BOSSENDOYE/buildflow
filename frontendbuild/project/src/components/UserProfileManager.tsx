import React, { useState, useEffect } from 'react';
import { Users, Shield, Settings, Edit, Trash2, Plus, X, CheckCircle, AlertTriangle } from 'lucide-react';
import authService from '../services/authService';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

interface Role {
  id: number;
  name: string;
  permissions: {
    peut_creer_projet: boolean;
    peut_modifier_projet: boolean;
    peut_supprimer_projet: boolean;
    peut_gerer_utilisateurs: boolean;
    peut_voir_analytics: boolean;
    peut_exporter_donnees: boolean;
  };
}

const UserProfileManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Charger les utilisateurs et rôles
      const [usersData, rolesData] = await Promise.all([
        authService.listAllUsers(),
        authService.getRolesInfo()
      ]);
      
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      console.error('Error loading data:', error);
      // Données de test
      setUsers([
        {
          id: 1,
          username: 'admin',
          email: 'admin@buildflow.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'ADMINISTRATEUR',
          is_active: true
        },
        {
          id: 2,
          username: 'gestionnaire',
          email: 'gestionnaire@buildflow.com',
          first_name: 'Gestionnaire',
          last_name: 'Projet',
          role: 'GESTIONNAIRE',
          is_active: true
        },
        {
          id: 3,
          username: 'consultant',
          email: 'consultant@buildflow.com',
          first_name: 'Consultant',
          last_name: 'Tech',
          role: 'CONSULTANT',
          is_active: true
        }
      ]);
      
      setRoles([
        {
          id: 1,
          name: 'ADMINISTRATEUR',
          permissions: {
            peut_creer_projet: true,
            peut_modifier_projet: true,
            peut_supprimer_projet: true,
            peut_gerer_utilisateurs: true,
            peut_voir_analytics: true,
            peut_exporter_donnees: true,
          }
        },
        {
          id: 2,
          name: 'GESTIONNAIRE',
          permissions: {
            peut_creer_projet: true,
            peut_modifier_projet: true,
            peut_supprimer_projet: false,
            peut_gerer_utilisateurs: false,
            peut_voir_analytics: true,
            peut_exporter_donnees: true,
          }
        },
        {
          id: 3,
          name: 'CONSULTANT',
          permissions: {
            peut_creer_projet: false,
            peut_modifier_projet: false,
            peut_supprimer_projet: false,
            peut_gerer_utilisateurs: false,
            peut_voir_analytics: true,
            peut_exporter_donnees: false,
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await authService.updateUserRole(userId, newRole);
      
      // Mettre à jour la liste des utilisateurs
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      setShowRoleModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      setError('Erreur lors de la mise à jour du rôle');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMINISTRATEUR': return 'bg-red-100 text-red-800 border-red-200';
      case 'GESTIONNAIRE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CONSULTANT': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRolePermissions = (roleName: string) => {
    const role = roles.find(r => r.name === roleName);
    return role?.permissions || {};
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
          <p className="text-gray-600 mt-2">Gérez les profils et permissions des utilisateurs</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Nouvel Utilisateur</span>
        </button>
      </div>

      {/* Statistiques des rôles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                  <p className="text-sm text-gray-600">
                    {users.filter(u => u.role === role.name).length} utilisateur(s)
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-700">
                  {Object.values(role.permissions).filter(Boolean).length} permissions actives
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Liste des utilisateurs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Utilisateurs</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Utilisateur</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Rôle</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Permissions</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => {
                const permissions = getRolePermissions(user.role);
                return (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-wrap gap-1">
                        {permissions.peut_creer_projet && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Créer</span>
                        )}
                        {permissions.peut_modifier_projet && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Modifier</span>
                        )}
                        {permissions.peut_supprimer_projet && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Supprimer</span>
                        )}
                        {permissions.peut_gerer_utilisateurs && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Gérer Users</span>
                        )}
                        {permissions.peut_voir_analytics && (
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Analytics</span>
                        )}
                        {permissions.peut_exporter_donnees && (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded">Exporter</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <span className="text-sm text-gray-600">
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => {
                            setSelectedUser(user);
                            setShowRoleModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                          title="Modifier le rôle"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors">
                          <Settings className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modale de changement de rôle */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRoleModal(false)}></div>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Modifier le Rôle</h2>
              <button onClick={() => setShowRoleModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Modifier le rôle de <strong>{selectedUser.first_name} {selectedUser.last_name}</strong>
                </p>
                <p className="text-sm text-gray-500">Rôle actuel: {selectedUser.role}</p>
              </div>

              <div className="space-y-3">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => handleRoleChange(selectedUser.id, role.name)}
                    className={`w-full p-3 text-left rounded-lg border transition-colors ${
                      selectedUser.role === role.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{role.name}</div>
                        <div className="text-sm text-gray-600">
                          {Object.values(role.permissions).filter(Boolean).length} permissions
                        </div>
                      </div>
                      {selectedUser.role === role.name && (
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileManager; 