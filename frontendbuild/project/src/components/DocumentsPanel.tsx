import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Project } from '../services/projectService';

interface DocItem {
  id: number;
  projet: number;
  type: 'PLAN' | 'CONTRAT' | 'RAPPORT' | 'PV';
  nom: string;
  fichier: string;
  date_upload: string;
  auteur?: number;
}

interface Props {
  project: Project | null;
}

const DocumentsPanel: React.FC<Props> = ({ project }) => {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<DocItem['type']>('PLAN');
  const [name, setName] = useState('');

  const load = async () => {
    if (!project) return;
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/documents/documents/?projet=${project.id}`);
      setDocs(res.data.results || res.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Erreur inattendue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [project?.id]);

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !file) return;
    try {
      setLoading(true);
      setError('');
      const form = new FormData();
      form.append('projet', String(project.id));
      form.append('type', type);
      form.append('nom', name || file.name);
      form.append('fichier', file);
      const res = await api.post('/documents/documents/', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setFile(null);
      setName('');
      setType('PLAN');
      setDocs(d => [res.data, ...d]);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Upload échoué');
    } finally {
      setLoading(false);
    }
  };

  if (!project) return <div className="text-sm text-gray-500">Sélectionnez un projet.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Documents</h2>
        <button onClick={load} className="text-blue-600 hover:text-blue-800 text-sm">Rafraîchir</button>
      </div>
      {loading && <div className="text-sm text-gray-500">Chargement…</div>}
      {error && <div className="text-sm text-red-600">{error}</div>}

      <form onSubmit={onUpload} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <select value={type} onChange={e => setType(e.target.value as any)} className="px-3 py-2 border rounded-lg">
            <option value="PLAN">Plan</option>
            <option value="CONTRAT">Contrat</option>
            <option value="RAPPORT">Rapport</option>
            <option value="PV">PV de réception</option>
          </select>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Nom du document (optionnel)" className="px-3 py-2 border rounded-lg" />
          <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="px-3 py-2 border rounded-lg" />
          <button type="submit" disabled={!file || loading} className="px-3 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">Uploader</button>
        </div>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-2 px-4">Nom</th>
              <th className="text-left py-2 px-4">Type</th>
              <th className="text-left py-2 px-4">Date</th>
              <th className="text-left py-2 px-4">Fichier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {docs.map(d => (
              <tr key={d.id}>
                <td className="py-2 px-4">{d.nom}</td>
                <td className="py-2 px-4">{d.type}</td>
                <td className="py-2 px-4">{new Date(d.date_upload).toLocaleString('fr-FR')}</td>
                <td className="py-2 px-4">
                  <a className="text-blue-600 hover:text-blue-800" href={d.fichier} target="_blank" rel="noreferrer">Télécharger</a>
                </td>
              </tr>
            ))}
            {docs.length === 0 && (
              <tr><td className="py-3 px-4 text-gray-500" colSpan={4}>Aucun document</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DocumentsPanel;







