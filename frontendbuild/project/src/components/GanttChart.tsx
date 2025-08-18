import React from 'react';

export interface GanttPhase {
  id: number;
  nom: string;
  date_debut: string; // ISO yyyy-mm-dd
  date_fin_prevue: string; // ISO yyyy-mm-dd
  date_fin_reelle?: string; // ISO yyyy-mm-dd
  statut: 'EN_COURS' | 'TERMINEE' | 'EN_ATTENTE';
  ordre?: number;
}

interface GanttChartProps {
  phases: GanttPhase[];
}

function parseDate(d: string | undefined): number | null {
  if (!d) return null;
  const t = Date.parse(d);
  return isNaN(t) ? null : t;
}

export const GanttChart: React.FC<GanttChartProps> = ({ phases }) => {
  if (!phases || phases.length === 0) {
    return (
      <div className="text-sm text-gray-500">Aucune phase disponible pour ce projet.</div>
    );
  }

  const ordered = [...phases].sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
  const starts = ordered.map(p => parseDate(p.date_debut)).filter((n): n is number => n !== null);
  const ends = ordered.map(p => parseDate(p.date_fin_reelle || p.date_fin_prevue)).filter((n): n is number => n !== null);

  const globalStart = Math.min(...starts);
  const globalEnd = Math.max(...ends);
  const totalSpan = Math.max(globalEnd - globalStart, 1);

  const statusColor = (statut: GanttPhase['statut']) => {
    switch (statut) {
      case 'TERMINEE': return 'bg-green-500';
      case 'EN_COURS': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="w-full">
      <div className="relative w-full border border-gray-200 rounded-lg p-4 overflow-hidden bg-white">
        <div className="space-y-3">
          {ordered.map((p) => {
            const s = parseDate(p.date_debut) ?? globalStart;
            const e = parseDate(p.date_fin_reelle || p.date_fin_prevue) ?? globalEnd;
            const leftPct = Math.max(0, Math.min(100, ((s - globalStart) / totalSpan) * 100));
            const widthPct = Math.max(1, Math.min(100 - leftPct, ((e - s) / totalSpan) * 100));
            return (
              <div key={p.id} className="flex items-center">
                <div className="w-48 pr-3 text-sm text-gray-700 truncate" title={p.nom}>{p.nom}</div>
                <div className="flex-1">
                  <div className="relative h-6 bg-gray-100 rounded">
                    <div
                      className={`absolute top-0 h-6 rounded ${statusColor(p.statut)}`}
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      title={`${p.nom} (${p.statut})`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-blue-500"></span> En cours</div>
          <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-green-500"></span> Terminée</div>
          <div className="flex items-center gap-1"><span className="inline-block w-3 h-3 bg-gray-400"></span> En attente</div>
        </div>
      </div>
    </div>
  );
};

export default GanttChart;




