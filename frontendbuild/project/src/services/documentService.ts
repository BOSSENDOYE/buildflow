import api from './api';

export interface Document {
  id: number;
  projet: number;
  type: 'PLAN' | 'CONTRAT' | 'RAPPORT' | 'PV';
  nom: string;
  fichier: string;
  date_upload: string;
  auteur?: number;
}

export interface ProjectExport {
  projet: {
    id: number;
    nom: string;
    description: string;
    date_debut: string;
    date_fin_prevue: string;
    date_fin_reelle?: string;
    statut: string;
    budget_prevue?: number;
    budget_reel?: number;
    nom_entreprise?: string;
    region?: string;
    departement?: string;
    etape_actuelle?: string;
    date_creation: string;
    date_modification: string;
  };
  chef_projet?: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role?: string;
    telephone?: string;
  };
  membres: Array<{
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    role?: string;
    telephone?: string;
  }>;
  phases: Array<{
    id: number;
    nom: string;
    description: string;
    date_debut: string;
    date_fin_prevue: string;
    date_fin_reelle?: string;
    statut: string;
    ordre: number;
  }>;
  actions: Array<{
    id: number;
    titre: string;
    description: string;
    statut: string;
    priorite: number;
    phase?: string;
    responsable?: string;
    date_debut?: string;
    date_fin_prevue?: string;
    date_fin_reelle?: string;
  }>;
  risques: Array<{
    id: number;
    nom: string;
    description: string;
    niveau: string;
    probabilite: number;
    impact: string;
    mesures_mitigation: string;
    date_identification: string;
    date_resolution?: string;
    responsable?: string;
  }>;
  budgets: Array<{
    id: number;
    type: string;
    montant: number;
    description: string;
    date: string;
  }>;
  commentaires: Array<{
    id: number;
    auteur: string;
    contenu: string;
    date_creation: string;
    date_modification: string;
  }>;
  documents: Array<{
    id: number;
    type: string;
    nom: string;
    date_upload: string;
    auteur?: string;
  }>;
  statistiques: {
    total_phases: number;
    phases_terminees: number;
    phases_en_cours: number;
    phases_en_attente: number;
    total_actions: number;
    actions_terminees: number;
    total_risques: number;
    risques_critiques: number;
    total_documents: number;
    total_commentaires: number;
  };
}

class DocumentService {
  // Récupérer tous les documents
  async getDocuments(): Promise<Document[]> {
    const response = await api.get('/documents/');
    return response.data.results || response.data;
  }

  // Récupérer les documents d'un projet spécifique
  async getProjectDocuments(projectId: number): Promise<{ projet: any; documents: Document[]; total_documents: number }> {
    const response = await api.get(`/documents/projet/${projectId}/`);
    return response.data;
  }

  // Créer un nouveau document
  async createDocument(documentData: FormData): Promise<Document> {
    const response = await api.post('/documents/', documentData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // Mettre à jour un document
  async updateDocument(id: number, documentData: Partial<Document>): Promise<Document> {
    const response = await api.put(`/documents/${id}/`, documentData);
    return response.data;
  }

  // Supprimer un document
  async deleteDocument(id: number): Promise<void> {
    await api.delete(`/documents/${id}/`);
  }

  // Récupérer les types de documents disponibles
  async getDocumentTypes(): Promise<string[]> {
    const response = await api.get('/documents/types/');
    return response.data.types;
  }

  // Récupérer les statistiques des documents
  async getDocumentStats(): Promise<{ total_documents: number; documents_par_type: Record<string, number> }> {
    const response = await api.get('/documents/statistiques/');
    return response.data;
  }

  // Exporter un projet complet
  async exportProject(projectId: number): Promise<Blob> {
    const response = await api.get(`/documents/export-projet/${projectId}/`, {
      responseType: 'blob',
    });
    return response.data;
  }

  // Télécharger l'export d'un projet
  async downloadProjectExport(projectId: number, projectName: string): Promise<void> {
    try {
      const blob = await this.exportProject(projectId);
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `projet_${projectName.replace(/\s+/g, '_')}_export.zip`;
      
      // Déclencher le téléchargement
      document.body.appendChild(a);
      a.click();
      
      // Nettoyer
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      throw new Error('Impossible de télécharger l\'export du projet');
    }
  }

  // Upload de document avec gestion de la progression
  async uploadDocumentWithProgress(
    projectId: number, 
    file: File, 
    type: string, 
    nom?: string,
    onProgress?: (progress: number) => void
  ): Promise<Document> {
    const formData = new FormData();
    formData.append('projet', projectId.toString());
    formData.append('type', type);
    formData.append('fichier', file);
    if (nom) {
      formData.append('nom', nom);
    }

    const response = await api.post('/documents/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  // Recherche avancée de documents
  async searchDocuments(query: string, filters?: {
    type?: string;
    projet?: number;
    auteur?: number;
    date_debut?: string;
    date_fin?: string;
  }): Promise<Document[]> {
    const params = new URLSearchParams();
    params.append('search', query);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    const response = await api.get(`/documents/?${params.toString()}`);
    return response.data.results || response.data;
  }

  // Récupérer les documents récents
  async getRecentDocuments(limit: number = 10): Promise<Document[]> {
    const response = await api.get(`/documents/?ordering=-date_upload&page_size=${limit}`);
    return response.data.results || response.data;
  }

  // Récupérer les documents par type
  async getDocumentsByType(type: string): Promise<Document[]> {
    const response = await api.get(`/documents/?type=${type}`);
    return response.data.results || response.data;
  }

  // Récupérer les documents d'un auteur spécifique
  async getDocumentsByAuthor(authorId: number): Promise<Document[]> {
    const response = await api.get(`/documents/?auteur=${authorId}`);
    return response.data.results || response.data;
  }
}

export default new DocumentService();

