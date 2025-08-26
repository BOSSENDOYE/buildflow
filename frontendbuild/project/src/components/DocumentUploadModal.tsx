import React, { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Document } from '../services/documentService';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  projectId: number;
  projectName: string;
}

const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  projectName
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<Document['type']>('PLAN');
  const [nom, setNom] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documentTypes = [
    { value: 'PLAN', label: 'Plan', description: 'Plans architecturaux, techniques, etc.' },
    { value: 'CONTRAT', label: 'Contrat', description: 'Contrats, conventions, accords' },
    { value: 'RAPPORT', label: 'Rapport', description: 'Rapports d\'études, d\'avancement' },
    { value: 'PV', label: 'PV de réception', description: 'Procès-verbaux de réception' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        setFile(selectedFile);
        // Auto-remplir le nom si vide
        if (!nom) {
          setNom(selectedFile.name);
        }
        setError('');
      }
    } catch (error) {
      console.error('Erreur lors de la sélection du fichier:', error);
      setError('Erreur lors de la sélection du fichier');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    if (!nom.trim()) {
      setError('Veuillez saisir un nom pour le document');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('projet', projectId.toString());
      formData.append('type', type);
      formData.append('nom', nom.trim());
      formData.append('fichier', file);

      await onSubmit(formData);
      
      // Réinitialiser le formulaire
      setFile(null);
      setNom('');
      setType('PLAN');
      
      // Fermer le modal
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setNom('');
      setType('PLAN');
      setError('');
      onClose();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    try {
      e.preventDefault();
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        setFile(droppedFile);
        if (!nom) {
          setNom(droppedFile.name);
        }
        setError('');
      }
    } catch (error) {
      console.error('Erreur lors du drop:', error);
      setError('Erreur lors du dépôt du fichier');
    }
  };

  const formatFileSize = (bytes: number) => {
    try {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    } catch {
      return 'Taille inconnue';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black bg-opacity-60" onClick={handleClose}></div>
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto z-[10000]">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Ajouter un document</h2>
              <p className="text-sm text-gray-600">Projet : {projectName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenu */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type de document */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de document *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Document['type'])}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={uploading}
              >
                {documentTypes.map(typeOption => (
                  <option key={typeOption.value} value={typeOption.value}>
                    {typeOption.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-sm text-gray-500">
                {documentTypes.find(t => t.value === type)?.description}
              </p>
            </div>

            {/* Nom du document */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du document *
              </label>
              <input
                type="text"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Nom descriptif du document"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={uploading}
              />
            </div>

            {/* Sélection de fichier */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fichier *
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  file 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-2">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-green-900">{file.name}</p>
                      <p className="text-xs text-green-700">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="text-sm text-green-600 hover:text-green-800 underline"
                      disabled={uploading}
                    >
                      Changer de fichier
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Glissez-déposez votre fichier ici
                      </p>
                      <p className="text-xs text-gray-500">ou cliquez pour sélectionner</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Sélectionner un fichier
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar"
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Formats acceptés : PDF, Word, Excel, images, archives (max 50 MB)
              </p>
            </div>

            {/* Message d'erreur */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={uploading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={!file || !nom.trim() || uploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Upload en cours...</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    <span>Ajouter le document</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadModal;
