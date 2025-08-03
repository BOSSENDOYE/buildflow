import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PublicHome from './components/PublicHome';
import PrivateDashboard from './components/PrivateDashboard';

function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <PrivateDashboard />;
  } else {
    return <PublicHome />;
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;