import React, { useState, useEffect } from 'react';
import { History, Download, User, Clock, FileText, RotateCcw, Eye } from 'lucide-react';

export interface DocumentVersion {
  id: number;
  document: number;
  version: number;
  fichier: string;
  nom: string;
  auteur: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  date_creation: string;
  modifications?: string;
  taille: number;
}

interface DocumentVersionHistoryProps {
  documentId: number;
  isOpen: boolean;
  onClose: () => void;
  onRestoreVersion?: (versionId: number) => void;
}

const DocumentVersionHistory: React.FC<DocumentVersionHistoryProps> = ({
  documentId,
  isOpen,
  onClose,
  onRestoreVersion
}) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [loading, setLoading] = useState(false);
  // const [selectedVersion, setSelectedVersion] = useState<number | null>(null);

  // Charger l'historique des versions
  const loadVersions = async () => {
    try {
      setLoading(true);
      // Simuler le chargement des versions (à remplacer par l'API réelle)
      const mockVersions: DocumentVersion[] = [
        {
          id: 1,
          document: documentId,
          version: 3,
          fichier: '/documents/projet1/plan_v3.pdf',
          nom: 'Plan architectural v3',
          auteur: {
            id: 2,
            username: 'architecte',
            first_name: 'Marie',
            last_name: 'Laurent'
          },
          date_creation: '2024-01-20T15:30:00Z',
          modifications: 'Ajout des détails de fondation',
          taille: 2457600
        },
        {
          id: 2,
          document: documentId,
          version: 2,
          fichier: '/documents/projet1/plan_v2.pdf',
          nom: 'Plan architectural v2',
          auteur: {
            id: 1,
            username: 'admin',
            first_name: 'Admin',
            last_name: 'System'
          },
          date_creation: '2024-01-18T11:15:00Z',
          modifications: 'Correction des dimensions',
          taille: 2232320
        },
        {
          id: 3,
          document: documentId,
          version: 1,
          fichier: '/documents/projet1/plan_v1.pdf',
          nom: 'Plan architectural v1',
          auteur: {
            id: 3,
            username: 'chef.projet',
            first_name: 'Jean',
            last_name: 'Dupont'
          },
          date_creation: '2024-01-15T09:00:00Z',
          modifications: 'Version initiale',
          taille: 1986560
        }
      ];
      setVersions(mockVersions);
    } catch (error) {
      console.error('Erreur lors du chargement des versions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Télécharger une version spécifique
  const handleDownloadVersion = (version: DocumentVersion) => {
    const link = window.document.createElement('a');
    link.href = version.fichier;
    link.download = `${version.nom}_v${version.version}.pdf`;
    link.target = '_blank';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  // Restaurer une version
  const handleRestoreVersion = (versionId: number) => {
    if (onRestoreVersion) {
      onRestoreVersion(versionId);
    }
    // Ici, on appellerait l'API pour restaurer la version
    console.log('Restauration de la version:', versionId);
  };

  // Prévisualiser une version
  const handlePreviewVersion = (version: DocumentVersion) => {
    // Ouvrir la version dans un nouvel onglet
    window.open(version.fichier, '_blank');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVersionColor = (version: number) => {
    if (version === 1) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (version === Math.max(...versions.map(v => v.version))) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  useEffect(() => {
    if (isOpen && documentId) {
      loadVersions();
    }
  }, [isOpen, documentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9997] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col z-[10000]">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-purple-50">
          <div className="flex items-center space-x-3">
            <History className="h-6 w-6 text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-900">Historique des versions</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Liste des versions */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune version</h3>
              <p className="text-gray-600">L'historique des versions n'est pas encore disponible</p>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    selectedVersion === version.id
                      ? 'border-purple-300 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getVersionColor(version.version)}`}>
                        v{version.version}
                      </span>
                      <div>
                        <div className="font-medium text-gray-900">{version.nom}</div>
                        <div className="text-sm text-gray-600">{formatFileSize(version.taille)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePreviewVersion(version)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Prévisualiser"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadVersion(version)}
                        className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                        title="Télécharger"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {version.version !== Math.max(...versions.map(v => v.version)) && (
                        <button
                          onClick={() => handleRestoreVersion(version.id)}
                          className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Restaurer cette version"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {version.modifications && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-gray-700 mb-1">Modifications:</div>
                      <p className="text-sm text-gray-600">{version.modifications}</p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>
                          {version.auteur.first_name} {version.auteur.last_name}
                        </span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(version.date_creation)}</span>
                      </div>
                    </div>
                    
                    {version.version === Math.max(...versions.map(v => v.version)) && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                        Version actuelle
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pied de page */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>{versions.length} versions au total</span>
            </div>
            <div className="text-xs">
              La restauration d'une version crée une nouvelle version basée sur l'ancienne
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentVersionHistory;
