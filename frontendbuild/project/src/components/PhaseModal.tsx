import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { Phase } from '../services/projectService';

interface PhaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (phase: Partial<Phase>) => Promise<void>;
  projectId: number;
  phase?: Phase | null;
  mode: 'create' | 'edit';
}

const PhaseModal: React.FC<PhaseModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  projectId,
  phase,
  mode
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Gestion du focus et de l'accessibilité
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus sur le premier champ de saisie
      const firstInput = modalRef.current.querySelector('input, textarea, select') as HTMLElement;
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [isOpen]);

  // Gestion de la touche Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const [formData, setFormData] = useState({
    nom: phase?.nom || '',
    description: phase?.description || '',
    date_debut: phase?.date_debut ? phase.date_debut.split('T')[0] : '',
    date_fin_prevue: phase?.date_fin_prevue ? phase.date_fin_prevue.split('T')[0] : '',
    statut: phase?.statut || 'EN_ATTENTE',
    ordre: phase?.ordre || 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await onSubmit({
        ...formData,
        projet: projectId,
        ordre: Number(formData.ordre),
      });
      onClose();
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="phase-modal-title">
      <div className="fixed inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
      <div ref={modalRef} className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto z-[10000]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 id="phase-modal-title" className="text-2xl font-bold text-gray-900">
                {mode === 'create' ? 'Nouvelle Phase' : 'Modifier la Phase'}
              </h2>
              <p className="text-sm text-gray-600">
                {mode === 'create' ? 'Créez une nouvelle phase pour le projet' : 'Modifiez les informations de la phase'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Nom de la phase *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-colors"
              placeholder="Ex: Préparation du terrain"
              aria-label="Nom de la phase"
              aria-required="true"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Description de la phase
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors resize-none"
              placeholder="Décrivez les détails de cette phase, les objectifs, les spécifications techniques..."
              aria-label="Description de la phase"
            />
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Planning de la phase</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Date de début *
                </label>
                <input
                  type="date"
                  name="date_debut"
                  value={formData.date_debut}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
                  aria-label="Date de début de la phase"
                  aria-required="true"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Date de fin prévue *
                </label>
                <input
                  type="date"
                  name="date_fin_prevue"
                  value={formData.date_fin_prevue}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
                  aria-label="Date de fin prévue de la phase"
                  aria-required="true"
                />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Statut et ordre</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Statut de la phase
                </label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
                  aria-label="Statut de la phase"
                >
                  <option value="EN_ATTENTE">⏳ En attente</option>
                  <option value="EN_COURS">🔄 En cours</option>
                  <option value="TERMINEE">✅ Terminée</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Ordre d'exécution
                </label>
                <input
                  type="number"
                  name="ordre"
                  value={formData.ordre}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
                  placeholder="0"
                  aria-label="Ordre d'exécution de la phase"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-base font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              * Champs obligatoires
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                aria-label="Annuler"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 font-medium flex items-center space-x-2"
                aria-label={isLoading ? "En cours..." : mode === 'create' ? "Créer la phase" : "Modifier la phase"}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>En cours...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>{mode === 'create' ? 'Créer la phase' : 'Modifier la phase'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhaseModal;
