import api from './api';

export interface Project {
  id: number;
  nom: string;
  description: string;
  date_debut: string;
  date_fin_prevue: string;
  date_fin_reelle?: string;
  statut: 'EN_COURS' | 'TERMINE' | 'EN_ATTENTE' | 'ANNULE';
  budget_prevue?: number;
  budget_reel?: number;
  chef_projet?: number;
  membres: number[];
  // Nouveaux champs
  nom_entreprise?: string;
  region?: string;
  departement?: string;
  etape_actuelle?: 'PREPARATION' | 'FONDATIONS' | 'GROS_OEUVRE' | 'SECOND_OEUVRE' | 'FINITIONS' | 'AMENAGEMENT' | 'RECEPTION' | '';
  date_creation: string;
  date_modification: string;
}

export interface Phase {
  id: number;
  projet: number;
  nom: string;
  description: string;
  date_debut: string;
  date_fin_prevue: string;
  date_fin_reelle?: string;
  statut: 'EN_COURS' | 'TERMINEE' | 'EN_ATTENTE';
  ordre: number;
  responsable?: string;
  responsable_telephone?: string;
}

export interface Action {
  id: number;
  projet: number;
  phase?: number;
  titre: string;
  description: string;
  statut: 'A_FAIRE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  responsable?: number;
  date_debut?: string;
  date_fin_prevue?: string;
  date_fin_reelle?: string;
  priorite: number;
}

export interface Risk {
  id: number;
  projet: number;
  nom: string;
  description: string;
  niveau: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';
  probabilite: number;
  impact: string;
  mesures_mitigation: string;
  date_identification: string;
  date_resolution?: string;
  responsable?: number;
}

export interface Budget {
  id: number;
  projet: number;
  type: 'PREVU' | 'REEL' | 'AJUSTEMENT';
  montant: number;
  description: string;
  date: string;
}

export interface Comment {
  id: number;
  projet: number;
  auteur: number;
  contenu: string;
  date_creation: string;
  date_modification: string;
}

class ProjectService {
  // Projects
  async getProjects(): Promise<Project[]> {
    const response = await api.get('/projets/');
    return response.data.results || response.data;
  }

  async getProject(id: number): Promise<Project> {
    const response = await api.get(`/projets/${id}/`);
    return response.data;
  }

  async createProject(project: Partial<Project>): Promise<Project> {
    const response = await api.post('/projets/', project);
    return response.data;
  }

  async updateProject(id: number, project: Partial<Project>): Promise<Project> {
    const response = await api.put(`/projets/${id}/`, project);
    return response.data;
  }

  async deleteProject(id: number): Promise<void> {
    await api.delete(`/projets/${id}/`);
  }

  // Phases
  async getPhases(projectId: number): Promise<Phase[]> {
    const response = await api.get(`/phases/?projet=${projectId}`);
    return response.data.results || response.data;
  }

  async getProjectPhases(projectId: number): Promise<{
    projet: { id: number; nom: string; statut: string };
    statistiques: {
      total_phases: number;
      completed_phases: number;
      in_progress_phases: number;
      pending_phases: number;
      progression: number;
    };
    phases: Phase[];
  }> {
    const response = await api.get(`/phases/project_phases/?projet_id=${projectId}`);
    return response.data;
  }

  async createPhase(phase: Partial<Phase>): Promise<Phase> {
    const response = await api.post('/phases/', phase);
    return response.data;
  }

  async updatePhase(id: number, phase: Partial<Phase>): Promise<Phase> {
    const response = await api.put(`/phases/${id}/`, phase);
    return response.data;
  }

  async deletePhase(id: number): Promise<void> {
    await api.delete(`/phases/${id}/`);
  }

  async changePhaseStatus(phaseId: number, newStatus: string): Promise<{
    message: string;
    phase: Phase;
  }> {
    const response = await api.post(`/phases/${phaseId}/change_status/`, {
      statut: newStatus
    });
    return response.data;
  }

  async reorderPhases(projectId: number, phasesOrder: Array<{ id: number; ordre: number }>): Promise<{
    message: string;
    phases: Phase[];
  }> {
    const response = await api.post('/phases/reorder_phases/', {
      projet_id: projectId,
      phases_order: phasesOrder
    });
    return response.data;
  }

  // Actions
  async getActions(projectId: number): Promise<Action[]> {
    const response = await api.get(`/actions/?projet=${projectId}`);
    return response.data.results || response.data;
  }

  async createAction(action: Partial<Action>): Promise<Action> {
    const response = await api.post('/actions/', action);
    return response.data;
  }

  async updateAction(id: number, action: Partial<Action>): Promise<Action> {
    const response = await api.put(`/actions/${id}/`, action);
    return response.data;
  }

  async deleteAction(id: number): Promise<void> {
    await api.delete(`/actions/${id}/`);
  }

  // Risks
  async getRisks(projectId: number): Promise<Risk[]> {
    const response = await api.get(`/risques/?projet=${projectId}`);
    return response.data.results || response.data;
  }

  async createRisk(risk: Partial<Risk>): Promise<Risk> {
    const response = await api.post('/risques/', risk);
    return response.data;
  }

  async updateRisk(id: number, risk: Partial<Risk>): Promise<Risk> {
    const response = await api.put(`/risques/${id}/`, risk);
    return response.data;
  }

  async deleteRisk(id: number): Promise<void> {
    await api.delete(`/risques/${id}/`);
  }

  // Budgets
  async getBudgets(projectId: number): Promise<Budget[]> {
    const response = await api.get(`/budgets/?projet=${projectId}`);
    return response.data.results || response.data;
  }

  async createBudget(budget: Partial<Budget>): Promise<Budget> {
    const response = await api.post('/budgets/', budget);
    return response.data;
  }

  async updateBudget(id: number, budget: Partial<Budget>): Promise<Budget> {
    const response = await api.put(`/budgets/${id}/`, budget);
    return response.data;
  }

  async deleteBudget(id: number): Promise<void> {
    await api.delete(`/budgets/${id}/`);
  }

  // Comments
  async getComments(projectId: number): Promise<Comment[]> {
    const response = await api.get(`/commentaires/?projet=${projectId}`);
    return response.data.results || response.data;
  }

  async createComment(comment: Partial<Comment>): Promise<Comment> {
    const response = await api.post('/commentaires/', comment);
    return response.data;
  }

  async updateComment(id: number, comment: Partial<Comment>): Promise<Comment> {
    const response = await api.put(`/commentaires/${id}/`, comment);
    return response.data;
  }

  async deleteComment(id: number): Promise<void> {
    await api.delete(`/commentaires/${id}/`);
  }
}

export default new ProjectService(); 