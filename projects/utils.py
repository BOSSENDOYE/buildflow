from typing import Any, Optional
from django.contrib.auth.models import User
from django.db import transaction
from django.forms.models import model_to_dict

from .models import AuditLog


def create_audit_log(
    utilisateur: Optional[User],
    action: str,
    instance: Any,
    before: Optional[dict] = None,
    after: Optional[dict] = None,
) -> None:
    resource_type = instance.__class__.__name__
    resource_id = getattr(instance, 'id', None)
    resource_repr = str(instance)
    if after is None:
        try:
            after = model_to_dict(instance)
        except Exception:
            after = None

    with transaction.atomic():
        AuditLog.objects.create(
            utilisateur=utilisateur if isinstance(utilisateur, User) else None,
            action=action,
            resource_type=resource_type,
            resource_id=resource_id or 0,
            resource_repr=resource_repr,
            before=before,
            after=after,
        )







