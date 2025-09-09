import React, { useState, useEffect } from 'react';
import { X, GripVertical, Save, RotateCcw } from 'lucide-react';
import { Phase } from '../services/projectService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  phases: Phase[];
  onReorder: (newOrder: Array<{ id: number; ordre: number }>) => Promise<void>;
}

const PhaseReorderModal: React.FC<Props> = ({ isOpen, onClose, phases, onReorder }) => {
  const [orderedPhases, setOrderedPhases] = useState<Phase[]>([]);
  const [isReordering, setIsReordering] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      setOrderedPhases([...phases].sort((a, b) => a.ordre - b.ordre));
    }
  }, [isOpen, phases]);

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;

    const newOrder = [...orderedPhases];
    const draggedPhase = newOrder[dragIndex];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(index, 0, draggedPhase);
    
    // Mettre à jour l'ordre des phases
    newOrder.forEach((phase, idx) => {
      phase.ordre = idx + 1;
    });
    
    setOrderedPhases(newOrder);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleSave = async () => {
    try {
      setIsReordering(true);
      const newOrder = orderedPhases.map(phase => ({
        id: phase.id,
        ordre: phase.ordre
      }));
      await onReorder(newOrder);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la réorganisation:', error);
    } finally {
      setIsReordering(false);
    }
  };

  const handleReset = () => {
    setOrderedPhases([...phases].sort((a, b) => a.ordre - b.ordre));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Réorganiser les Phases</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Glissez et déposez les phases pour modifier leur ordre. L'ordre sera automatiquement mis à jour.
          </p>

          <div className="space-y-2">
            {orderedPhases.map((phase, index) => (
              <div
                key={phase.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center space-x-3 p-4 border rounded-lg cursor-move transition-all ${
                  dragIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <GripVertical className="h-5 w-5 text-gray-400" />
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {phase.ordre}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{phase.nom}</div>
                  {phase.description && (
                    <div className="text-sm text-gray-500">{phase.description}</div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(phase.date_debut).toLocaleDateString()} - {new Date(phase.date_fin_prevue).toLocaleDateString()}
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  phase.statut === 'TERMINEE' ? 'bg-green-100 text-green-800' :
                  phase.statut === 'EN_COURS' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {phase.statut === 'TERMINEE' ? 'Terminée' :
                   phase.statut === 'EN_COURS' ? 'En cours' : 'En attente'}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Réinitialiser</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={isReordering}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{isReordering ? 'Sauvegarde...' : 'Sauvegarder'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseReorderModal;

