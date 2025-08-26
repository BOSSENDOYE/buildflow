import json
import csv
import zipfile
import io
from datetime import datetime
from django.http import HttpResponse
from django.db.models import Q
from projects.models import Projet, Phase, Action, Risque, Budget, Commentaire
from documents.models import Document
from users.models import ProfilUtilisateur

class ProjectExportService:
    """Service pour exporter toutes les informations d'un projet"""
    
    def __init__(self, projet):
        self.projet = projet
        self.export_data = {}
    
    def collect_project_data(self):
        """Collecter toutes les données du projet"""
        # Informations de base du projet
        self.export_data['projet'] = {
            'id': self.projet.id,
            'nom': self.projet.nom,
            'description': self.projet.description,
            'date_debut': self.projet.date_debut.isoformat() if self.projet.date_debut else None,
            'date_fin_prevue': self.projet.date_fin_prevue.isoformat() if self.projet.date_fin_prevue else None,
            'date_fin_reelle': self.projet.date_fin_reelle.isoformat() if self.projet.date_fin_reelle else None,
            'statut': self.projet.statut,
            'budget_prevue': float(self.projet.budget_prevue) if self.projet.budget_prevue else None,
            'budget_reel': float(self.projet.budget_reel) if self.projet.budget_reel else None,
            'nom_entreprise': self.projet.nom_entreprise,
            'region': self.projet.region,
            'departement': self.projet.departement,
            'etape_actuelle': self.projet.etape_actuelle,
            'date_creation': self.projet.date_creation.isoformat() if self.projet.date_creation else None,
            'date_modification': self.projet.date_modification.isoformat() if self.projet.date_modification else None,
        }
        
        # Chef de projet
        if self.projet.chef_projet:
            self.export_data['chef_projet'] = {
                'id': self.projet.chef_projet.id,
                'username': self.projet.chef_projet.username,
                'first_name': self.projet.chef_projet.first_name,
                'last_name': self.projet.chef_projet.last_name,
                'email': self.projet.chef_projet.email,
            }
            if hasattr(self.projet.chef_projet, 'profilutilisateur'):
                self.export_data['chef_projet']['role'] = self.projet.chef_projet.profilutilisateur.role
                self.export_data['chef_projet']['telephone'] = self.projet.chef_projet.profilutilisateur.telephone
        
        # Membres du projet
        self.export_data['membres'] = []
        for membre in self.projet.membres.all():
            membre_data = {
                'id': membre.id,
                'username': membre.username,
                'first_name': membre.first_name,
                'last_name': membre.last_name,
                'email': membre.email,
            }
            if hasattr(membre, 'profilutilisateur'):
                membre_data['role'] = membre.profilutilisateur.role
                membre_data['telephone'] = membre.profilutilisateur.telephone
            self.export_data['membres'].append(membre_data)
        
        # Phases du projet
        self.export_data['phases'] = []
        for phase in self.projet.phases.all().order_by('ordre'):
            self.export_data['phases'].append({
                'id': phase.id,
                'nom': phase.nom,
                'description': phase.description,
                'date_debut': phase.date_debut.isoformat() if phase.date_debut else None,
                'date_fin_prevue': phase.date_fin_prevue.isoformat() if phase.date_fin_prevue else None,
                'date_fin_reelle': phase.date_fin_reelle.isoformat() if phase.date_fin_reelle else None,
                'statut': phase.statut,
                'ordre': phase.ordre,
            })
        
        # Actions du projet
        self.export_data['actions'] = []
        for action in self.projet.actions.all().order_by('priorite'):
            action_data = {
                'id': action.id,
                'titre': action.titre,
                'description': action.description,
                'statut': action.statut,
                'priorite': action.priorite,
                'date_debut': action.date_debut.isoformat() if action.date_debut else None,
                'date_fin_prevue': action.date_fin_prevue.isoformat() if action.date_fin_prevue else None,
                'date_fin_reelle': action.date_fin_reelle.isoformat() if action.date_fin_reelle else None,
            }
            if action.phase:
                action_data['phase'] = action.phase.nom
            if action.responsable:
                action_data['responsable'] = action.responsable.username
            self.export_data['actions'].append(action_data)
        
        # Risques du projet
        self.export_data['risques'] = []
        for risque in self.projet.risques.all():
            risque_data = {
                'id': risque.id,
                'nom': risque.nom,
                'description': risque.description,
                'niveau': risque.niveau,
                'probabilite': risque.probabilite,
                'impact': risque.impact,
                'mesures_mitigation': risque.mesures_mitigation,
                'date_identification': risque.date_identification.isoformat() if risque.date_identification else None,
                'date_resolution': risque.date_resolution.isoformat() if risque.date_resolution else None,
            }
            if risque.responsable:
                risque_data['responsable'] = risque.responsable.username
            self.export_data['risques'].append(risque_data)
        
        # Budgets du projet
        self.export_data['budgets'] = []
        for budget in self.projet.budgets.all():
            self.export_data['budgets'].append({
                'id': budget.id,
                'type': budget.type,
                'montant': float(budget.montant),
                'description': budget.description,
                'date': budget.date.isoformat() if budget.date else None,
            })
        
        # Commentaires du projet
        self.export_data['commentaires'] = []
        for commentaire in self.projet.commentaires.all():
            self.export_data['commentaires'].append({
                'id': commentaire.id,
                'auteur': commentaire.auteur.username,
                'contenu': commentaire.contenu,
                'date_creation': commentaire.date_creation.isoformat() if commentaire.date_creation else None,
                'date_modification': commentaire.date_modification.isoformat() if commentaire.date_modification else None,
            })
        
        # Documents du projet
        self.export_data['documents'] = []
        for document in self.projet.documents.all():
            self.export_data['documents'].append({
                'id': document.id,
                'type': document.type,
                'nom': document.nom,
                'date_upload': document.date_upload.isoformat() if document.date_upload else None,
                'auteur': document.auteur.username if document.auteur else None,
            })
        
        # Statistiques du projet
        self.export_data['statistiques'] = {
            'total_phases': len(self.export_data['phases']),
            'phases_terminees': len([p for p in self.export_data['phases'] if p['statut'] == 'TERMINEE']),
            'phases_en_cours': len([p for p in self.export_data['phases'] if p['statut'] == 'EN_COURS']),
            'phases_en_attente': len([p for p in self.export_data['phases'] if p['statut'] == 'EN_ATTENTE']),
            'total_actions': len(self.export_data['actions']),
            'actions_terminees': len([a for a in self.export_data['actions'] if a['statut'] == 'TERMINEE']),
            'total_risques': len(self.export_data['risques']),
            'risques_critiques': len([r for r in self.export_data['risques'] if r['niveau'] == 'CRITIQUE']),
            'total_documents': len(self.export_data['documents']),
            'total_commentaires': len(self.export_data['commentaires']),
        }
    
    def generate_csv_files(self):
        """Générer des fichiers CSV pour chaque type de données"""
        csv_files = {}
        
        # CSV des phases
        phases_csv = io.StringIO()
        phases_writer = csv.writer(phases_csv)
        phases_writer.writerow(['ID', 'Nom', 'Description', 'Date début', 'Date fin prévue', 'Date fin réelle', 'Statut', 'Ordre'])
        for phase in self.export_data['phases']:
            phases_writer.writerow([
                phase['id'], phase['nom'], phase['description'], 
                phase['date_debut'], phase['date_fin_prevue'], phase['date_fin_reelle'],
                phase['statut'], phase['ordre']
            ])
        csv_files['phases.csv'] = phases_csv.getvalue()
        
        # CSV des actions
        actions_csv = io.StringIO()
        actions_writer = csv.writer(actions_csv)
        actions_writer.writerow(['ID', 'Titre', 'Description', 'Statut', 'Priorité', 'Phase', 'Responsable', 'Date début', 'Date fin prévue'])
        for action in self.export_data['actions']:
            actions_writer.writerow([
                action['id'], action['titre'], action['description'], action['statut'],
                action['priorite'], action.get('phase', ''), action.get('responsable', ''),
                action['date_debut'], action['date_fin_prevue']
            ])
        csv_files['actions.csv'] = actions_csv.getvalue()
        
        # CSV des risques
        risques_csv = io.StringIO()
        risques_writer = csv.writer(risques_csv)
        risques_writer.writerow(['ID', 'Nom', 'Description', 'Niveau', 'Probabilité', 'Impact', 'Mesures mitigation', 'Responsable', 'Date identification'])
        for risque in self.export_data['risques']:
            risques_writer.writerow([
                risque['id'], risque['nom'], risque['description'], risque['niveau'],
                risque['probabilite'], risque['impact'], risque['mesures_mitigation'],
                risque.get('responsable', ''), risque['date_identification']
            ])
        csv_files['risques.csv'] = risques_csv.getvalue()
        
        # CSV des budgets
        budgets_csv = io.StringIO()
        budgets_writer = csv.writer(budgets_csv)
        budgets_writer.writerow(['ID', 'Type', 'Montant', 'Description', 'Date'])
        for budget in self.export_data['budgets']:
            budgets_writer.writerow([
                budget['id'], budget['type'], budget['montant'], 
                budget['description'], budget['date']
            ])
        csv_files['budgets.csv'] = budgets_csv.getvalue()
        
        # CSV des commentaires
        commentaires_csv = io.StringIO()
        commentaires_writer = csv.writer(commentaires_csv)
        commentaires_writer.writerow(['ID', 'Auteur', 'Contenu', 'Date création', 'Date modification'])
        for commentaire in self.export_data['commentaires']:
            commentaires_writer.writerow([
                commentaire['id'], commentaire['auteur'], commentaire['contenu'],
                commentaire['date_creation'], commentaire['date_modification']
            ])
        csv_files['commentaires.csv'] = commentaires_csv.getvalue()
        
        # CSV des documents
        documents_csv = io.StringIO()
        documents_writer = csv.writer(documents_csv)
        documents_writer.writerow(['ID', 'Type', 'Nom', 'Auteur', 'Date upload'])
        for document in self.export_data['documents']:
            documents_writer.writerow([
                document['id'], document['type'], document['nom'],
                document.get('auteur', ''), document['date_upload']
            ])
        csv_files['documents.csv'] = documents_csv.getvalue()
        
        return csv_files
    
    def create_export_zip(self):
        """Créer un fichier ZIP contenant toutes les données du projet"""
        # Collecter les données
        self.collect_project_data()
        
        # Créer le fichier ZIP en mémoire
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            # Ajouter le fichier JSON principal
            json_data = json.dumps(self.export_data, indent=2, ensure_ascii=False)
            zip_file.writestr(f'projet_{self.projet.nom.replace(" ", "_")}_export.json', json_data)
            
            # Ajouter les fichiers CSV
            csv_files = self.generate_csv_files()
            for filename, content in csv_files.items():
                zip_file.writestr(f'csv/{filename}', content)
            
            # Ajouter un fichier README
            readme_content = f"""
EXPORT COMPLET DU PROJET : {self.projet.nom}
Date d'export : {datetime.now().strftime('%d/%m/%Y à %H:%M')}

CONTENU DU FICHIER :
- projet_{self.projet.nom.replace(" ", "_")}_export.json : Toutes les données du projet au format JSON
- csv/phases.csv : Liste des phases du projet
- csv/actions.csv : Liste des actions du projet
- csv/risques.csv : Liste des risques du projet
- csv/budgets.csv : Détails des budgets du projet
- csv/commentaires.csv : Commentaires et discussions du projet
- csv/documents.csv : Liste des documents du projet

INFORMATIONS GÉNÉRALES :
- Nom du projet : {self.projet.nom}
- Description : {self.projet.description}
- Statut : {self.projet.statut}
- Budget prévu : {self.projet.budget_prevue or 'Non défini'}
- Budget réel : {self.projet.budget_reel or 'Non défini'}
- Chef de projet : {self.projet.chef_projet.username if self.projet.chef_projet else 'Non assigné'}
- Total phases : {len(self.export_data.get('phases', []))}
- Total actions : {len(self.export_data.get('actions', []))}
- Total risques : {len(self.export_data.get('risques', []))}

Ce fichier contient toutes les informations nécessaires pour analyser et gérer le projet.
            """.strip()
            zip_file.writestr('README.txt', readme_content)
        
        return zip_buffer
    
    def export_project(self, filename=None):
        """Exporter le projet et retourner la réponse HTTP"""
        if not filename:
            filename = f"projet_{self.projet.nom.replace(' ', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.zip"
        
        zip_buffer = self.create_export_zip()
        zip_buffer.seek(0)
        
        response = HttpResponse(zip_buffer.getvalue(), content_type='application/zip')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        response['Content-Length'] = len(zip_buffer.getvalue())
        
        return response

