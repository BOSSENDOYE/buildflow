from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import ProfilUtilisateur
from .serializers import ProfilUtilisateurSerializer, UserSerializer
from .decorators import require_permission, require_role

class ProfilUtilisateurViewSet(viewsets.ModelViewSet):
    queryset = ProfilUtilisateur.objects.all()
    serializer_class = ProfilUtilisateurSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if hasattr(user, 'profilutilisateur'):
            if user.profilutilisateur.role == 'ADMINISTRATEUR':
                return ProfilUtilisateur.objects.all()
            elif user.profilutilisateur.has_permission('peut_gerer_utilisateurs'):
                return ProfilUtilisateur.objects.filter(actif=True)
            else:
                return ProfilUtilisateur.objects.filter(utilisateur=user)
        else:
            return ProfilUtilisateur.objects.none()

    # Endpoint pour récupérer le profil de l'utilisateur connecté
    @action(detail=False, methods=['get'])
    def me(self, request):
        try:
            profil = ProfilUtilisateur.objects.select_related('utilisateur').get(utilisateur=request.user)
            serializer = self.get_serializer(profil)
            return Response(serializer.data)
        except ProfilUtilisateur.DoesNotExist:
            return Response({'message': 'Profil introuvable'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """
    Vue pour l'inscription d'un nouvel utilisateur
    """
    try:
        # Récupérer les données de la requête
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        role = request.data.get('role', 'GESTIONNAIRE')  # Rôle par défaut

        # Validation du rôle
        valid_roles = ['GESTIONNAIRE', 'ADMINISTRATEUR', 'CONSULTANT']
        if role not in valid_roles:
            return Response({
                'message': 'Rôle invalide. Veuillez choisir un rôle valide.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validation des données
        if not username or not password or not email:
            return Response({
                'message': 'Tous les champs obligatoires doivent être remplis.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Vérifier si l'utilisateur existe déjà
        if User.objects.filter(username=username).exists():
            return Response({
                'message': 'Ce nom d\'utilisateur est déjà pris.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({
                'message': 'Cette adresse email est déjà utilisée.'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Créer l'utilisateur
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        # Créer le profil utilisateur avec le rôle spécifié
        profil = ProfilUtilisateur.objects.create(
            utilisateur=user,
            role=role
        )

        # Authentifier l'utilisateur et générer les tokens
        user = authenticate(username=username, password=password)
        refresh = RefreshToken.for_user(user)

        return Response({
            'message': 'Inscription réussie !',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'profilutilisateur': {
                    'id': profil.id,
                    'role': profil.role,
                    'permissions': profil.get_permissions(),
                }
            },
            'tokens': {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({
            'message': f'Erreur lors de l\'inscription: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_permissions(request):
    """
    Récupérer les permissions de l'utilisateur connecté
    """
    try:
        # Garantir l'existence du profil (auto-création si manquant)
        profil, _created = ProfilUtilisateur.objects.get_or_create(
            utilisateur=request.user,
            defaults={
                'role': 'ADMINISTRATEUR' if request.user.is_superuser else 'GESTIONNAIRE'
            }
        )
        return Response({
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
            },
            'profil': {
                'id': profil.id,
                'role': profil.role,
                'role_display': profil.get_role_display(),
                'permissions': profil.get_permissions(),
            }
        })
    except Exception as e:
        return Response({
            'message': f'Erreur lors de la récupération des permissions: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@require_role('ADMINISTRATEUR')
def list_all_users(request):
    """
    Liste tous les utilisateurs (admin seulement)
    """
    try:
        profils = ProfilUtilisateur.objects.select_related('utilisateur').all()
        data = []
        
        for profil in profils:
            data.append({
                'id': profil.utilisateur.id,
                'username': profil.utilisateur.username,
                'email': profil.utilisateur.email,
                'first_name': profil.utilisateur.first_name,
                'last_name': profil.utilisateur.last_name,
                'role': profil.role,
                'role_display': profil.get_role_display(),
                'actif': profil.actif,
                'date_creation': profil.date_creation,
                'permissions': profil.get_permissions(),
            })
        
        return Response(data)
    except Exception as e:
        return Response({
            'message': f'Erreur lors de la récupération des utilisateurs: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
@require_role('ADMINISTRATEUR')
def update_user_role(request, user_id):
    """
    Modifier le rôle d'un utilisateur (admin seulement)
    """
    try:
        new_role = request.data.get('role')
        if not new_role:
            return Response({
                'message': 'Le nouveau rôle est requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            profil = ProfilUtilisateur.objects.get(utilisateur_id=user_id)
            profil.role = new_role
            profil.save()
            
            return Response({
                'message': f'Rôle mis à jour avec succès',
                'user': {
                    'id': profil.utilisateur.id,
                    'username': profil.utilisateur.username,
                    'role': profil.role,
                    'role_display': profil.get_role_display(),
                    'permissions': profil.get_permissions(),
                }
            })
        except ProfilUtilisateur.DoesNotExist:
            return Response({
                'message': 'Utilisateur non trouvé'
            }, status=status.HTTP_404_NOT_FOUND)
            
    except Exception as e:
        return Response({
            'message': f'Erreur lors de la mise à jour du rôle: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@require_role('ADMINISTRATEUR')
def create_user_admin(request):
    """
    Création d'un utilisateur par un administrateur sans altérer la session courante
    """
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        password = request.data.get('password')
        role = request.data.get('role', 'GESTIONNAIRE')

        if not username or not email or not password:
            return Response({'message': 'username, email et password sont requis'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'message': "Ce nom d'utilisateur est déjà pris."}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({'message': "Cette adresse email est déjà utilisée."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
        )

        profil = ProfilUtilisateur.objects.create(utilisateur=user, role=role)

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': profil.role,
            'role_display': profil.get_role_display(),
            'actif': profil.actif,
            'permissions': profil.get_permissions(),
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'message': f'Erreur lors de la création: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])  # Permettre l'accès public pour l'inscription
def get_roles_info(request):
    """
    Récupérer les informations sur les rôles disponibles
    """
    roles_info = {
        'GESTIONNAIRE': {
            'display': 'Gestionnaire de Projet',
            'description': 'Peut créer et gérer des projets, voir les analytics',
            'permissions': ['peut_creer_projet', 'peut_modifier_projet', 'peut_voir_analytics', 'peut_exporter_donnees'],
            'features': [
                'Créer et gérer des projets',
                'Modifier les détails des projets',
                'Voir les analytics et statistiques',
                'Exporter les données'
            ]
        },
        'ADMINISTRATEUR': {
            'display': 'Administrateur Système',
            'description': 'Accès complet à toutes les fonctionnalités',
            'permissions': ['peut_creer_projet', 'peut_modifier_projet', 'peut_supprimer_projet', 'peut_gerer_utilisateurs', 'peut_voir_analytics', 'peut_exporter_donnees'],
            'features': [
                'Créer et gérer des projets',
                'Modifier et supprimer des projets',
                'Gérer tous les utilisateurs',
                'Voir les analytics et statistiques',
                'Exporter les données',
                'Accès complet au système'
            ]
        },
        'CONSULTANT': {
            'display': 'Consultant',
            'description': 'Peut consulter les projets et analytics en lecture seule',
            'permissions': ['peut_voir_analytics', 'peut_exporter_donnees'],
            'features': [
                'Consulter tous les projets',
                'Voir les analytics et statistiques',
                'Exporter les données',
                'Accès en lecture seule'
            ]
        }
    }
    
    return Response(roles_info)
