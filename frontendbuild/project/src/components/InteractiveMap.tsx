import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Correction des icônes Leaflet pour React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Project {
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

interface InteractiveMapProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  className?: string;
}

const InteractiveMap: React.FC<InteractiveMapProps> = ({ 
  projects, 
  onProjectClick, 
  className = "h-96 w-full" 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Coordonnées du Sénégal (centre par défaut)
    const senegalCenter: [number, number] = [14.7167, -17.4677];

    // Créer la carte
    const map = L.map(mapRef.current).setView(senegalCenter, 8);

    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Sauvegarder l'instance de la carte
    mapInstanceRef.current = map;

    // Nettoyer lors du démontage
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Mettre à jour les marqueurs quand les projets changent
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Supprimer les anciens marqueurs
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Créer les icônes personnalisées pour chaque type de projet
    const createCustomIcon = (type: string) => {
      const colors = {
        'route': '#FF6B35',
        'ecole': '#4ECDC4',
        'hopital': '#FFE66D',
        'pont': '#95E1D3',
        'residence': '#F38181',
        'centre-commercial': '#A8E6CF'
      };

      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            background-color: ${colors[type as keyof typeof colors] || '#666'};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            color: white;
          ">
            ${type.charAt(0).toUpperCase()}
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        popupAnchor: [0, -15]
      });
    };

    // Ajouter les marqueurs pour chaque projet
    projects.forEach(project => {
      const marker = L.marker([project.latitude, project.longitude], {
        icon: createCustomIcon(project.type)
      }).addTo(mapInstanceRef.current!);

      // Créer le contenu du popup
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #333; font-size: 16px; font-weight: bold;">
            ${project.nom}
          </h3>
          <div style="margin-bottom: 8px;">
            <span style="
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 12px;
              font-weight: bold;
              color: white;
              background-color: ${
                project.statut === 'EN_COURS' ? '#FF6B35' :
                project.statut === 'TERMINE' ? '#4ECDC4' :
                '#FFE66D'
              };
            ">
              ${project.statut === 'EN_COURS' ? 'En cours' :
                project.statut === 'TERMINE' ? 'Terminé' : 'En attente'}
            </span>
          </div>
          <div style="font-size: 14px; color: #666; margin-bottom: 8px;">
            <strong>Type:</strong> ${getTypeLabel(project.type)}<br>
            <strong>Région:</strong> ${project.region}<br>
            <strong>Progression:</strong> ${project.progression}%<br>
            <strong>Budget:</strong> ${formatCurrency(project.budget_reel)}<br>
            <strong>Fin prévue:</strong> ${formatDate(project.date_fin_prevue)}
          </div>
          <div style="
            width: 100%;
            height: 6px;
            background-color: #eee;
            border-radius: 3px;
            overflow: hidden;
            margin-top: 8px;
          ">
            <div style="
              width: ${project.progression}%;
              height: 100%;
              background-color: #4ECDC4;
              transition: width 0.3s ease;
            "></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Ajouter un gestionnaire de clic
      if (onProjectClick) {
        marker.on('click', () => {
          onProjectClick(project);
        });
      }

      markersRef.current.push(marker);
    });

    // Ajuster la vue pour inclure tous les marqueurs si il y en a
    if (projects.length > 0) {
      const group = new L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.1));
    }

  }, [projects, onProjectClick]);

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-lg shadow-lg"
        style={{ minHeight: '400px' }}
      />
      
      {/* Message quand aucun projet */}
      {projects.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-20">
          <div className="text-center p-8">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Aucun projet disponible</h3>
            <p className="text-gray-500 text-sm">
              Aucun projet d'infrastructure n'est actuellement affiché sur la carte.
            </p>
          </div>
        </div>
      )}
      
      {/* Légende */}
      <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg z-10">
        <h4 className="text-sm font-semibold mb-2">Types de projets</h4>
        <div className="space-y-1">
          {[
            { type: 'route', label: 'Route', color: '#FF6B35' },
            { type: 'ecole', label: 'École', color: '#4ECDC4' },
            { type: 'hopital', label: 'Hôpital', color: '#FFE66D' },
            { type: 'pont', label: 'Pont', color: '#95E6D3' },
            { type: 'residence', label: 'Résidence', color: '#F38181' },
            { type: 'centre-commercial', label: 'Centre Commercial', color: '#A8E6CF' }
          ].map(({ type, label, color }) => (
            <div key={type} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: color }}
              ></div>
              <span className="text-xs text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className="absolute bottom-4 left-4 bg-white p-4 rounded-lg shadow-lg z-10">
        <h4 className="text-sm font-semibold mb-2">Statistiques</h4>
        <div className="space-y-1 text-xs">
          <div>Total: {projects.length} projets</div>
          <div>En cours: {projects.filter(p => p.statut === 'EN_COURS').length}</div>
          <div>Terminés: {projects.filter(p => p.statut === 'TERMINE').length}</div>
          <div>En attente: {projects.filter(p => p.statut === 'EN_ATTENTE').length}</div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveMap; 