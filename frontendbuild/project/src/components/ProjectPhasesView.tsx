import React, { useEffect, useState } from 'react';
import projectService, { Phase } from '../services/projectService';
import GanttChart from './GanttChart';

interface Props {
  projectId: number | null;
}

const ProjectPhasesView: React.FC<Props> = ({ projectId }) => {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const load = async () => {
    if (!projectId) { setPhases([]); return; }
    try {
      setLoading(true);
      setError('');
      const list = await projectService.getPhases(projectId);
      setPhases(list);
    } catch (e) {
      setError("Impossible de charger les phases.");
      setPhases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 15000); // rafraîchissement léger toutes les 15s
    return () => clearInterval(id);
  }, [projectId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Suivi de l’avancement</h2>
        <button onClick={load} className="text-blue-600 hover:text-blue-800 text-sm">Rafraîchir</button>
      </div>
      {loading && <div className="text-sm text-gray-500">Chargement…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      <GanttChart phases={phases as any} />
    </div>
  );
};

export default ProjectPhasesView;




