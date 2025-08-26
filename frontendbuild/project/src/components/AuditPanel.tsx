import React, { useEffect, useState } from 'react';
import { 
  Activity, Filter, Search, Calendar, User, FileText, 
  Download, RefreshCw, Eye, BarChart3, Clock, MapPin,
  TrendingUp, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { Project } from '../services/projectService';
import auditService, { 
  AuditTrail, AuditTrailList, ProjectHistory, UserActivity, SystemOverview 
} from '../services/auditService';

interface Props {
  project: Project | null;
}

const AuditPanel: React.FC<Props> = ({ project }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'project-history' | 'user-activity' | 'system'>('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // États pour les données
  const [auditTrail, setAuditTrail] = useState<AuditTrailList[]>([]);
  const [projectHistory, setProjectHistory] = useState<ProjectHistory | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null);
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  
  // Filtres
  const [filters, setFilters] = useState({
    action: '',
    resource_type: '',
    search: '',
    start_date: '',
    end_date: ''
  });

  // Charger les données selon l'onglet actif
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      switch (activeTab) {
        case 'overview':
          if (project) {
            const history = await auditService.getProjectHistory(project.id);
            setProjectHistory(history);
          }
          break;
        case 'project-history':
          if (project) {
            const history = await auditService.getProjectHistory(project.id);
            setProjectHistory(history);
          }
          break;
        case 'user-activity':
          const activity = await auditService.getUserActivity();
          setUserActivity(activity);
          break;
        case 'system':
          const overview = await auditService.getSystemOverview();
          setSystemOverview(overview);
          break;
      }
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, project?.id]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'CREATE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'UPDATE': return <RefreshCw className="h-4 w-4 text-blue-600" />;
      case 'DELETE': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'UPLOAD': return <FileText className="h-4 w-4 text-purple-600" />;
      case 'DOWNLOAD': return <Download className="h-4 w-4 text-indigo-600" />;
      case 'STATUS_CHANGE': return <TrendingUp className="h-4 w-4 text-orange-600" />;
      case 'LOGIN': return <User className="h-4 w-4 text-green-600" />;
      case 'LOGOUT': return <User className="h-4 w-4 text-gray-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'bg-green-100 text-green-800 border-green-200';
      case 'UPDATE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      case 'UPLOAD': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DOWNLOAD': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'STATUS_CHANGE': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'LOGIN': return 'bg-green-100 text-green-800 border-green-200';
      case 'LOGOUT': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {projectHistory && (
        <>
          {/* Statistiques du projet */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{projectHistory.statistiques.total_actions}</div>
              <div className="text-sm text-blue-800">Actions totales</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{projectHistory.statistiques.recent_activity}</div>
              <div className="text-sm text-green-800">Cette semaine</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {projectHistory.statistiques.actions_by_user.length}
              </div>
              <div className="text-sm text-purple-800">Utilisateurs actifs</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {projectHistory.statistiques.actions_by_resource.length}
              </div>
              <div className="text-sm text-orange-800">Types de ressources</div>
            </div>
          </div>

          {/* Actions par type */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions par type</h3>
            <div className="space-y-3">
              {projectHistory.statistiques.actions_by_type.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getActionIcon(stat.action)}
                    <span className="font-medium text-gray-700">{stat.action}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions récentes */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions récentes</h3>
            <div className="space-y-3">
              {projectHistory.historique_complet.slice(0, 10).map((audit) => (
                <div key={audit.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getActionIcon(audit.action)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(audit.action)}`}>
                      {audit.action_display}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{audit.description}</div>
                    <div className="text-sm text-gray-500">
                      {audit.resource_type} • {audit.user.username}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    <div>{audit.timestamp_formatted}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderProjectHistory = () => (
    <div className="space-y-6">
      {projectHistory && (
        <>
          {/* Historique par type de ressource */}
          {Object.entries(projectHistory.historique_par_type).map(([resourceType, audits]) => (
            <div key={resourceType} className="bg-white rounded-xl border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {resourceType} ({audits.length} actions)
              </h3>
              <div className="space-y-3">
                {audits.map((audit) => (
                  <div key={audit.id} className="border-l-4 border-blue-500 pl-4 py-3">
                    <div className="flex items-center space-x-3 mb-2">
                      {getActionIcon(audit.action)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(audit.action)}`}>
                        {audit.action_display}
                      </span>
                      <span className="text-sm text-gray-500">{audit.timestamp_formatted}</span>
                    </div>
                    <div className="font-medium text-gray-900">{audit.description}</div>
                    <div className="text-sm text-gray-500">
                      Par {audit.user.username} • {audit.resource_name}
                    </div>
                    {audit.changes_summary && audit.changes_summary.length > 0 && (
                      <div className="mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <div className="text-sm font-medium text-blue-800 mb-1">Changements :</div>
                        {audit.changes_summary.map((change, index) => (
                          <div key={index} className="text-xs text-blue-700">
                            <span className="font-medium">{change.field}:</span> {change.before} → {change.after}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const renderUserActivity = () => (
    <div className="space-y-6">
      {userActivity && (
        <>
          {/* Statistiques utilisateur */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{userActivity.statistiques.total}</div>
              <div className="text-sm text-blue-800">Total actions</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{userActivity.statistiques.aujourd_hui}</div>
              <div className="text-sm text-green-800">Aujourd'hui</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{userActivity.statistiques.cette_semaine}</div>
              <div className="text-sm text-purple-800">Cette semaine</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{userActivity.statistiques.ce_mois}</div>
              <div className="text-sm text-orange-800">Ce mois</div>
            </div>
          </div>

          {/* Projets actifs */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Projets actifs</h3>
            <div className="space-y-2">
              {userActivity.projets_actifs.map((projet, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{projet.projet__nom}</span>
                  <span className="text-sm text-gray-500">ID: {projet.projet__id}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activité récente */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
            <div className="space-y-3">
              {userActivity.activite_recente.map((audit) => (
                <div key={audit.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getActionIcon(audit.action)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(audit.action)}`}>
                      {audit.action_display}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{audit.description}</div>
                    <div className="text-sm text-gray-500">
                      {audit.resource_type} • {audit.resource_name}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    <div>{audit.timestamp_formatted}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const renderSystemOverview = () => (
    <div className="space-y-6">
      {systemOverview && (
        <>
          {/* Statistiques globales */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{systemOverview.statistiques_globales.total_actions}</div>
              <div className="text-sm text-blue-800">Total actions</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{systemOverview.statistiques_globales.actions_aujourd_hui}</div>
              <div className="text-sm text-green-800">Aujourd'hui</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{systemOverview.statistiques_globales.actions_cette_semaine}</div>
              <div className="text-sm text-purple-800">Cette semaine</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{systemOverview.statistiques_globales.utilisateurs_actifs}</div>
              <div className="text-sm text-orange-800">Utilisateurs actifs</div>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl font-bold text-indigo-600">{systemOverview.statistiques_globales.projets_actifs}</div>
              <div className="text-sm text-indigo-800">Projets actifs</div>
            </div>
          </div>

          {/* Actions par type */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions par type</h3>
            <div className="space-y-3">
              {systemOverview.actions_par_type.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getActionIcon(stat.action)}
                    <span className="font-medium text-gray-700">{stat.action}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{stat.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Utilisateurs les plus actifs */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Utilisateurs les plus actifs</h3>
            <div className="space-y-3">
              {systemOverview.utilisateurs_plus_actifs.map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                    </div>
                    <span className="font-medium text-gray-700">{user.user__username}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{user.count} actions</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Traçabilité & Audit</h2>
          <p className="text-gray-600">Suivi complet de toutes les actions et modifications</p>
        </div>
        <button 
          onClick={loadData} 
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span>Actualiser</span>
        </button>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'project-history', label: 'Historique projet', icon: Clock, disabled: !project },
              { id: 'user-activity', label: 'Activité utilisateur', icon: User },
              { id: 'system', label: 'Système', icon: Activity }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  disabled={tab.disabled}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
              <span className="ml-3 text-gray-600">Chargement des données...</span>
            </div>
          ) : (
            <>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'project-history' && renderProjectHistory()}
              {activeTab === 'user-activity' && renderUserActivity()}
              {activeTab === 'system' && renderSystemOverview()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuditPanel;







