import React, { useState, useEffect } from 'react';
import { Building2, Users, Calendar, TrendingUp, FileText, AlertTriangle, CheckCircle2, Clock, DollarSign, Menu, X, Bell, Search, Plus, Filter, Download, Eye, Edit, Trash2, Settings, LogOut, Shield, Zap, Brain, Target, BarChart3, Activity, Lightbulb, ArrowRight, Globe } from 'lucide-react';
import ProjectPhasesView from './ProjectPhasesView';
import DocumentsPanel from './DocumentsPanel';
import AuditPanel from './AuditPanel';
import PredictionsPanel from './PredictionsPanel';
import AnalyticsPanel from './AnalyticsPanel';
import { useAuth } from '../contexts/AuthContext';
import projectService, { Project } from '../services/projectService';
import authService from '../services/authService';
import ProjectModals from './ProjectModals';
import UserProfileManager from './UserProfileManager';
import UserSettings from './UserSettings';
import NotificationsModal from './NotificationsModal';

interface Alert {
  id: number;
  type: 'retard' | 'depassement' | 'anomalie' | 'risque';
  titre: string;
  description: string;
  projet: string;
  date: string;
  priorite: 'faible' | 'moyenne' | 'elevee' | 'critique';
  isRead: boolean;
}

interface Recommendation {
  id: number;
  type: 'optimisation' | 'risque' | 'efficacite' | 'budget';
  titre: string;
  description: string;
  impact: 'faible' | 'moyen' | 'eleve';
  projet?: string;
  date: string;
}

const mockAlerts: Alert[] = [];
const mockRecommendations: Recommendation[] = [];

const PrivateDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<'dashboard' | 'projects' | 'phases' | 'documents' | 'analytics' | 'users' | 'audit'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [recommendations, setRecommendations] = useState<Recommendation[]>(mockRecommendations);
  const [isLoading, setIsLoading] = useState(true);
  const [userPermissions, setUserPermissions] = useState<any>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  


  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Charger les permissions utilisateur
        const permissions = await authService.getUserPermissions();
        setUserPermissions(permissions);
        
        // Charger les projets
        const projectsData = await projectService.getProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error('Error loading data:', error);
        // En cas d'erreur, on garde les listes vides mais on restaure des permissions par défaut
        setProjects([]);
        // Permissions par défaut pour permettre l'utilisation de l'interface
        const defaultPermissions = {
          peut_creer_projet: true,
          peut_modifier_projet: true,
          peut_supprimer_projet: false,
          peut_gerer_utilisateurs: false,
          peut_voir_analytics: true,
          peut_exporter_donnees: true,
        };
        setUserPermissions(defaultPermissions);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'TERMINE': return 'bg-green-100 text-green-800 border-green-200';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ANNULE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminé';
      case 'EN_ATTENTE': return 'En attente';
      case 'ANNULE': return 'Annulé';
      default: return statut;
    }
  };

  const getAlertColor = (priorite: string) => {
    switch (priorite) {
      case 'critique': return 'bg-red-100 text-red-800 border-red-200';
      case 'elevee': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moyenne': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'faible': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRecommendationColor = (impact: string) => {
    switch (impact) {
      case 'eleve': return 'bg-green-100 text-green-800 border-green-200';
      case 'moyen': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'faible': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const unreadAlerts = alerts.filter(a => !a.isRead);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCreateProjectClick = () => {
    if (userPermissions?.peut_creer_projet) {
      setShowCreateModal(true);
    } else {
      alert('Vous n\'avez pas les permissions pour créer un projet.');
    }
  };

  const handleEditProjectClick = (project: Project) => {
    if (userPermissions?.peut_modifier_projet) {
      setSelectedProject(project);
      setShowEditModal(true);
    } else {
      alert('Vous n\'avez pas les permissions pour modifier ce projet.');
    }
  };

  const handleDeleteProjectClick = (project: Project) => {
    if (userPermissions?.peut_supprimer_projet) {
      setSelectedProject(project);
      setShowDeleteModal(true);
    } else {
      alert('Vous n\'avez pas les permissions pour supprimer ce projet.');
    }
  };

  const handleViewProject = (project: Project) => {
    setSelectedProject(project);
    setActiveView('phases');
  };

  const handleExportData = () => {
    if (userPermissions?.peut_exporter_donnees) {
      // Logique d'export des données
      console.log('Export des données...');
      
      // Créer un fichier CSV avec les données des projets
      const csvContent = [
        ['Nom', 'Description', 'Statut', 'Budget Réel', 'Budget Prévu', 'Date de fin'],
        ...projects.map(project => [
          project.nom,
          project.description,
          project.statut,
          project.budget_reel?.toString() || '0',
          project.budget_prevue?.toString() || '0',
          project.date_fin_prevue
        ])
      ].map(row => row.join(',')).join('\n');
      
      // Créer et télécharger le fichier
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `projets_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Export terminé avec succès !');
    } else {
      alert('Vous n\'avez pas les permissions pour exporter les données.');
    }
  };

  const handleSettingsClick = () => {
    setShowSettingsModal(true);
  };

  const handleNotificationsClick = () => {
    setShowNotificationsModal(true);
  };

  const handleMarkAlertAsRead = (alertId: number) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const handleViewAllProjects = () => {
    // Navigation vers la page des projets
    setActiveView('projects');
  };

  const handleCreateProject = async (projectData: Partial<Project>) => {
    try {
      const newProject = await projectService.createProject(projectData);
      setProjects(prev => [...prev, newProject]);
      setShowCreateModal(false);
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const handleEditProject = async (projectData: Partial<Project>) => {
    if (!selectedProject) return;
    
    try {
      const updatedProject = await projectService.updateProject(selectedProject.id, projectData);
      setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p));
      setShowEditModal(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;
    
    try {
      await projectService.deleteProject(selectedProject.id);
      setProjects(prev => prev.filter(p => p.id !== selectedProject.id));
      setShowDeleteModal(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  };

  const renderDashboard = () => (
    <div className="space-y-8">
      {/* En-tête personnalisé */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tableau de Bord Personnel</h1>
          <p className="text-gray-600 mt-2">
            Bonjour {user?.first_name || user?.username || 'Utilisateur'}, voici un aperçu de vos projets
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          {userPermissions?.peut_creer_projet && (
            <button 
              onClick={handleCreateProjectClick}
              className="bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors font-medium flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau Projet</span>
            </button>
          )}

          {userPermissions?.peut_exporter_donnees && (
            <button 
              onClick={handleExportData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exporter</span>
            </button>
          )}
        </div>
      </div>

      {/* Alertes critiques */}
      {unreadAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-red-800">Alertes Requérant Attention</h2>
          </div>
          <div className="space-y-3">
            {unreadAlerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-red-200">
                <div className="flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${
                    alert.priorite === 'critique' ? 'bg-red-500' :
                    alert.priorite === 'elevee' ? 'bg-orange-500' :
                    alert.priorite === 'moyenne' ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{alert.titre}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAlertColor(alert.priorite)}`}>
                      {alert.priorite}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Projet: {alert.projet} • {formatDate(alert.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques personnalisées */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mes Projets</p>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alertes Non Lues</p>
              <p className="text-2xl font-bold text-gray-900">{unreadAlerts.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projets en Cours</p>
              <p className="text-2xl font-bold text-gray-900">
                {projects.filter(p => p.statut === 'EN_COURS').length}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(projects.reduce((sum, p) => sum + (p.budget_reel || 0), 0))}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Projets et recommandations IA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Projets */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Mes Projets</h3>
            <button 
              onClick={handleViewAllProjects}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Voir tous
            </button>
          </div>
          <div className="space-y-4">
            {projects.slice(0, 3).map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{project.nom}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.statut)}`}>
                    {getStatusText(project.statut)}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Budget</span>
                    <span className="font-medium">{formatCurrency(project.budget_reel || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Date de fin</span>
                    <span className="font-medium">{formatDate(project.date_fin_prevue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommandations IA */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-900">Recommandations IA</h3>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Voir toutes
            </button>
          </div>
          <div className="space-y-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div key={rec.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{rec.titre}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRecommendationColor(rec.impact)}`}>
                    {rec.impact}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  {rec.projet && <span>Projet: {rec.projet}</span>}
                  <span>{formatDate(rec.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Activité Récente</h3>
        <div className="space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
            <Activity className="h-5 w-5 text-blue-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Nouveau projet créé</p>
              <p className="text-xs text-gray-600">Projet "Résidence Les Jardins" ajouté au système</p>
            </div>
            <span className="text-xs text-gray-500">Il y a 2h</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Phase terminée</p>
              <p className="text-xs text-gray-600">Phase "Fondations" du projet Centre Commercial Le Forum</p>
            </div>
            <span className="text-xs text-gray-500">Il y a 4h</span>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Alerte générée</p>
              <p className="text-xs text-gray-600">Retard détecté sur le projet Pont de la Rivière</p>
            </div>
            <span className="text-xs text-gray-500">Il y a 6h</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Projets</h1>
          <p className="text-gray-600 mt-2">Gérez vos projets de construction</p>
        </div>
        {userPermissions?.peut_creer_projet && (
                      <button 
              onClick={handleCreateProjectClick}
              className="mt-4 sm:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau Projet</span>
            </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un projet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Tous les statuts</option>
                <option value="EN_COURS">En cours</option>
                <option value="EN_ATTENTE">En attente</option>
                <option value="TERMINE">Terminé</option>
              </select>
              <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Projet</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Statut</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Budget</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Échéance</th>
                <th className="text-left py-3 px-6 font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <div className="font-medium text-gray-900">{project.nom}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{project.description}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.statut)}`}>
                      {getStatusText(project.statut)}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-900 font-medium">{formatCurrency(project.budget_reel || 0)}</div>
                    <div className="text-xs text-gray-500">/ {formatCurrency(project.budget_prevue || 0)}</div>
                  </td>
                  <td className="py-4 px-6 text-gray-900">{formatDate(project.date_fin_prevue)}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleViewProject(project)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                        title="Voir le projet"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {userPermissions?.peut_modifier_projet && (
                        <button 
                          onClick={() => handleEditProjectClick(project)}
                          className="text-gray-600 hover:text-gray-800 p-1 rounded transition-colors"
                          title="Modifier le projet"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      {userPermissions?.peut_supprimer_projet && (
                        <button 
                          onClick={() => handleDeleteProjectClick(project)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                          title="Supprimer le projet"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard': return renderDashboard();
      case 'projects': return renderProjects();
      case 'phases': return <ProjectPhasesView projectId={selectedProject?.id ?? null} />;
      case 'documents': return <DocumentsPanel project={selectedProject || projects[0] || null} />;
      case 'audit': return <AuditPanel project={selectedProject || projects[0] || null} />;
      case 'analytics': return userPermissions?.peut_voir_analytics ? (
        <>
          <AnalyticsPanel project={selectedProject || projects[0] || null} />
          <div className="mt-8" />
          <PredictionsPanel project={selectedProject || projects[0] || null} />
        </>
      ) : <div>Vous n'avez pas accès aux analytics.</div>;
      case 'users': {
        const isAdminRole = user?.profilutilisateur?.role === 'ADMINISTRATEUR';
        const canManageUsers = userPermissions?.peut_gerer_utilisateurs || isAdminRole;
        return canManageUsers ? <UserProfileManager /> : <div>Vous n'avez pas accès à la gestion des utilisateurs.</div>;
      }
      default: return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50
          w-80 max-w-full
          bg-white border-r border-gray-200
          transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:inset-0
        `}
        style={{ width: '20rem', minWidth: '20rem' }}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <img src="/logo.jpg" alt="BuildFlow Logo" className="h-8 w-auto" />
            <span className="text-xl font-bold text-gray-900">BuildFlow</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {[
              { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
              { id: 'projects', label: 'Mes Projets', icon: Building2 },
              { id: 'phases', label: 'Phases', icon: Calendar },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'audit', label: 'Traçabilité', icon: Shield },
              ...(userPermissions?.peut_voir_analytics ? [{ id: 'analytics', label: 'Analytics', icon: BarChart3 }] : []),
              ...((userPermissions?.peut_gerer_utilisateurs || user?.profilutilisateur?.role === 'ADMINISTRATEUR')
                ? [{ id: 'users', label: 'Utilisateurs', icon: Users }]
                : [])
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id as any)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeView === id
                    ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {label}
              </button>
            ))}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.first_name?.[0] || user?.username?.[0] || 'U'}
              </span>
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-900">
                {user?.first_name && user?.last_name 
                  ? `${user.first_name} ${user.last_name}`
                  : user?.username || 'Utilisateur'
                }
              </div>
              <div className="text-xs text-gray-500">
                {user?.profilutilisateur?.role || 'Utilisateur'}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={handleSettingsClick}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Paramètres"
              >
                <Settings className="h-4 w-4" />
              </button>

              <button 
                onClick={handleLogout}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Se déconnecter"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`
          flex-1 min-w-0
          ${sidebarOpen ? 'lg:ml-80' : ''}
          transition-all duration-300 ease-in-out
        `}
        style={{ marginLeft: sidebarOpen ? undefined : 0 }}
      >
        {/* Mobile Topbar */}
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <img src="/logo.jpg" alt="BuildFlow Logo" className="h-6 w-auto" />
            <span className="text-lg font-bold text-gray-900">BuildFlow</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={handleNotificationsClick}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadAlerts.length}
                </span>
              )}
            </button>
            <div className="w-8"></div>
          </div>
        </div>

        {/* Contenu principal */}
        <main className="p-4 lg:p-8 transition-all duration-300 ease-in-out">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-50 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
          aria-label="Fermer le menu"
        ></div>
      )}

      {/* Modales */}
      <ProjectModals
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProject}
        mode="create"
      />
      
      <ProjectModals
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProject(null);
        }}
        onSubmit={handleEditProject}
        project={selectedProject}
        mode="edit"
      />
      
      <ProjectModals
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProject(null);
        }}
        onSubmit={handleDeleteProject}
        project={selectedProject}
        mode="delete"
      />
      
      <UserSettings
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
      
      <NotificationsModal
        isOpen={showNotificationsModal}
        onClose={() => setShowNotificationsModal(false)}
        alerts={alerts}
        onMarkAsRead={handleMarkAlertAsRead}
      />
    </div>
  );
};

export default PrivateDashboard; 