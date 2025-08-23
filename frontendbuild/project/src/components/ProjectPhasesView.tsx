import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw } from 'lucide-react';
import projectService, { Phase } from '../services/projectService';
import GanttChart from './GanttChart';
import PhaseModal from './PhaseModal';

interface Props {
  projectId: number | null;
}

const ProjectPhasesView: React.FC<Props> = ({ projectId }) => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const load = async () => {
    if (!projectId) { setPhases([]); return; }
    try {
      setLoading(true);
      setError('');
      const list = await projectService.getPhases(projectId);
      setPhases(list);
    } catch {
      setError("Impossible de charger les phases.");
      setPhases([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePhase = async (phaseData: Partial<Phase>) => {
    try {
      const newPhase = await projectService.createPhase(phaseData);
      setPhases(prev => [...prev, newPhase]);
    } catch {
      throw new Error("Erreur lors de la creation de la phase");
    }
  };

  const handleUpdatePhase = async (phaseData: Partial<Phase>) => {
    if (!editingPhase) return;
    try {
      const updatedPhase = await projectService.updatePhase(editingPhase.id, phaseData);
      setPhases(prev => prev.map(p => p.id === editingPhase.id ? updatedPhase : p));
    } catch {
      throw new Error("Erreur lors de la modification de la phase");
    }
  };

  const handleDeletePhase = async (phaseId: number) => {
    if (!confirm('Etes-vous sur de vouloir supprimer cette phase ?')) return;
    try {
      await projectService.deletePhase(phaseId);
      setPhases(prev => prev.filter(p => p.id !== phaseId));
    } catch {
      setError("Erreur lors de la suppression de la phase");
    }
  };

  const openCreateModal = () => {
    setEditingPhase(null);
    setModalMode('create');
    setIsPhaseModalOpen(true);
  };

  const openEditModal = (phase: Phase) => {
    setEditingPhase(phase);
    setModalMode('edit');
    setIsPhaseModalOpen(true);
  };

  const handlePhaseSubmit = async (phaseData: Partial<Phase>) => {
    if (modalMode === 'create') {
      await handleCreatePhase(phaseData);
    } else {
      await handleUpdatePhase(phaseData);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [projectId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestion des Phases</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={load}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Rafraichir</span>
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!projectId}
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Phase</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Chargement des phases...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-5 text-red-600">⚠️</div>
            <p className="text-base font-medium text-red-800">{error}</p>
          </div>
        </div>
      )}

      {!loading && phases.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <div className="text-gray-400 mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune phase creee</h3>
          <p className="text-gray-600 mb-4">Commencez par creer votre premiere phase pour ce projet.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={!projectId}
          >
            Creer une phase
          </button>
        </div>
      )}

      {!loading && phases.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-gray-50 border-b">
              <div className="font-semibold text-gray-700">Nom</div>
              <div className="font-semibold text-gray-700">Statut</div>
              <div className="font-semibold text-gray-700">Date debut</div>
              <div className="font-semibold text-gray-700">Date fin prevue</div>
              <div className="font-semibold text-gray-700 text-center">Actions</div>
            </div>
            {phases.map((phase) => (
              <div key={phase.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50">
                <div className="font-medium text-gray-900">{phase.nom}</div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    phase.statut === 'TERMINEE' ? 'bg-green-100 text-green-800' :
                    phase.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {phase.statut === 'TERMINEE' ? '✅ Terminee' :
                     phase.statut === 'EN_COURS' ? '🔄 En cours' : '⏳ En attente'}
                  </span>
                </div>
                <div className="text-gray-600">{new Date(phase.date_debut).toLocaleDateString()}</div>
            <div className="text-gray-600">{new Date(phase.date_fin_prevue).toLocaleDateString()}</div>
                <div className="flex items-center justify-center space-x-2">
                  <button
                    onClick={() => openEditModal(phase)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Modifier la phase"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeletePhase(phase.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Supprimer la phase"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Diagramme de Gantt</h3>
            <GanttChart phases={phases} />
          </div>
        </div>
      )}

      {projectId && (
        <PhaseModal
          isOpen={isPhaseModalOpen}
          onClose={() => setIsPhaseModalOpen(false)}
          onSubmit={handlePhaseSubmit}
          projectId={projectId}
          phase={editingPhase}
          mode={modalMode}
        />
      )}
    </div>
  );
};

export default ProjectPhasesView;
