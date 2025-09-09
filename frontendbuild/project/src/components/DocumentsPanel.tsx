import React, { useState, useEffect } from 'react';
import { 
  FileText, Upload, Download, Trash2, Eye, 
  Search, Filter, FolderOpen, Archive, 
  Calendar, User, AlertCircle, ChevronDown,
  MessageSquare, History
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import projectService, { Project } from '../services/projectService';
import documentService, { Document } from '../services/documentService';
import DocumentUploadModal from './DocumentUploadModal';
import DocumentPreviewModal from './DocumentPreviewModal';
import DocumentComments from './DocumentComments';
import DocumentVersionHistory from './DocumentVersionHistory';

interface Props {
  project: Project | null;
  allProjects?: Project[]; // Ajouter cette prop
}

const DocumentsPanel: React.FC<Props> = ({ project: initialProject, allProjects: initialAllProjects = [] }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { user } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(initialProject);
  const [allProjects, setAllProjects] = useState<Project[]>(initialAllProjects);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [uploading, setUploading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const documentTypes = [
    { value: 'PLAN', label: 'Plan', icon: FileText, color: 'text-blue-600' },
    { value: 'CONTRAT', label: 'Contrat', icon: FileText, color: 'text-green-600' },
    { value: 'RAPPORT', label: 'Rapport', icon: FileText, color: 'text-purple-600' },
    { value: 'PV', label: 'PV de réception', icon: FileText, color: 'text-orange-600' },
  ];

  // Charger tous les projets disponibles seulement si pas déjà fournis
  const loadAllProjects = async () => {
    // Si on a déjà des projets, ne pas recharger
    if (initialAllProjects.length > 0) {
      setAllProjects(initialAllProjects);
      return;
    }
    
    try {
      setProjectsLoading(true);
      const response = await projectService.getProjects();
      console.log('Réponse du service projets:', response);
      // La méthode getProjects retourne directement un tableau de projets
      const projects = Array.isArray(response) ? response : [];
      console.log('Projets chargés:', projects);
      setAllProjects(projects);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      setError("Impossible de charger la liste des projets.");
    } finally {
      setProjectsLoading(false);
    }
  };

  const loadDocuments = async () => {
    if (!selectedProject) return;
    
    try {
      setLoading(true);
      setError('');
      const response = await documentService.getProjectDocuments(selectedProject.id);
      setDocuments(response.documents);
    } catch (error) {
      console.error('Erreur lors du chargement des documents:', error);
      setError("Impossible de charger les documents.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportProject = async () => {
    if (!selectedProject) return;
    
    try {
      setExporting(true);
      setError('');
      
      await documentService.downloadProjectExport(selectedProject.id, selectedProject.nom);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      setError(`Erreur lors de l'export: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setExporting(false);
    }
  };

  const handleUploadDocument = async (formData: FormData) => {
    if (!selectedProject) return;
    
    try {
      setUploading(true);
      setError('');
      
      await documentService.createDocument(formData);
      
      // Recharger les documents
      await loadDocuments();
    } catch (error) {
      console.error('Erreur lors de l\'upload du document:', error);
      setError("Erreur lors de l'upload du document.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) return;
    
    try {
      await documentService.deleteDocument(documentId);
      
      // Recharger les documents
      await loadDocuments();
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error);
      setError("Erreur lors de la suppression du document.");
    }
  };

  const handleProjectChange = (project: Project) => {
    setSelectedProject(project);
    setShowProjectSelector(false);
    setSearchTerm('');
    setFilterType('');
      setError('');
  };

  const handleOpenComments = (document: Document) => {
    setSelectedDocument(document);
    setIsCommentsOpen(true);
  };

  const handleOpenVersionHistory = (document: Document) => {
    setSelectedDocument(document);
    setIsVersionHistoryOpen(true);
  };

  const handleOpenPreview = (document: Document) => {
    setSelectedDocument(document);
    setIsPreviewOpen(true);
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || doc.type === filterType;
    return matchesSearch && matchesType;
  });

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'N/A';
      return date.toLocaleDateString('fr-FR');
    } catch {
      return 'N/A';
    }
  };

  const formatBudget = (budget: string | number | null | undefined) => {
    try {
      if (!budget) return 'N/A';
      const num = Number(budget);
      if (isNaN(num)) return 'N/A';
      return `${num.toLocaleString()} €`;
    } catch {
      return 'N/A';
    }
  };

  const safeOpenFile = (fileUrl: string, fileName: string) => {
    try {
      if (!fileUrl) return;
      
      // Créer un lien de téléchargement sécurisé
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Erreur lors de l\'ouverture du fichier:', error);
    }
  };

  useEffect(() => {
    loadAllProjects();
  }, []);

  useEffect(() => {
    console.log('Projets dans le state:', allProjects);
  }, [allProjects]);

  useEffect(() => {
    if (initialProject && !selectedProject) {
      setSelectedProject(initialProject);
    }
  }, [initialProject]);

  useEffect(() => {
    if (selectedProject) {
      loadDocuments();
    }
  }, [selectedProject]);

  if (!selectedProject) {
    return (
      <div className="space-y-6">
        {/* Sélecteur de projet principal */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="text-center">
            <FolderOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez un projet</h3>
            <p className="text-gray-600 mb-4">Choisissez un projet pour gérer ses documents</p>
            
            <div className="relative inline-block text-left">
              <button
                onClick={() => setShowProjectSelector(!showProjectSelector)}
                className="inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Choisir un projet
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {showProjectSelector && (
                <div className="absolute right-0 w-80 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    {projectsLoading ? (
                      <div className="px-4 py-2 text-sm text-gray-500">Chargement des projets...</div>
                    ) : allProjects.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">Aucun projet disponible</div>
                    ) : (
                      allProjects.map((project) => (
                        <button
                          key={project.id}
                          onClick={() => handleProjectChange(project)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                        >
                          <div className="font-medium">{project.nom}</div>
                          <div className="text-xs text-gray-500">{project.description}</div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Sélecteur de projet */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowProjectSelector(!showProjectSelector)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="font-medium">{selectedProject.nom}</span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </button>

              {showProjectSelector && (
                <div className="absolute left-0 w-80 mt-2 origin-top-left bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    {allProjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => handleProjectChange(project)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                          project.id === selectedProject.id 
                            ? 'bg-blue-50 text-blue-700 font-medium' 
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        <div className="font-medium">{project.nom}</div>
                        <div className="text-xs text-gray-500">{project.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-gray-500">•</span>
            <span className="text-sm text-gray-600">Gestion des documents</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowProjectSelector(!showProjectSelector)}
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Changer de projet
            </button>
          </div>
        </div>
      </div>

      {/* En-tête avec informations du projet */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedProject.nom || 'Projet sans nom'}</h1>
            <p className="text-gray-600 mt-2">{selectedProject.description || 'Aucune description'}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleExportProject}
              disabled={exporting}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {exporting ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Archive className="h-4 w-4" />
              )}
              <span>{exporting ? 'Export en cours...' : 'Exporter le projet'}</span>
            </button>
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Ajouter un document</span>
            </button>
          </div>
        </div>
        
        {/* Statistiques du projet */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{(selectedProject as { phases?: unknown[] })?.phases?.length || 0}</div>
            <div className="text-sm text-blue-800">Phases</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{documents.length}</div>
            <div className="text-sm text-green-800">Documents</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {formatBudget(selectedProject.budget_prevue)}
            </div>
            <div className="text-sm text-purple-800">Budget prévu</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{selectedProject.statut || 'N/A'}</div>
            <div className="text-sm text-orange-800">Statut</div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les types</option>
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
          </select>
            <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>
        </div>

      {/* Liste des documents */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Documents du projet</h3>
        </div>
        
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Chargement des documents...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg m-6 p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-base font-medium text-red-800">{error}</p>
            </div>
          </div>
        )}

        {!loading && filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun document trouvé</h3>
            <p className="text-gray-600 mb-4">
              {documents.length === 0 
                ? "Ce projet n'a pas encore de documents. Commencez par en ajouter un."
                : "Aucun document ne correspond à vos critères de recherche."
              }
            </p>
            {documents.length === 0 && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Ajouter le premier document
              </button>
            )}
          </div>
        )}

        {!loading && filteredDocuments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Document</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Type</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Auteur</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900">Date</th>
                  <th className="text-left py-3 px-6 font-medium text-gray-900 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
                {filteredDocuments.map((document) => {
                  const docType = documentTypes.find(t => t.value === document.type);
                  return (
                    <tr key={document.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{document.nom || 'Sans nom'}</div>
                            <div className="text-sm text-gray-500">{document.fichier || 'Fichier non spécifié'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {docType && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <docType.icon className={`h-3 w-3 mr-1 ${docType.color}`} />
                            {docType.label}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{document.auteur || 'Anonyme'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{formatDate(document.date_upload)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleOpenComments(document)}
                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                            title="Commentaires"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenVersionHistory(document)}
                            className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
                            title="Historique des versions"
                          >
                            <History className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenPreview(document)}
                            className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                            title="Prévisualiser"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => safeOpenFile(document.fichier, document.nom)}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                            title="Télécharger"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteDocument(document.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                </td>
              </tr>
                  );
                })}
          </tbody>
        </table>
      </div>
        )}
      </div>

      {/* Modal d'upload */}
      <DocumentUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleUploadDocument}
        projectId={selectedProject.id}
        projectName={selectedProject.nom || 'Projet'}
      />

      {/* Modal des commentaires */}
      <DocumentComments
        documentId={selectedDocument?.id || 0}
        isOpen={isCommentsOpen}
        onClose={() => setIsCommentsOpen(false)}
      />

      {/* Modal de l'historique des versions */}
      <DocumentVersionHistory
        documentId={selectedDocument?.id || 0}
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
      />

      {/* Modal de prévisualisation */}
      <DocumentPreviewModal
        document={selectedDocument}
        documents={documents}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </div>
  );
};

export default DocumentsPanel;







