import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Edit, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export interface DocumentComment {
  id: number;
  document: number;
  auteur: {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
  };
  contenu: string;
  date_creation: string;
  date_modification?: string;
}

interface DocumentCommentsProps {
  documentId: number;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentComments: React.FC<DocumentCommentsProps> = ({
  documentId,
  isOpen,
  onClose
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');

  // Charger les commentaires
  const loadComments = async () => {
    try {
      setLoading(true);
      // Simuler le chargement des commentaires (à remplacer par l'API réelle)
      const mockComments: DocumentComment[] = [
        {
          id: 1,
          document: documentId,
          auteur: {
            id: 1,
            username: 'admin',
            first_name: 'Admin',
            last_name: 'System'
          },
          contenu: 'Ce document est très important pour le projet.',
          date_creation: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          document: documentId,
          auteur: {
            id: 2,
            username: 'chef.projet',
            first_name: 'Jean',
            last_name: 'Dupont'
          },
          contenu: 'Merci pour ce document complet. Je vais le partager avec l\'équipe.',
          date_creation: '2024-01-15T14:45:00Z'
        }
      ];
      setComments(mockComments);
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ajouter un nouveau commentaire
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const newCommentData: DocumentComment = {
        id: Date.now(), // ID temporaire
        document: documentId,
        auteur: {
          id: user?.id || 0,
          username: user?.username || '',
          first_name: user?.first_name || '',
          last_name: user?.last_name || ''
        },
        contenu: newComment.trim(),
        date_creation: new Date().toISOString()
      };

      setComments(prev => [newCommentData, ...prev]);
      setNewComment('');
      
      // Ici, on appellerait l'API pour sauvegarder le commentaire
      console.log('Commentaire ajouté:', newCommentData);
      
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    }
  };

  // Modifier un commentaire
  const handleEditComment = async (commentId: number) => {
    if (!editContent.trim()) return;

    try {
      setComments(prev => prev.map(comment =>
        comment.id === commentId
          ? { ...comment, contenu: editContent.trim(), date_modification: new Date().toISOString() }
          : comment
      ));

      setEditingCommentId(null);
      setEditContent('');
      
      // Ici, on appellerait l'API pour mettre à jour le commentaire
      console.log('Commentaire modifié:', commentId);
      
    } catch (error) {
      console.error('Erreur lors de la modification du commentaire:', error);
    }
  };

  // Supprimer un commentaire
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) return;

    try {
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      
      // Ici, on appellerait l'API pour supprimer le commentaire
      console.log('Commentaire supprimé:', commentId);
      
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
    }
  };

  // Démarrer l'édition d'un commentaire
  const startEditing = (comment: DocumentComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.contenu);
  };

  // Annuler l'édition
  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isUserComment = (comment: DocumentComment) => {
    return comment.auteur.id === user?.id;
  };

  useEffect(() => {
    if (isOpen && documentId) {
      loadComments();
    }
  }, [isOpen, documentId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[80vh] flex flex-col z-[10000]">
        {/* En-tête */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center space-x-3">
            <MessageSquare className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Commentaires du document</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Liste des commentaires */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun commentaire</h3>
              <p className="text-gray-600">Soyez le premier à commenter ce document</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {comment.auteur.first_name} {comment.auteur.last_name}
                      </div>
                      <div className="text-xs text-gray-500">@{comment.auteur.username}</div>
                    </div>
                  </div>
                  
                  {isUserComment(comment) && (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => startEditing(comment)}
                        className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>

                {editingCommentId === comment.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Modifier votre commentaire..."
                    />
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                      >
                        Enregistrer
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-800 mb-3">{comment.contenu}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(comment.date_creation)}</span>
                      </div>
                      {comment.date_modification && (
                        <span>Modifié le {formatDate(comment.date_modification)}</span>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Formulaire de nouveau commentaire */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Ajouter un commentaire..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleAddComment();
                  }
                }}
              />
            </div>
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Envoyer le commentaire"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentComments;
