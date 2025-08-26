import api from './api';

export interface AuditTrail {
  id: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'IMPORT' | 'UPLOAD' | 'DOWNLOAD' | 'STATUS_CHANGE' | 'ASSIGNMENT' | 'COMMENT' | 'NOTIFICATION';
  action_display: string;
  timestamp: string;
  timestamp_formatted: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
  resource_type: string;
  resource_type_display: string;
  resource_name: string;
  resource_id: number;
  projet?: {
    id: number;
    nom: string;
    statut: string;
  };
  description: string;
  data_before?: any;
  data_after?: any;
  changes_summary?: Array<{
    field: string;
    before: any;
    after: any;
  }>;
  ip_address?: string;
  user_agent?: string;
  context?: any;
}

export interface AuditTrailList {
  id: number;
  action: string;
  action_display: string;
  timestamp: string;
  timestamp_formatted: string;
  user: string;
  resource_type: string;
  resource_name: string;
  resource_id: number;
  description: string;
}

export interface ProjectHistory {
  projet: {
    id: number;
    nom: string;
    statut: string;
  };
  statistiques: {
    total_actions: number;
    actions_by_type: Array<{ action: string; count: number }>;
    actions_by_resource: Array<{ resource_type: string; count: number }>;
    actions_by_user: Array<{ user__username: string; count: number }>;
    recent_activity: number;
  };
  historique_par_type: { [key: string]: AuditTrail[] };
  historique_complet: AuditTrail[];
}

export interface UserActivity {
  utilisateur: {
    id: number;
    username: string;
  };
  statistiques: {
    aujourd_hui: number;
    cette_semaine: number;
    ce_mois: number;
    total: number;
  };
  actions_par_type: Array<{ action: string; count: number }>;
  projets_actifs: Array<{ projet__nom: string; projet__id: number }>;
  activite_recente: AuditTrailList[];
}

export interface SystemOverview {
  statistiques_globales: {
    total_actions: number;
    actions_aujourd_hui: number;
    actions_cette_semaine: number;
    utilisateurs_actifs: number;
    projets_actifs: number;
  };
  actions_par_type: Array<{ action: string; count: number }>;
  activite_par_ressource: Array<{ resource_type: string; count: number }>;
  utilisateurs_plus_actifs: Array<{ user__username: string; count: number }>;
}

export interface AuditFilters {
  action?: string;
  resource_type?: string;
  user?: number;
  projet?: number;
  start_date?: string;
  end_date?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}

class AuditService {
  // Récupérer la liste des audits avec filtres
  async getAuditTrail(filters: AuditFilters = {}): Promise<{
    count: number;
    next: string | null;
    previous: string | null;
    results: AuditTrailList[];
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/audit-trail/?${params.toString()}`);
    return response.data;
  }

  // Récupérer l'historique complet d'un projet
  async getProjectHistory(projectId: number): Promise<ProjectHistory> {
    const response = await api.get(`/audit-trail/project_history/?projet_id=${projectId}`);
    return response.data;
  }

  // Récupérer l'activité d'un utilisateur
  async getUserActivity(userId?: number): Promise<UserActivity> {
    const params = userId ? `?user_id=${userId}` : '';
    const response = await api.get(`/audit-trail/user_activity/${params}`);
    return response.data;
  }

  // Récupérer la vue d'ensemble du système (admin seulement)
  async getSystemOverview(): Promise<SystemOverview> {
    const response = await api.get('/audit-trail/system_overview/');
    return response.data;
  }

  // Exporter les données d'audit (admin seulement)
  async exportAuditData(filters: {
    start_date?: string;
    end_date?: string;
    action?: string;
    resource_type?: string;
  } = {}): Promise<{
    message: string;
    total_records: number;
    filtres_appliques: any;
    donnees: any[];
  }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/audit-trail/export_audit/?${params.toString()}`);
    return response.data;
  }

  // Récupérer un audit spécifique
  async getAuditTrailDetail(auditId: number): Promise<AuditTrail> {
    const response = await api.get(`/audit-trail/${auditId}/`);
    return response.data;
  }

  // Récupérer les statistiques d'audit pour un projet
  async getProjectAuditStats(projectId: number): Promise<{
    total_actions: number;
    actions_by_type: Array<{ action: string; count: number }>;
    actions_by_user: Array<{ user__username: string; count: number }>;
    recent_activity: number;
  }> {
    const history = await this.getProjectHistory(projectId);
    return history.statistiques;
  }

  // Récupérer les actions récentes pour un projet
  async getRecentProjectActivity(projectId: number, limit: number = 10): Promise<AuditTrail[]> {
    const history = await this.getProjectHistory(projectId);
    return history.historique_complet.slice(0, limit);
  }

  // Récupérer les actions par type pour un projet
  async getProjectActionsByType(projectId: number): Promise<{ [key: string]: AuditTrail[] }> {
    const history = await this.getProjectHistory(projectId);
    return history.historique_par_type;
  }

  // Récupérer les actions d'un utilisateur sur un projet spécifique
  async getUserProjectActivity(userId: number, projectId: number): Promise<AuditTrail[]> {
    const filters: AuditFilters = {
      user: userId,
      projet: projectId,
      ordering: '-timestamp'
    };
    
    const result = await this.getAuditTrail(filters);
    return result.results as any;
  }

  // Récupérer les actions de connexion/déconnexion d'un utilisateur
  async getUserLoginLogoutActivity(userId: number, days: number = 30): Promise<AuditTrail[]> {
    const filters: AuditFilters = {
      user: userId,
      action: 'LOGIN,LOGOUT',
      ordering: '-timestamp'
    };
    
    const result = await this.getAuditTrail(filters);
    return result.results as any;
  }

  // Récupérer les actions de modification sur un projet
  async getProjectModifications(projectId: number): Promise<AuditTrail[]> {
    const filters: AuditFilters = {
      projet: projectId,
      action: 'UPDATE',
      ordering: '-timestamp'
    };
    
    const result = await this.getAuditTrail(filters);
    return result.results as any;
  }

  // Récupérer les actions de création sur un projet
  async getProjectCreations(projectId: number): Promise<AuditTrail[]> {
    const filters: AuditFilters = {
      projet: projectId,
      action: 'CREATE',
      ordering: '-timestamp'
    };
    
    const result = await this.getAuditTrail(filters);
    return result.results as any;
  }

  // Récupérer les actions de suppression sur un projet
  async getProjectDeletions(projectId: number): Promise<AuditTrail[]> {
    const filters: AuditFilters = {
      projet: projectId,
      action: 'DELETE',
      ordering: '-timestamp'
    };
    
    const result = await this.getAuditTrail(filters);
    return result.results as any;
  }

  // Récupérer les actions d'upload de documents sur un projet
  async getProjectDocumentUploads(projectId: number): Promise<AuditTrail[]> {
    const filters: AuditFilters = {
      projet: projectId,
      action: 'UPLOAD',
      ordering: '-timestamp'
    };
    
    const result = await this.getAuditTrail(filters);
    return result.results as any;
  }

  // Récupérer les changements de statut sur un projet
  async getProjectStatusChanges(projectId: number): Promise<AuditTrail[]> {
    const filters: AuditFilters = {
      projet: projectId,
      action: 'STATUS_CHANGE',
      ordering: '-timestamp'
    };
    
    const result = await this.getAuditTrail(filters);
    return result.results as any;
  }
}

export default new AuditService();

