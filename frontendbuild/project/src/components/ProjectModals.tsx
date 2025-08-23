import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, Plus } from 'lucide-react';
import { Project } from '../services/projectService';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (project: Partial<Project>) => Promise<void>;
  project?: Project | null;
  mode: 'create' | 'edit' | 'delete';
}

const ProjectModals: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  mode
}) => {
  const modalRef = React.useRef<HTMLDivElement>(null);

  // Gestion du focus et de l'accessibilité
  React.useEffect(() => {
    if (isOpen && modalRef.current) {
      // Focus sur le premier champ de saisie
      const firstInput = modalRef.current.querySelector('input, textarea, select') as HTMLElement;
      if (firstInput) {
        firstInput.focus();
      }
    }
  }, [isOpen]);

  // Gestion de la touche Escape
  React.useEffect(() => {
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
    nom: project?.nom || '',
    description: project?.description || '',
    date_debut: project?.date_debut ? project.date_debut.split('T')[0] : '',
    date_fin_prevue: project?.date_fin_prevue ? project.date_fin_prevue.split('T')[0] : '',
    budget_prevue: project?.budget_prevue || 0,
    statut: project?.statut || 'EN_ATTENTE',
    // nouveaux champs
    nom_entreprise: project?.nom_entreprise || '',
    region: project?.region || '',
    departement: project?.departement || '',
    etape_actuelle: project?.etape_actuelle || undefined,
    chef_projet: project?.chef_projet || undefined,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (mode === 'delete') {
        await onSubmit({});
      } else {
        await onSubmit({
          ...formData,
          budget_prevue: Number(formData.budget_prevue),
          membres: project?.membres || [],
          chef_projet: formData.chef_projet ? Number(formData.chef_projet) : undefined,
          region: formData.region || undefined,
          departement: formData.departement || undefined,
          etape_actuelle: formData.etape_actuelle || undefined,
        });
      }
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

  const renderCreateModal = () => (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="fixed inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
      <div ref={modalRef} className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto z-[10000]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 id="modal-title" className="text-2xl font-bold text-gray-900">Nouveau Projet</h2>
              <p className="text-sm text-gray-600">Créez un nouveau projet de construction</p>
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
              Nom du projet *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg transition-colors"
              placeholder="Ex: Résidence Les Jardins"
              aria-label="Nom du projet"
              aria-required="true"
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block text-lg font-semibold text-gray-900 mb-3">
              Description du projet
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors resize-none"
              placeholder="Décrivez les détails du projet, les objectifs, les spécifications techniques..."
              aria-label="Description du projet"
            />
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📅 Planning du projet</h3>
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
                  aria-label="Date de début du projet"
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
                  aria-label="Date de fin prévue du projet"
                  aria-required="true"
                />
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Budget et statut</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Budget prévu (XOF)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₣</span>
                  <input
                    type="number"
                    name="budget_prevue"
                    value={formData.budget_prevue}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
                    placeholder="0"
                    aria-label="Budget prévu en francs CFA"
                  />
                </div>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">
                  Statut initial
                </label>
                <select
                  name="statut"
                  value={formData.statut}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
                  aria-label="Statut initial du projet"
                >
                  <option value="EN_ATTENTE">⏳ En attente</option>
                  <option value="EN_COURS">🔄 En cours</option>
                  <option value="TERMINE">✅ Terminé</option>
                  <option value="ANNULE">❌ Annulé</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">👤 Chef de projet et Entreprise</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Chef de projet</label>
                <input
                  type="text"
                  name="chef_projet"
                  value={formData.chef_projet ?? ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
                  placeholder="Ex: Jean Dupont"
                />
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Nom de l’entreprise</label>
                <input
                  type="text"
                  name="nom_entreprise"
                  value={formData.nom_entreprise}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
                  placeholder="Ex: Entreprise ABC"
                />
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">🏗️ Étape actuelle</h3>
            <div>
              <label className="block text-base font-medium text-gray-700 mb-2">
                Étape actuelle du projet
              </label>
              <select
                name="etape_actuelle"
                value={formData.etape_actuelle || ''}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
                aria-label="Étape actuelle du projet"
              >
                <option value="">Sélectionnez une étape</option>
                <option value="PREPARATION">Préparation</option>
                <option value="FONDATIONS">Fondations</option>
                <option value="GROS_OEUVRE">Gros œuvre</option>
                <option value="SECOND_OEUVRE">Second œuvre</option>
                <option value="FINITIONS">Finitions</option>
                <option value="AMENAGEMENT">Aménagement</option>
                <option value="RECEPTION">Réception</option>
              </select>
            </div>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">📍 Localisation</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Région</label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
                >
                  <option value="">Sélectionnez une région</option>
                  <option value="DAKAR">Dakar</option>
                  <option value="THIES">Thiès</option>
                  <option value="DIOURBEL">Diourbel</option>
                  <option value="FATICK">Fatick</option>
                  <option value="KAOLACK">Kaolack</option>
                  <option value="KOLDA">Kolda</option>
                  <option value="LOUGA">Louga</option>
                  <option value="MATAM">Matam</option>
                  <option value="SAINT_LOUIS">Saint-Louis</option>
                  <option value="SEDHIOU">Sédhiou</option>
                  <option value="TAMBACOUNDA">Tambacounda</option>
                  <option value="ZIGUINCHOR">Ziguinchor</option>
                  <option value="KAFFRINE">Kaffrine</option>
                  <option value="KEDOUGOU">Kédougou</option>
                </select>
              </div>
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Département</label>
                <select
                  name="departement"
                  value={formData.departement}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors"
                >
                  <option value="">Sélectionnez un département</option>
                  <option value="DAKAR">Dakar</option>
                  <option value="GUEDIAWAYE">Guédiawaye</option>
                  <option value="PIKINE">Pikine</option>
                  <option value="RUFISQUE">Rufisque</option>
                  <option value="THIES">Thiès</option>
                  <option value="MBOUR">M'bour</option>
                  <option value="TIVAOUANE">Tivaouane</option>
                  <option value="SAINT_LOUIS">Saint-Louis</option>
                  <option value="DAGANA">Dagana</option>
                  <option value="PODOR">Podor</option>
                  <option value="ZIGUINCHOR">Ziguinchor</option>
                  <option value="BIGNONA">Bignona</option>
                  <option value="OUSSOUYE">Oussouye</option>
                  <option value="KAOLACK">Kaolack</option>
                  <option value="GUINGUINEO">Guinguinéo</option>
                  <option value="NIORO">Nioro du Rip</option>
                  <option value="KOLDA">Kolda</option>
                  <option value="MEDINA_YORO_FOULA">Médina Yoro Foulah</option>
                  <option value="VELINGARA">Vélingara</option>
                  <option value="LOUGA">Louga</option>
                  <option value="KEBEMER">Kébémer</option>
                  <option value="LINGUERE">Linguère</option>
                  <option value="MATAM">Matam</option>
                  <option value="KANEL">Kanel</option>
                  <option value="RANEROU">Ranérou</option>
                  <option value="SEDHIOU">Sédhiou</option>
                  <option value="BOUNKILING">Bounkiling</option>
                  <option value="GOUDOMP">Goudomp</option>
                  <option value="TAMBACOUNDA">Tambacounda</option>
                  <option value="BAKEL">Bakel</option>
                  <option value="GOUDIRY">Goudiry</option>
                  <option value="KOUMPENTOUM">Koumpentoum</option>
                  <option value="KAFFRINE">Kaffrine</option>
                  <option value="BIRKILANE">Birkilane</option>
                  <option value="MALEM_HODAR">Malem Hodar</option>
                  <option value="KEDOUGOU">Kédougou</option>
                  <option value="SALEMATA">Salémata</option>
                  <option value="SARAYA">Saraya</option>
                </select>
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
                aria-label="Annuler la création du projet"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 font-medium flex items-center space-x-2"
                aria-label={isLoading ? "Création du projet en cours..." : "Créer le projet"}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Création en cours...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Créer le projet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );

  const renderEditModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black bg-opacity-60" onClick={onClose}></div>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Modifier le Projet</h2>
              <p className="text-sm text-gray-600">Modifiez les informations du projet</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du projet *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                name="date_debut"
                value={formData.date_debut}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin prévue *
              </label>
              <input
                type="date"
                name="date_fin_prevue"
                value={formData.date_fin_prevue}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget prévu (XOF)
            </label>
            <input
              type="number"
              name="budget_prevue"
              value={formData.budget_prevue}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="EN_ATTENTE">En attente</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINE">Terminé</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Modification...' : 'Modifier le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderDeleteModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Supprimer le Projet</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Êtes-vous sûr ?</h3>
              <p className="text-sm text-gray-600">
                Cette action ne peut pas être annulée. Le projet "{project?.nom}" sera définitivement supprimé.
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Suppression...' : 'Supprimer le projet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  switch (mode) {
    case 'create':
      return renderCreateModal();
    case 'edit':
      return renderEditModal();
    case 'delete':
      return renderDeleteModal();
    default:
      return null;
  }
};

export default ProjectModals; 