import zipfile
import json
import os
from io import BytesIO
from django.http import HttpResponse
from django.core.serializers import serialize
from django.contrib.contenttypes.models import ContentType
from .models import Projet, Phase, Action, Risque, Budget, Commentaire, AuditTrail

# Import du modèle Document depuis l'application documents
try:
    from documents.models import Document
except ImportError:
    # Fallback si l'application documents n'est pas disponible
    Document = None

class ProjectExportService:
    """Service pour exporter un projet complet avec toutes ses données"""
    
    @staticmethod
    def export_project(projet_id):
        """Exporte un projet complet avec toutes ses données"""
        try:
            projet = Projet.objects.get(id=projet_id)
            
            # Créer un buffer ZIP en mémoire
            zip_buffer = BytesIO()
            
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                # Exporter le projet principal
                project_data = {
                    'projet': json.loads(serialize('json', [projet])),
                    'phases': json.loads(serialize('json', projet.phases.all())),
                    'actions': json.loads(serialize('json', projet.actions.all())),
                    'risques': json.loads(serialize('json', projet.risques.all())),
                    'budgets': json.loads(serialize('json', projet.budgets.all())),
                    'commentaires': json.loads(serialize('json', projet.commentaires.all())),
                    'documents': json.loads(serialize('json', projet.documents.all())),
                }
                
                # Ajouter le fichier JSON principal
                zip_file.writestr('projet_data.json', json.dumps(project_data, indent=2, ensure_ascii=False))
                
                # Ajouter un fichier de résumé
                summary = {
                    'nom_projet': projet.nom,
                    'statut': projet.statut,
                    'date_debut': str(projet.date_debut),
                    'date_fin_prevue': str(projet.date_fin_prevue),
                    'budget_prevue': float(projet.budget_prevue) if projet.budget_prevue else None,
                    'nombre_phases': projet.phases.count(),
                    'nombre_actions': projet.actions.count(),
                    'nombre_risques': projet.risques.count(),
                    'nombre_documents': projet.documents.count(),
                    'date_export': str(projet.date_modification)
                }
                
                zip_file.writestr('resume.txt', json.dumps(summary, indent=2, ensure_ascii=False))
                
            return zip_buffer
            
        except Projet.DoesNotExist:
            raise ValueError(f"Projet avec l'ID {projet_id} non trouvé")
        except Exception as e:
            raise Exception(f"Erreur lors de l'export: {str(e)}")

class AuditService:
    """Service pour la traçabilité et l'audit automatique"""
    
    @staticmethod
    def log_action(action, user, resource, description='', data_before=None, data_after=None, 
                   projet=None, request=None, context=None):
        """Enregistre une action dans le système de traçabilité"""
        try:
            # Extraire les informations de la requête si disponible
            ip_address = None
            user_agent = None
            session_id = None
            
            if request:
                ip_address = request.META.get('REMOTE_ADDR') or request.META.get('HTTP_X_FORWARDED_FOR')
                user_agent = request.META.get('HTTP_USER_AGENT', '')
                session_id = request.session.session_key if hasattr(request, 'session') else None
            
            # Créer l'enregistrement d'audit
            audit = AuditTrail.log_action(
                action=action,
                user=user,
                resource=resource,
                description=description,
                data_before=data_before,
                data_after=data_after,
                projet=projet,
                ip_address=ip_address,
                user_agent=user_agent,
                session_id=session_id,
                context=context
            )
            
            return audit
            
        except Exception as e:
            # En cas d'erreur, on log mais on ne fait pas échouer l'opération principale
            print(f"Erreur lors de l'enregistrement de l'audit: {e}")
            return None
    
    @staticmethod
    def log_project_creation(projet, user, request=None):
        """Enregistre la création d'un projet"""
        return AuditService.log_action(
            action='CREATE',
            user=user,
            resource=projet,
            description=f"Création du projet '{projet.nom}'",
            projet=projet,
            request=request,
            context={'type': 'projet_creation'}
        )
    
    @staticmethod
    def log_project_update(projet, user, data_before, data_after, request=None):
        """Enregistre la modification d'un projet"""
        # Identifier les champs modifiés
        changes = []
        for field, old_value in data_before.items():
            if field in data_after and data_after[field] != old_value:
                changes.append(f"{field}: {old_value} → {data_after[field]}")
        
        description = f"Modification du projet '{projet.nom}': {', '.join(changes)}" if changes else f"Modification du projet '{projet.nom}'"
        
        return AuditService.log_action(
            action='UPDATE',
            user=user,
            resource=projet,
            description=description,
            data_before=data_before,
            data_after=data_after,
            projet=projet,
            request=request,
            context={'type': 'projet_update', 'champs_modifies': changes}
        )
    
    @staticmethod
    def log_phase_status_change(phase, user, old_status, new_status, request=None):
        """Enregistre le changement de statut d'une phase"""
        return AuditService.log_action(
            action='STATUS_CHANGE',
            user=user,
            resource=phase,
            description=f"Changement de statut de la phase '{phase.nom}': {old_status} → {new_status}",
            projet=phase.projet,
            request=request,
            context={
                'type': 'phase_status_change',
                'ancien_statut': old_status,
                'nouveau_statut': new_status
            }
        )
    
    @staticmethod
    def log_document_upload(document, user, request=None):
        """Enregistre l'upload d'un document"""
        return AuditService.log_action(
            action='UPLOAD',
            user=user,
            resource=document,
            description=f"Upload du document '{document.nom}' ({document.type})",
            projet=document.projet,
            request=request,
            context={'type': 'document_upload', 'type_document': document.type}
        )
    
    @staticmethod
    def log_risk_identification(risque, user, request=None):
        """Enregistre l'identification d'un risque"""
        return AuditService.log_action(
            action='CREATE',
            user=user,
            resource=risque,
            description=f"Identification du risque '{risque.nom}' (Niveau: {risque.niveau})",
            projet=risque.projet,
            request=request,
            context={'type': 'risk_identification', 'niveau_risque': risque.niveau}
        )
    
    @staticmethod
    def log_user_login(user, request=None):
        """Enregistre la connexion d'un utilisateur"""
        return AuditService.log_action(
            action='LOGIN',
            user=user,
            resource=user,
            description=f"Connexion de l'utilisateur {user.username}",
            request=request,
            context={'type': 'user_login'}
        )
    
    @staticmethod
    def log_user_logout(user, request=None):
        """Enregistre la déconnexion d'un utilisateur"""
        return AuditService.log_action(
            action='LOGOUT',
            user=user,
            resource=user,
            description=f"Déconnexion de l'utilisateur {user.username}",
            request=request,
            context={'type': 'user_logout'}
        )
    
    @staticmethod
    def log_project_export(projet, user, request=None):
        """Enregistre l'export d'un projet"""
        return AuditService.log_action(
            action='EXPORT',
            user=user,
            resource=projet,
            description=f"Export du projet '{projet.nom}'",
            projet=projet,
            request=request,
            context={'type': 'project_export'}
        )
