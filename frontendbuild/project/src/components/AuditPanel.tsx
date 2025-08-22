import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Project } from '../services/projectService';

interface AuditItem {
  id: number;
  utilisateur: number | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  resource_type: string;
  resource_id: number;
  resource_repr: string;
  before?: any;
  after?: any;
  date_creation: string;
}

interface Props {
  project: Project | null;
}

const AuditPanel: React.FC<Props> = ({ project }) => {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [action, setAction] = useState<string>('');
  const [resource, setResource] = useState<string>('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const params: string[] = [];
      if (project) params.push(`resource_id=${project.id}`);
      if (resource) params.push(`resource_type=${encodeURIComponent(resource)}`);
      if (action) params.push(`action=${encodeURIComponent(action)}`);
      const q = params.length ? `?${params.join('&')}` : '';
      const res = await api.get(`/projets/audit/${q}`);
      setItems(res.data.results || res.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [project?.id, action, resource]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Traçabilité</h2>
        <button onClick={load} className="text-blue-600 hover:text-blue-800 text-sm">Rafraîchir</button>
      </div>
      {loading && <div className="text-sm text-gray-500">Chargement…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
        <input value={resource} onChange={e => setResource(e.target.value)} placeholder="Type ressource (ex: Projet)" className="px-3 py-2 border rounded-lg" />
        <select value={action} onChange={e => setAction(e.target.value)} className="px-3 py-2 border rounded-lg">
          <option value="">Toutes actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-2 px-4">Date</th>
              <th className="text-left py-2 px-4">Action</th>
              <th className="text-left py-2 px-4">Ressource</th>
              <th className="text-left py-2 px-4">Avant</th>
              <th className="text-left py-2 px-4">Après</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map(it => (
              <tr key={it.id}>
                <td className="py-2 px-4">{new Date(it.date_creation).toLocaleString('fr-FR')}</td>
                <td className="py-2 px-4">{it.action}</td>
                <td className="py-2 px-4">{it.resource_type} #{it.resource_id}</td>
                <td className="py-2 px-4 max-w-xs truncate" title={JSON.stringify(it.before)}>{it.before ? JSON.stringify(it.before) : '-'}</td>
                <td className="py-2 px-4 max-w-xs truncate" title={JSON.stringify(it.after)}>{it.after ? JSON.stringify(it.after) : '-'}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td className="py-3 px-4 text-gray-500" colSpan={5}>Aucun événement</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditPanel;







