import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Image, File, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { Document } from '../services/documentService';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  documents: Document[];
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
  isOpen,
  onClose,
  document,
  documents
}) => {
  const [currentDocumentIndex, setCurrentDocumentIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (document && documents.length > 0) {
      const index = documents.findIndex(doc => doc.id === document.id);
      if (index !== -1) {
        setCurrentDocumentIndex(index);
      }
    }
  }, [document, documents]);

  const currentDoc = documents[currentDocumentIndex];

  const handlePrevious = () => {
    if (currentDocumentIndex > 0) {
      setCurrentDocumentIndex(prev => prev - 1);
      resetView();
    }
  };

  const handleNext = () => {
    if (currentDocumentIndex < documents.length - 1) {
      setCurrentDocumentIndex(prev => prev + 1);
      resetView();
    }
  };

  const resetView = () => {
    setZoomLevel(1);
    setRotation(0);
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = () => {
    if (currentDoc?.fichier) {
      const link = window.document.createElement('a');
      link.href = currentDoc.fichier;
      link.download = currentDoc.nom || 'document';
      link.target = '_blank';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-16 w-16 text-red-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <Image className="h-16 w-16 text-blue-600" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-16 w-16 text-blue-600" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-16 w-16 text-green-600" />;
      default:
        return <File className="h-16 w-16 text-gray-600" />;
    }
  };

  const isImageFile = (fileName: string) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
    const extension = fileName?.split('.').pop()?.toLowerCase();
    return extension ? imageExtensions.includes(extension) : false;
  };

  const isPdfFile = (fileName: string) => {
    const extension = fileName?.split('.').pop()?.toLowerCase();
    return extension === 'pdf';
  };

  if (!isOpen || !currentDoc) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black bg-opacity-75" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col z-[10000]">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <button
              onClick={handlePrevious}
              disabled={currentDocumentIndex === 0}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <button
              onClick={handleNext}
              disabled={currentDocumentIndex === documents.length - 1}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            
            <div className="ml-4">
              <h2 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                {currentDoc.nom || 'Document sans nom'}
              </h2>
              <p className="text-sm text-gray-600">
                {currentDocumentIndex + 1} sur {documents.length} • {currentDoc.fichier?.split('/').pop()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Contrôles de zoom et rotation */}
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom arrière"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            
            <span className="text-sm text-gray-600">
              {Math.round(zoomLevel * 100)}%
            </span>
            
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom avant"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleRotate}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              title="Rotation"
            >
              <RotateCw className="h-4 w-4" />
            </button>
            
            <button
              onClick={handleDownload}
              className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
              title="Télécharger"
            >
              <Download className="h-4 w-4" />
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center bg-gray-100">
          {loading && (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}
          
          {!loading && currentDoc.fichier && (
            <div className="max-w-full max-h-full">
              {isImageFile(currentDoc.fichier) ? (
                <img
                  src={currentDoc.fichier}
                  alt={currentDoc.nom || 'Document'}
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                    transition: 'transform 0.2s ease-in-out'
                  }}
                  onLoad={() => setLoading(false)}
                  onError={() => setLoading(false)}
                />
              ) : isPdfFile(currentDoc.fichier) ? (
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-gray-200">
                  <FileText className="h-24 w-24 text-red-600 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Fichier PDF</p>
                  <p className="text-sm text-gray-600 mb-4">
                    La prévisualisation des PDF n'est pas encore disponible
                  </p>
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Télécharger le PDF</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 bg-white rounded-lg border border-gray-200">
                  {getFileIcon(currentDoc.fichier)}
                  <p className="text-lg font-medium text-gray-900 mt-4 mb-2">
                    {currentDoc.nom || 'Document'}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    Prévisualisation non disponible pour ce type de fichier
                  </p>
                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span>Télécharger le fichier</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Pied de page avec informations */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Type: </span>
              <span className="text-gray-600">{currentDoc.type}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Date d'upload: </span>
              <span className="text-gray-600">
                {new Date(currentDoc.date_upload).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Auteur: </span>
              <span className="text-gray-600">{currentDoc.auteur || 'Non spécifié'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
