import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Correction des icônes Leaflet pour React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Region {
  id: string;
  nom: string;
  center: [number, number];
  bounds: L.LatLngBounds;
}

interface SenegalMapProps {
  className?: string;
}

const SenegalMap: React.FC<SenegalMapProps> = ({ 
  className = "h-96 w-full" 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const regionsRef = useRef<L.Rectangle[]>([]);
  
  const [selectedRegion, setSelectedRegion] = useState<string>('');

  // Définition des régions du Sénégal avec leurs coordonnées et limites
  const regions: Region[] = [
    {
      id: 'dakar',
      nom: 'Dakar',
      center: [14.7167, -17.4677],
      bounds: L.latLngBounds([14.6, -17.6], [14.8, -17.3])
    },
    {
      id: 'thies',
      nom: 'Thiès',
      center: [14.7833, -16.9333],
      bounds: L.latLngBounds([14.6, -17.1], [14.9, -16.7])
    },
    {
      id: 'saint-louis',
      nom: 'Saint-Louis',
      center: [16.0333, -16.5000],
      bounds: L.latLngBounds([15.8, -16.7], [16.2, -16.3])
    },
    {
      id: 'diourbel',
      nom: 'Diourbel',
      center: [14.6500, -16.2333],
      bounds: L.latLngBounds([14.5, -16.4], [14.8, -16.0])
    },
    {
      id: 'kaolack',
      nom: 'Kaolack',
      center: [14.1500, -16.0833],
      bounds: L.latLngBounds([14.0, -16.2], [14.3, -15.9])
    },
    {
      id: 'louga',
      nom: 'Louga',
      center: [15.6167, -16.2167],
      bounds: L.latLngBounds([15.4, -16.4], [15.8, -16.0])
    },
    {
      id: 'fatick',
      nom: 'Fatick',
      center: [14.3333, -16.4167],
      bounds: L.latLngBounds([14.1, -16.6], [14.5, -16.2])
    },
    {
      id: 'kaffrine',
      nom: 'Kaffrine',
      center: [14.1167, -15.5500],
      bounds: L.latLngBounds([13.9, -15.7], [14.3, -15.4])
    },
    {
      id: 'kolda',
      nom: 'Kolda',
      center: [12.8833, -14.9500],
      bounds: L.latLngBounds([12.7, -15.1], [13.1, -14.8])
    },
    {
      id: 'sedhiou',
      nom: 'Sédhiou',
      center: [12.7000, -15.5500],
      bounds: L.latLngBounds([12.5, -15.7], [12.9, -15.4])
    },
    {
      id: 'tambacounda',
      nom: 'Tambacounda',
      center: [13.7667, -13.6667],
      bounds: L.latLngBounds([13.5, -13.9], [14.0, -13.4])
    },
    {
      id: 'kedougou',
      nom: 'Kédougou',
      center: [12.5500, -12.1833],
      bounds: L.latLngBounds([12.3, -12.4], [12.8, -12.0])
    },
    {
      id: 'matam',
      nom: 'Matam',
      center: [15.6500, -13.2500],
      bounds: L.latLngBounds([15.4, -13.5], [15.9, -13.0])
    },
    {
      id: 'ziguinchor',
      nom: 'Ziguinchor',
      center: [12.5833, -16.2833],
      bounds: L.latLngBounds([12.4, -16.5], [12.7, -16.1])
    }
  ];

  // Fonction pour zoomer sur une région
  const zoomToRegion = (regionId: string) => {
    if (!mapInstanceRef.current) return;
    
    const region = regions.find(r => r.id === regionId);
    if (!region) return;

    // Mettre à jour la sélection
    setSelectedRegion(regionId);

    // Zoom sur la région
    mapInstanceRef.current.fitBounds(region.bounds, { padding: [20, 20] });

    // Mettre à jour le style des régions
    updateRegionStyles();
  };

  // Fonction pour mettre à jour les styles des régions
  const updateRegionStyles = () => {
    regionsRef.current.forEach((polygon, index) => {
      const region = regions[index];
      const isSelected = region.id === selectedRegion;

      polygon.setStyle({
        fillColor: isSelected ? '#3B82F6' : '#10B981',
        weight: isSelected ? 3 : 1,
        opacity: isSelected ? 1 : 0.7,
        color: isSelected ? '#1D4ED8' : '#059669',
        fillOpacity: isSelected ? 0.3 : 0.1
      });
    });
  };

  // Gestionnaire de clic sur une région
  const handleRegionClick = (regionId: string) => {
    setSelectedRegion(regionId);
    updateRegionStyles();
  };

  useEffect(() => {
    if (!mapRef.current) return;

    // Coordonnées du Sénégal (centre par défaut)
    const senegalCenter: [number, number] = [14.7167, -17.4677];

    // Créer la carte
    const map = L.map(mapRef.current).setView(senegalCenter, 7);

    // Ajouter la couche de tuiles OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(map);

    // Créer les polygones des régions (simplifiés)
    const regionPolygons = regions.map(region => {
      const bounds = region.bounds;
      const polygon = L.rectangle(bounds, {
        fillColor: '#10B981',
        weight: 1,
        opacity: 0.7,
        color: '#059669',
        fillOpacity: 0.1
      });

      // Ajouter un popup avec le nom de la région
      polygon.bindPopup(`<b>${region.nom}</b><br>Cliquez pour sélectionner`);
      
      // Gestionnaire de clic
      polygon.on('click', () => {
        handleRegionClick(region.id);
        zoomToRegion(region.id);
      });

      return polygon;
    });

    // Ajouter tous les polygones à la carte
    regionPolygons.forEach(polygon => polygon.addTo(map));
    
    // Sauvegarder les références
    regionsRef.current = regionPolygons;

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

  // Mettre à jour les styles quand la sélection change
  useEffect(() => {
    updateRegionStyles();
  }, [selectedRegion]);

  return (
    <div className="space-y-4">
      {/* Liste déroulante des régions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <label htmlFor="region-select" className="text-sm font-medium text-gray-700 whitespace-nowrap">
          Sélectionner une région :
        </label>
        <select
          id="region-select"
          value={selectedRegion}
          onChange={(e) => zoomToRegion(e.target.value)}
          className="block w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">-- Choisir une région --</option>
          {regions.map((region) => (
            <option key={region.id} value={region.id}>
              {region.nom}
            </option>
          ))}
        </select>
      </div>

      {/* Carte */}
      <div 
        ref={mapRef} 
        className={className}
        style={{ 
          border: '2px solid #e5e7eb',
          borderRadius: '0.5rem',
          overflow: 'hidden'
        }}
      />
      
      {/* Légende */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Légende</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Régions</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Région sélectionnée</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SenegalMap;



