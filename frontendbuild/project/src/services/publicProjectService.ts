import api from './api';

export interface PublicProject {
  id: number;
  nom: string;
  type: 'route' | 'ecole' | 'hopital' | 'pont' | 'residence' | 'centre-commercial';
  region: string;
  statut: 'EN_COURS' | 'TERMINE' | 'EN_ATTENTE';
  progression: number;
  budget_prevue: number;
  budget_reel: number;
  date_fin_prevue: string;
  latitude: number;
  longitude: number;
}

class PublicProjectService {
  async getPublicProjects(): Promise<PublicProject[]> {
    try {
      const response = await api.get('/projets/public/');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des projets publics:', error);
      // Retourner des données de démonstration en cas d'erreur
      return this.getDemoProjects();
    }
  }

  async getProjectsByRegion(region: string): Promise<PublicProject[]> {
    try {
      const response = await api.get(`/projets/public/?region=${region}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des projets par région:', error);
      return [];
    }
  }

  async getProjectsByType(type: string): Promise<PublicProject[]> {
    try {
      const response = await api.get(`/projets/public/?type=${type}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des projets par type:', error);
      return [];
    }
  }

  // Données de démonstration (vide par défaut)
  private getDemoProjects(): PublicProject[] {
    return [];
  }
}

export default new PublicProjectService(); 