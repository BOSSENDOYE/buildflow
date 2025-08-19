from django.apps import AppConfig

class UsersConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'users' 

    def ready(self):
        # Importer les signaux pour la création automatique des profils
        try:
            import users.signals  # noqa: F401
        except Exception:
            # Éviter d'empêcher le démarrage en cas d'erreur d'import
            pass