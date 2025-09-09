import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, RefreshCw, BarChart3, Calendar, CheckCircle, Clock, AlertCircle, ArrowUpDown, User as UserIcon, Phone } from 'lucide-react';
import projectService, { Phase } from '../services/projectService';
import GanttChart from './GanttChart';
import PhaseModal from './PhaseModal';
import PhaseReorderModal from './PhaseReorderModal';

interface Props {
  projectId: number | null;
}

interface ProjectPhasesData {
  projet: { id: number; nom: string; statut: string };
  statistiques: {
    total_phases: number;
    completed_phases: number;
    in_progress_phases: number;
    pending_phases: number;
    progression: number;
  };
  phases: Phase[];
}

const ProjectPhasesView: React.FC<Props> = ({ projectId }) => {
  const [phasesData, setPhasesData] = useState<ProjectPhasesData | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isPhaseModalOpen, setIsPhaseModalOpen] = useState(false);
  const [editingPhase, setEditingPhase] = useState<Phase | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isReordering, setIsReordering] = useState(false);
  const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);

  const load = async () => {
    if (!projectId) { 
      setPhases([]); 
      setPhasesData(null);
      return; 
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Charger les données complètes des phases du projet
      const data = await projectService.getProjectPhases(projectId);
      setPhasesData(data);
      setPhases(data.phases);
    } catch {
      setError("Impossible de charger les phases.");
      setPhases([]);
      setPhasesData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePhase = async (phaseData: Partial<Phase>) => {
    try {
      const newPhase = await projectService.createPhase(phaseData);
      setPhases(prev => [...prev, newPhase]);
      // Recharger les données pour mettre à jour les statistiques
      await load();
    } catch {
      throw new Error("Erreur lors de la creation de la phase");
    }
  };

  const handleUpdatePhase = async (phaseData: Partial<Phase>) => {
    if (!editingPhase) return;
    try {
      const updatedPhase = await projectService.updatePhase(editingPhase.id, phaseData);
      setPhases(prev => prev.map(p => p.id === editingPhase.id ? updatedPhase : p));
      // Recharger les données pour mettre à jour les statistiques
      await load();
    } catch {
      throw new Error("Erreur lors de la modification de la phase");
    }
  };

  const handleDeletePhase = async (phaseId: number) => {
    if (!confirm('Etes-vous sur de vouloir supprimer cette phase ?')) return;
    try {
      await projectService.deletePhase(phaseId);
      setPhases(prev => prev.filter(p => p.id !== phaseId));
      // Recharger les données pour mettre à jour les statistiques
      await load();
    } catch {
      setError("Erreur lors de la suppression de la phase");
    }
  };

  const handleChangePhaseStatus = async (phaseId: number, newStatus: string) => {
    try {
      const result = await projectService.changePhaseStatus(phaseId, newStatus);
      setPhases(prev => prev.map(p => p.id === phaseId ? result.phase : p));
      // Recharger les données pour mettre à jour les statistiques
      await load();
    } catch (error) {
      setError("Erreur lors du changement de statut de la phase");
    }
  };

  const handleReorderPhases = async (newOrder: Array<{ id: number; ordre: number }>) => {
    if (!projectId) return;
    
    try {
      setIsReordering(true);
      const result = await projectService.reorderPhases(projectId, newOrder);
      setPhases(result.phases);
      // Recharger les données pour mettre à jour les statistiques
      await load();
    } catch (error) {
      setError("Erreur lors de la réorganisation des phases");
    } finally {
      setIsReordering(false);
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

  const getStatusIcon = (statut: string) => {
    switch (statut) {
      case 'TERMINEE': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'EN_COURS': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'EN_ATTENTE': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'TERMINEE': return 'bg-green-100 text-green-800 border-green-200';
      case 'EN_COURS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

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
          <button
            onClick={() => setIsReorderModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            disabled={!projectId || phases.length === 0}
          >
            <ArrowUpDown className="h-4 w-4" />
            <span>Réorganiser</span>
          </button>
        </div>
      </div>

      {/* Statistiques des phases */}
      {phasesData && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{phasesData.statistiques.total_phases}</div>
            <div className="text-sm text-blue-800">Total Phases</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{phasesData.statistiques.completed_phases}</div>
            <div className="text-sm text-green-800">Terminées</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{phasesData.statistiques.in_progress_phases}</div>
            <div className="text-sm text-blue-800">En cours</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{phasesData.statistiques.pending_phases}</div>
            <div className="text-sm text-yellow-800">En attente</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{phasesData.statistiques.progression}%</div>
            <div className="text-sm text-purple-800">Progression</div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
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
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 bg-gray-50 border-b">
              <div className="font-semibold text-gray-700">Ordre</div>
              <div className="font-semibold text-gray-700">Nom</div>
              <div className="font-semibold text-gray-700">Statut</div>
              <div className="font-semibold text-gray-700">Responsable</div>
              <div className="font-semibold text-gray-700">Date debut</div>
              <div className="font-semibold text-gray-700">Date fin prevue</div>
              <div className="font-semibold text-gray-700 text-center">Actions</div>
            </div>
            {phases.map((phase) => (
              <div key={phase.id} className="grid grid-cols-1 md:grid-cols-7 gap-4 p-4 border-b last:border-b-0 hover:bg-gray-50">
                <div className="flex items-center justify-center">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {phase.ordre}
                  </span>
                </div>
                <div className="font-medium text-gray-900">
                  <div>{phase.nom}</div>
                  {phase.description && (
                    <div className="text-sm text-gray-500 truncate">{phase.description}</div>
                  )}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(phase.statut)}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(phase.statut)}`}>
                      {phase.statut === 'TERMINEE' ? '✅ Terminee' :
                       phase.statut === 'EN_COURS' ? '🔄 En cours' : '⏳ En attente'}
                    </span>
                  </div>
                  {/* Menu de changement de statut */}
                  <select
                    value={phase.statut}
                    onChange={(e) => handleChangePhaseStatus(phase.id, e.target.value)}
                    className="mt-2 text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                  >
                    <option value="EN_ATTENTE">En attente</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TERMINEE">Terminée</option>
                  </select>
                </div>
                <div className="text-gray-600">
                  {phase.responsable ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <UserIcon className="h-4 w-4 text-blue-500" />
                        <div className="font-medium text-gray-900">{phase.responsable}</div>
                      </div>
                      {phase.responsable_telephone && (
                        <div className="flex items-center space-x-2 ml-6">
                          <Phone className="h-3 w-3 text-green-500" />
                          <div className="text-sm text-gray-600">{phase.responsable_telephone}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-sm italic">Aucun responsable</div>
                  )}
                </div>
                <div className="text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span>{new Date(phase.date_debut).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 text-gray-400" />
                    <span>{new Date(phase.date_fin_prevue).toLocaleDateString()}</span>
                  </div>
                </div>
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

      <PhaseReorderModal
        isOpen={isReorderModalOpen}
        onClose={() => setIsReorderModalOpen(false)}
        phases={phases}
        onReorder={handleReorderPhases}
      />
    </div>
  );
};

export default ProjectPhasesView;
