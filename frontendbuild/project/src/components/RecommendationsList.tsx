import React from 'react';

interface RecommendationsListProps {
  recommendations: string[];
  loading?: boolean;
  className?: string;
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({ 
  recommendations, 
  loading = false, 
  className = '' 
}) => {
  // SVG Icons
  const CheckCircleIcon = () => (
    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  const ExclamationTriangleIcon = ({ color = 'text-amber-500' }) => (
    <svg className={`w-5 h-5 ${color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  );

  const InformationCircleIcon = () => (
    <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 mb-3">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-500">Aucune recommandation pour le moment</p>
    </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {recommendations.map((recommendation, index) => (
        <div key={index} className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {recommendation.toLowerCase().includes('urgent') || 
               recommendation.toLowerCase().includes('accélérer') ? (
                <ExclamationTriangleIcon color="text-amber-500" />
              ) : (
                <CheckCircleIcon />
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-800 leading-relaxed">
                {recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationsList;
