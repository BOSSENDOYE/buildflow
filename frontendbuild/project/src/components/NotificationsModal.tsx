import React from 'react';
import { Bell, X, AlertTriangle, CheckCircle, Clock, Info } from 'lucide-react';

interface Alert {
  id: number;
  type: 'retard' | 'depassement' | 'anomalie' | 'risque';
  titre: string;
  description: string;
  projet: string;
  date: string;
  priorite: 'faible' | 'moyenne' | 'elevee' | 'critique';
  isRead: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: Alert[];
  onMarkAsRead: (alertId: number) => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({ 
  isOpen, 
  onClose, 
  alerts, 
  onMarkAsRead 
}) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'retard': return <Clock className="h-5 w-5 text-orange-500" />;
      case 'depassement': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'anomalie': return <Info className="h-5 w-5 text-yellow-500" />;
      case 'risque': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getAlertColor = (priorite: string) => {
    switch (priorite) {
      case 'critique': return 'bg-red-100 text-red-800 border-red-200';
      case 'elevee': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'moyenne': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'faible': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            {alerts.filter(a => !a.isRead).length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                {alerts.filter(a => !a.isRead).length}
              </span>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune notification</h3>
              <p className="text-gray-600">Vous n'avez aucune notification pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div 
                  key={alert.id} 
                  className={`p-4 rounded-lg border transition-colors ${
                    alert.isRead 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-white border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className={`font-medium ${alert.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                          {alert.titre}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAlertColor(alert.priorite)}`}>
                            {alert.priorite}
                          </span>
                          {!alert.isRead && (
                            <button
                              onClick={() => onMarkAsRead(alert.id)}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              Marquer comme lu
                            </button>
                          )}
                        </div>
                      </div>
                      <p className={`text-sm mb-2 ${alert.isRead ? 'text-gray-500' : 'text-gray-700'}`}>
                        {alert.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Projet: {alert.projet}</span>
                        <span>{formatDate(alert.date)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsModal; 