import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Project } from '../services/projectService';

interface Props { project: Project | null }

const PredictionsPanel: React.FC<Props> = ({ project }) => {
  const [delayProb, setDelayProb] = useState<number | null>(null);
  const [budgetProb, setBudgetProb] = useState<number | null>(null);
  const [recs, setRecs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    if (!project) return;
    try {
      setLoading(true); setError('');
      const [d, b, r] = await Promise.all([
        api.get(`/analytics/predict/delay/?projet=${project.id}`),
        api.get(`/analytics/predict/budget_overrun/?projet=${project.id}`),
        api.get(`/analytics/recommendations/?projet=${project.id}`)
      ]);
      setDelayProb(d.data.delay_risk_probability);
      setBudgetProb(b.data.budget_overrun_probability);
      setRecs(r.data.recommendations || []);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Erreur IA');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [project?.id]);

  if (!project) return <div className="text-sm text-gray-500">Sélectionnez un projet.</div>;

  const Bar = ({ value, color }: { value: number; color: string }) => (
    <div className="h-2 bg-gray-100 rounded mt-2">
      <div className={`h-2 ${color} rounded`} style={{ width: `${Math.min(100, Math.round((value || 0) * 100))}%` }} />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Prédictions IA</h2>
        <button onClick={load} className="text-blue-600 hover:text-blue-800 text-sm">Rafraîchir</button>
      </div>
      {loading && <div className="text-sm text-gray-500">Chargement…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Probabilité de retard</div>
          <div className="text-3xl font-bold text-gray-900">{delayProb == null ? '-' : Math.round((delayProb || 0) * 100)}%</div>
          <Bar value={delayProb || 0} color="bg-amber-500" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Risque de dépassement budgétaire</div>
          <div className="text-3xl font-bold text-gray-900">{budgetProb == null ? '-' : Math.round((budgetProb || 0) * 100)}%</div>
          <Bar value={budgetProb || 0} color="bg-red-500" />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-sm font-medium text-gray-900 mb-2">Recommandations</div>
        {recs.length === 0 ? (
          <div className="text-sm text-gray-500">Aucune recommandation pour l’instant.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recs.map((r, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-3 bg-white">
                <div className="text-sm text-gray-800">{r}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PredictionsPanel;







