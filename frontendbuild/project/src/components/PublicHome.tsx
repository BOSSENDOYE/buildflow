import React, { useState, useEffect } from 'react';
import { Building2, MapPin, TrendingUp, Users, Calendar, CheckCircle2, AlertTriangle, Search, Filter, Mail, Phone, MessageCircle, ArrowRight, Globe, Shield, Zap, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import AuthService from '../services/authService';
import InteractiveMap from './InteractiveMap';

interface PublicProject {
  id: number;
  nom: string;
  type: 'route' | 'ecole' | 'hopital' | 'pont' | 'residence' | 'centre-commercial';
  region: string;
  statut: 'EN_COURS' | 'TERMINE' | 'EN_ATTENTE';
  progression: number;
  budget_prevue: number;
  budget_reel: number;
  date_fin_prevue: string;
  latitude: number;
  longitude: number;
}

const mockPublicProjects: PublicProject[] = [];

const PublicHome: React.FC = () => {
  const { login } = useAuth();
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'accueil' | 'statistiques' | 'carte' | 'faq'>('accueil');
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({ username: '', password: '' });
  const [registerCredentials, setRegisterCredentials] = useState({ 
    username: '', 
    password: '', 
    confirmPassword: '', 
    email: '', 
    first_name: '', 
    last_name: '',
    role: 'GESTIONNAIRE'
  });
  const [loginError, setLoginError] = useState('');
  const [registerError, setRegisterError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [rolesInfo, setRolesInfo] = useState<Record<string, any>>({});
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'route': 'Route',
      'ecole': 'École',
      'hopital': 'Hôpital',
      'pont': 'Pont',
      'residence': 'Résidence',
      'centre-commercial': 'Centre Commercial'
    };
    return types[type] || type;
  };

  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TERMINE': return 'bg-green-100 text-green-800 border-green-200';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (statut: string) => {
    switch (statut) {
      case 'EN_COURS': return 'En cours';
      case 'TERMINE': return 'Terminé';
      case 'EN_ATTENTE': return 'En attente';
      default: return statut;
    }
  };

  const loadRolesInfo = async () => {
    if (Object.keys(rolesInfo).length === 0) {
      setIsLoadingRoles(true);
      try {
        const roles = await AuthService.getRolesInfo();
        setRolesInfo(roles);
      } catch (error) {
        console.error('Erreur lors du chargement des informations des rôles:', error);
      } finally {
        setIsLoadingRoles(false);
      }
    }
  };

  useEffect(() => {
    if (showRegisterForm) {
      loadRolesInfo();
    }
  }, [showRegisterForm]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    try {
      await login(loginCredentials);
      setShowLoginForm(false);
      setLoginCredentials({ username: '', password: '' });
    } catch (error) {
      setLoginError('Identifiants incorrects. Veuillez réessayer.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');
    
    // Validation des mots de passe
    if (registerCredentials.password !== registerCredentials.confirmPassword) {
      setRegisterError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (registerCredentials.password.length < 8) {
      setRegisterError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    setIsRegistering(true);

    try {
      // Utiliser AuthService pour l'inscription
      const response = await fetch('http://localhost:8000/api/users/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerCredentials.username,
          password: registerCredentials.password,
          email: registerCredentials.email,
          first_name: registerCredentials.first_name,
          last_name: registerCredentials.last_name,
          role: registerCredentials.role,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Stocker les tokens
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);
        
        // Rediriger vers l'espace privé
        setShowRegisterForm(false);
        setRegisterCredentials({ 
          username: '', 
          password: '', 
          confirmPassword: '', 
          email: '', 
          first_name: '', 
          last_name: '',
          role: 'GESTIONNAIRE'
        });
        
        // Recharger la page pour mettre à jour l'état d'authentification
        window.location.reload();
      } else {
        setRegisterError(data.message || 'Erreur lors de l\'inscription.');
      }
    } catch (error) {
      setRegisterError('Erreur de connexion au serveur. Veuillez réessayer.');
    } finally {
      setIsRegistering(false);
    }
  };

  const filteredProjects = mockPublicProjects.filter(project => {
    if (selectedRegion && project.region !== selectedRegion) return false;
    if (selectedType && project.type !== selectedType) return false;
    return true;
  });

  const renderLoginForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <img src="/logo.jpg" alt="BuildFlow Logo" className="h-12 w-auto mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
          <p className="text-gray-600">Accédez à votre espace privé</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={loginCredentials.username}
              onChange={(e) => setLoginCredentials({ ...loginCredentials, username: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe
            </label>
            <input
              type="password"
              value={loginCredentials.password}
              onChange={(e) => setLoginCredentials({ ...loginCredentials, password: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {loginError && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
              {loginError}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoggingIn}
              className="flex-1 bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors font-medium disabled:opacity-50"
            >
              {isLoggingIn ? 'Connexion...' : 'Se connecter'}
            </button>
            <button
              type="button"
              onClick={() => setShowLoginForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>

          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm">
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={() => {
                  setShowLoginForm(false);
                  setShowRegisterForm(true);
                }}
                className="text-amber-700 hover:text-amber-800 font-medium"
              >
                S'inscrire
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );

  const renderAccueil = () => (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-amber-700 to-amber-800 text-white py-16 px-6 rounded-2xl overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/CHANTIEIR.jpg" 
            alt="Background Chantier" 
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-700/50 to-amber-800/50" />
        
        {/* Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <img src="/logo.jpg" alt="BuildFlow Logo" className="h-16 w-auto" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            BuildFlow
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-amber-100">
            La plateforme de transparence pour les projets de construction au Sénégal
          </p>
          <p className="text-lg text-amber-200 mb-8 max-w-3xl mx-auto">
            Suivez en temps réel l'avancement des projets d'infrastructure publics, 
            découvrez les statistiques de performance et participez à la démocratie locale.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => setActiveTab('carte')}
              className="bg-white text-amber-700 px-8 py-3 rounded-lg font-semibold hover:bg-amber-50 transition-colors flex items-center justify-center space-x-2"
            >
              <MapPin className="h-5 w-5" />
              <span>Explorer les projets</span>
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              En savoir plus
            </button>
          </div>
        </div>
      </div>

      {/* Objectifs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-amber-700" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Transparence</h3>
          <p className="text-gray-600">
            Accès public aux informations sur les projets d'infrastructure pour une démocratie participative.
          </p>
        </div>
        <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
          <div className="flex justify-center mb-4">
            <Globe className="h-12 w-12 text-amber-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Information Citoyenne</h3>
          <p className="text-gray-600">
            Données claires et accessibles pour permettre aux citoyens de comprendre l'impact des projets.
          </p>
        </div>
        <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
          <div className="flex justify-center mb-4">
            <Zap className="h-12 w-12 text-amber-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Digitalisation</h3>
          <p className="text-gray-600">
            Modernisation de la gestion des projets grâce aux technologies numériques avancées.
          </p>
        </div>
      </div>

      {/* Projets en vedette */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Projets en Vedette</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockPublicProjects.slice(0, 3).map((project) => (
            <div key={project.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{project.nom}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.statut)}`}>
                  {getStatusText(project.statut)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-4">{project.region}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progression</span>
                  <span className="font-medium">{project.progression}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-amber-600 h-2 rounded-full" 
                    style={{ width: `${project.progression}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Budget</span>
                  <span className="font-medium">{formatCurrency(project.budget_reel)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStatistiques = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Statistiques Publiques</h1>
        <p className="text-gray-600">Tableau de bord global sur l'état d'avancement des projets publics</p>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projets Terminés</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockPublicProjects.filter(p => p.statut === 'TERMINE').length}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Livraison à Temps</p>
              <p className="text-2xl font-bold text-gray-900">87%</p>
            </div>
                         <Calendar className="h-8 w-8 text-amber-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget Respecté</p>
              <p className="text-2xl font-bold text-gray-900">92%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Projets Actifs</p>
              <p className="text-2xl font-bold text-gray-900">
                {mockPublicProjects.filter(p => p.statut === 'EN_COURS').length}
              </p>
            </div>
            <Building2 className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Graphiques et analyses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Répartition par Type</h3>
          <div className="space-y-4">
            {['ecole', 'hopital', 'route', 'pont', 'residence', 'centre-commercial'].map((type) => {
              const count = mockPublicProjects.filter(p => p.type === type).length;
              const percentage = (count / mockPublicProjects.length) * 100;
              return (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{getTypeLabel(type)}</span>
                    <span className="text-sm text-gray-900">{count} projets</span>
                  </div>
                                     <div className="w-full bg-gray-200 rounded-full h-2">
                     <div
                       className="bg-amber-600 h-2 rounded-full"
                       style={{ width: `${percentage}%` }}
                     ></div>
                   </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Performance Régionale</h3>
          <div className="space-y-4">
            {Array.from(new Set(mockPublicProjects.map(p => p.region))).map((region) => {
              const projects = mockPublicProjects.filter(p => p.region === region);
              const completed = projects.filter(p => p.statut === 'TERMINE').length;
              const percentage = (completed / projects.length) * 100;
              return (
                <div key={region} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{region}</span>
                    <span className="text-sm text-gray-900">{completed}/{projects.length}</span>
                  </div>
                                     <div className="w-full bg-gray-200 rounded-full h-2">
                     <div
                       className="bg-amber-700 h-2 rounded-full"
                       style={{ width: `${percentage}%` }}
                     ></div>
                   </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCarte = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Carte Interactive des Projets</h1>
        <p className="text-gray-600">Explorez les projets par région et type d'infrastructure</p>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Région</label>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les régions</option>
              {Array.from(new Set(mockPublicProjects.map(p => p.region))).map((region) => (
                <option key={region} value={region}>{region}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Type d'infrastructure</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les types</option>
              {['route', 'ecole', 'hopital', 'pont', 'residence', 'centre-commercial'].map((type) => (
                <option key={type} value={type}>{getTypeLabel(type)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Carte Interactive */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Carte Interactive des Projets</h3>
          <p className="text-sm text-gray-600">
            Cliquez sur les marqueurs pour voir les détails des projets
          </p>
        </div>
        <InteractiveMap 
          projects={filteredProjects}
          onProjectClick={(project) => {
            console.log('Projet cliqué:', project);
            // Ici vous pouvez ajouter une logique pour afficher plus de détails
          }}
          className="h-96 w-full"
        />
      </div>

      {/* Liste des projets filtrés */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Projets ({filteredProjects.length})</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{project.nom}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.statut)}`}>
                    {getStatusText(project.statut)}
                  </span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {project.region}
                  </div>
                  <div className="text-gray-600">
                    Type: {getTypeLabel(project.type)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Progression</span>
                    <span className="font-medium">{project.progression}%</span>
                  </div>
                                   <div className="w-full bg-gray-200 rounded-full h-2">
                   <div 
                     className="bg-amber-600 h-2 rounded-full" 
                     style={{ width: `${project.progression}%` }}
                   ></div>
                 </div>
                  <div className="text-gray-600">
                    Budget: {formatCurrency(project.budget_reel)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">FAQ / Assistance / Contact</h1>
        <p className="text-gray-600">Informations pour les citoyens et partenaires potentiels</p>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Questions Fréquentes</h2>
        <div className="space-y-6">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Comment fonctionne BuildFlow ?</h3>
            <p className="text-gray-600">
              BuildFlow est une plateforme de transparence qui permet de suivre en temps réel 
              l'avancement des projets d'infrastructure publics. Les données sont mises à jour 
              régulièrement par les équipes de gestion de projet.
            </p>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Les données sont-elles fiables ?</h3>
            <p className="text-gray-600">
              Oui, toutes les données proviennent directement des gestionnaires de projet 
              et sont validées par les autorités compétentes avant publication.
            </p>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Comment signaler un problème ?</h3>
            <p className="text-gray-600">
                             Vous pouvez nous contacter via le formulaire ci-dessous ou par email 
               à contact@buildflow.sn pour signaler toute anomalie ou erreur.
            </p>
          </div>
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Comment devenir partenaire ?</h3>
            <p className="text-gray-600">
              Les entreprises et organisations intéressées par un partenariat peuvent 
              nous contacter pour discuter des opportunités de collaboration.
            </p>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Nous Contacter</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-5 w-5 text-blue-600" />
                             <span className="text-gray-700">contact@buildflow.sn</span>
            </div>
            <div className="flex items-center space-x-3">
              <Phone className="h-5 w-5 text-blue-600" />
                             <span className="text-gray-700">+221 33 123 45 67</span>
            </div>
            <div className="flex items-center space-x-3">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">Support en ligne disponible</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Formulaire de Contact</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sujet</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Sélectionner un sujet</option>
                <option value="question">Question générale</option>
                <option value="signalement">Signalement d'erreur</option>
                <option value="partenariat">Demande de partenariat</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
            </div>
                         <button
               type="submit"
               className="w-full bg-amber-700 text-white px-6 py-3 rounded-lg hover:bg-amber-800 transition-colors font-medium"
             >
              Envoyer le message
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <img src="/logo.jpg" alt="BuildFlow Logo" className="h-8 w-auto" />
              <span className="text-xl font-bold text-gray-900">BuildFlow</span>
            </div>
            <nav className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => setActiveTab('accueil')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'accueil' ? 'text-amber-700' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Accueil
              </button>
              <button
                onClick={() => setActiveTab('statistiques')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'statistiques' ? 'text-amber-700' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Statistiques
              </button>
              <button
                onClick={() => setActiveTab('carte')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'carte' ? 'text-amber-700' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                Carte
              </button>
              <button
                onClick={() => setActiveTab('faq')}
                className={`text-sm font-medium transition-colors ${
                  activeTab === 'faq' ? 'text-amber-700' : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                FAQ/Contact
              </button>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-900 transition-colors">
                <Search className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setShowLoginForm(true)}
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-amber-700 text-white hover:bg-amber-800 flex items-center space-x-2"
              >
                <LogIn className="h-4 w-4" />
                <span>Espace Privé</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'accueil' && renderAccueil()}
        {activeTab === 'statistiques' && renderStatistiques()}
        {activeTab === 'carte' && renderCarte()}
        {activeTab === 'faq' && renderFAQ()}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo.jpg" alt="BuildFlow Logo" className="h-6 w-auto" />
                <span className="text-lg font-bold">BuildFlow</span>
              </div>
              <p className="text-gray-300">
                La plateforme de transparence pour les projets de construction au Sénégal.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2 text-gray-300">
                <li><button onClick={() => setActiveTab('accueil')} className="hover:text-white transition-colors">Accueil</button></li>
                <li><button onClick={() => setActiveTab('statistiques')} className="hover:text-white transition-colors">Statistiques</button></li>
                <li><button onClick={() => setActiveTab('carte')} className="hover:text-white transition-colors">Carte</button></li>
                <li><button onClick={() => setActiveTab('faq')} className="hover:text-white transition-colors">FAQ/Contact</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Légal</h3>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#" className="hover:text-white transition-colors">Mentions légales</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Politique de confidentialité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Conditions d'utilisation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-300">
                <li>contact@buildflow.sn</li>
                <li>+221 33 123 45 67</li>
                <li>Dakar, Sénégal</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 BuildFlow. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* Login Form Modal */}
      {showLoginForm && renderLoginForm()}

      {/* Register Form Modal */}
      {showRegisterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="text-center mb-6">
              <img src="/logo.jpg" alt="BuildFlow Logo" className="h-12 w-auto mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900">Inscription</h2>
              <p className="text-gray-600">Créez votre compte BuildFlow</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    value={registerCredentials.first_name}
                    onChange={(e) => setRegisterCredentials({ ...registerCredentials, first_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    value={registerCredentials.last_name}
                    onChange={(e) => setRegisterCredentials({ ...registerCredentials, last_name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={registerCredentials.username}
                  onChange={(e) => setRegisterCredentials({ ...registerCredentials, username: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={registerCredentials.email}
                  onChange={(e) => setRegisterCredentials({ ...registerCredentials, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type de compte
                </label>
                <select
                  value={registerCredentials.role}
                  onChange={(e) => setRegisterCredentials({ ...registerCredentials, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="GESTIONNAIRE">Gestionnaire de Projet</option>
                  <option value="ADMINISTRATEUR">Administrateur Système</option>
                  <option value="CONSULTANT">Consultant</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choisissez le type de compte qui correspond le mieux à vos besoins
                </p>
                
                {/* Informations sur les types de compte */}
                {isLoadingRoles ? (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="ml-2 text-sm text-blue-600">Chargement des informations...</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-900 mb-3">Informations sur les types de compte :</h4>
                    <div className="space-y-3">
                      {Object.entries(rolesInfo).map(([roleKey, roleInfo]) => (
                        <div key={roleKey} className={`p-3 rounded-lg border ${registerCredentials.role === roleKey ? 'border-blue-300 bg-blue-100' : 'border-gray-200 bg-white'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h5 className="text-sm font-medium text-blue-900">{roleInfo.display}</h5>
                              <p className="text-xs text-blue-700 mt-1">{roleInfo.description}</p>
                              <div className="mt-2">
                                <p className="text-xs font-medium text-blue-800 mb-1">Fonctionnalités :</p>
                                <ul className="text-xs text-blue-700 space-y-1">
                                  {roleInfo.features?.map((feature: string, index: number) => (
                                    <li key={index} className="flex items-center">
                                      <span className="w-1 h-1 bg-blue-500 rounded-full mr-2"></span>
                                      {feature}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setRegisterCredentials({ ...registerCredentials, role: roleKey })}
                              className={`ml-3 px-3 py-1 text-xs rounded-full border ${
                                registerCredentials.role === roleKey
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50'
                              }`}
                            >
                              Choisir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={registerCredentials.password}
                  onChange={(e) => setRegisterCredentials({ ...registerCredentials, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  value={registerCredentials.confirmPassword}
                  onChange={(e) => setRegisterCredentials({ ...registerCredentials, confirmPassword: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {registerError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  {registerError}
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isRegistering}
                  className="flex-1 bg-amber-700 text-white px-4 py-2 rounded-lg hover:bg-amber-800 transition-colors font-medium disabled:opacity-50"
                >
                  {isRegistering ? 'Inscription...' : 'S\'inscrire'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>

              <div className="text-center pt-4 border-t border-gray-200">
                <p className="text-gray-600 text-sm">
                  Déjà un compte ?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegisterForm(false);
                      setShowLoginForm(true);
                    }}
                    className="text-amber-700 hover:text-amber-800 font-medium"
                  >
                    Se connecter
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicHome; 