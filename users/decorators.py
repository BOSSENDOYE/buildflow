from functools import wraps
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated

def require_permission(permission_name):
    """
    Décorateur pour vérifier les permissions d'un utilisateur
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return Response(
                    {'message': 'Authentification requise'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            try:
                # Garantir l'existence du profil
                from .models import ProfilUtilisateur
                profil, _ = ProfilUtilisateur.objects.get_or_create(
                    utilisateur=request.user,
                    defaults={'role': 'ADMINISTRATEUR' if getattr(request.user, 'is_superuser', False) else 'GESTIONNAIRE'}
                )
                if not profil.has_permission(permission_name):
                    return Response(
                        {'message': f'Permission "{permission_name}" requise'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Exception as e:
                return Response(
                    {'message': 'Erreur de vérification des permissions'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

def require_role(role_name):
    """
    Décorateur pour vérifier le rôle d'un utilisateur
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.is_authenticated:
                return Response(
                    {'message': 'Authentification requise'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
            
            try:
                # Garantir l'existence du profil
                from .models import ProfilUtilisateur
                profil, _ = ProfilUtilisateur.objects.get_or_create(
                    utilisateur=request.user,
                    defaults={'role': 'ADMINISTRATEUR' if getattr(request.user, 'is_superuser', False) else 'GESTIONNAIRE'}
                )
                if profil.role != role_name:
                    return Response(
                        {'message': f'Rôle "{role_name}" requis'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Exception as e:
                return Response(
                    {'message': 'Erreur de vérification du rôle'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator 