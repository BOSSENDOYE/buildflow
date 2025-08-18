import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Project } from '../services/projectService';
import { BarChart3, DollarSign, TrendingUp, AlertTriangle, Clock, Target } from 'lucide-react';

interface Props { 
  project: Project | null 
}

interface ProjectFeatures {
  planned_days: number;
  days_elapsed: number;
  days_left: number;
  progress_ratio: number;
  budget_ratio: number;
  nb_risques: number;
  statut: string;
}

const AnalyticsPanel: React.FC<Props> = ({ project }) => {
  const [features, setFeatures] = useState<ProjectFeatures | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadAnalytics = async () => {
    if (!project) return;
    try {
      setLoading(true);
      setError('');
      // Récupérer les données analytics depuis l'endpoint recommendations qui inclut les features
      const response = await api.get(`/analytics/recommendations/?projet=${project.id}`);
      setFeatures(response.data.features);
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || 'Erreur lors du chargement des analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [project?.id]);

  if (!project) {
    return <div className="text-sm text-gray-500">Sélectionnez un projet pour voir les analytics.</div>;
  }

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'text-amber-600 bg-amber-100';
      case 'TERMINE': return 'text-green-600 bg-green-100';
      case 'EN_ATTENTE': return 'text-yellow-600 bg-yellow-100';
      case 'ANNULE': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminé';
      case 'EN_ATTENTE': return 'En attente';
      case 'ANNULE': return 'Annulé';
      default: return statut;
    }
  };

  const getProgressColor = (ratio: number) => {
    if (ratio >= 0.8) return 'text-green-600';
    if (ratio >= 0.6) return 'text-amber-600';
    if (ratio >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBudgetColor = (ratio: number) => {
    if (ratio <= 0.8) return 'text-green-600';
    if (ratio <= 1.0) return 'text-amber-600';
    if (ratio <= 1.2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 flex items-center">
          <BarChart3 className="h-5 w-5 mr-2" />
          Analytics du Projet
        </h2>
        <button 
          onClick={loadAnalytics} 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Rafraîchir
        </button>
      </div>

      {loading && (
        <div className="text-sm text-gray-500 text-center py-4">
          Chargement des analytics...
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}

      {features && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Progression */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Progression</div>
              <Target className="h-4 w-4 text-gray-400" />
            </div>
            <div className={`text-2xl font-bold ${getProgressColor(features.progress_ratio)}`}>
              {Math.round(features.progress_ratio * 100)}%
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  features.progress_ratio >= 0.8 ? 'bg-green-500' :
                  features.progress_ratio >= 0.6 ? 'bg-amber-500' :
                  features.progress_ratio >= 0.4 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(100, features.progress_ratio * 100)}%` }}
              />
            </div>
          </div>

          {/* Budget */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Budget Utilisé</div>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
            <div className={`text-2xl font-bold ${getBudgetColor(features.budget_ratio)}`}>
              {Math.round(features.budget_ratio * 100)}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {features.budget_ratio > 1 ? 'Dépassement' : 'Dans les limites'}
            </div>
          </div>

          {/* Temps */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Temps Restant</div>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <div className={`text-2xl font-bold ${
              features.days_left < 0 ? 'text-red-600' :
              features.days_left < 7 ? 'text-amber-600' : 'text-gray-900'
            }`}>
              {features.days_left < 0 ? Math.abs(features.days_left) : features.days_left}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {features.days_left < 0 ? 'Jours de retard' : 'Jours restants'}
            </div>
          </div>

          {/* Risques */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-gray-600">Risques</div>
              <AlertTriangle className="h-4 w-4 text-gray-400" />
            </div>
            <div className={`text-2xl font-bold ${
              features.nb_risques === 0 ? 'text-green-600' :
              features.nb_risques <= 2 ? 'text-amber-600' : 'text-red-600'
            }`}>
              {features.nb_risques}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {features.nb_risques === 0 ? 'Aucun risque' : 'Risques identifiés'}
            </div>
          </div>
        </div>
      )}

      {/* Détails du projet */}
      {features && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails du Projet</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Statut</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(features.statut)}`}>
                  {getStatusText(features.statut)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Durée prévue</span>
                <span className="text-sm font-medium text-gray-900">{features.planned_days} jours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Jours écoulés</span>
                <span className="text-sm font-medium text-gray-900">{features.days_elapsed} jours</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Progression temporelle</span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((features.days_elapsed / Math.max(1, features.planned_days)) * 100)}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Efficacité</span>
                <span className={`text-sm font-medium ${
                  features.progress_ratio > features.budget_ratio ? 'text-green-600' : 'text-amber-600'
                }`}>
                  {features.progress_ratio > features.budget_ratio ? 'Bonne' : 'À surveiller'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tendance</span>
                <TrendingUp className={`h-4 w-4 ${
                  features.progress_ratio >= 0.6 && features.days_left > 0 ? 'text-green-600' : 'text-amber-600'
                }`} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsPanel;
