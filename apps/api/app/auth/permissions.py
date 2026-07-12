import json
from enum import Enum
from pathlib import Path

from fastapi import Depends, HTTPException, status

from app.auth.routes import get_current_user
from app.models.auth import User

# Single source of truth: packages/shared/rbac.json (mirrored by the frontend).
_RBAC_PATH = (
    Path(__file__).resolve().parents[4] / "packages" / "shared" / "rbac.json"
)
with open(_RBAC_PATH, encoding="utf-8") as _f:
    _RBAC = json.load(_f)

# Resource domains exposed in the app (uppercase member names -> json values).
Resource = Enum("Resource", {r.upper(): r for r in _RBAC["resources"]}, type=str)

# Level ordering: none < read < full
_LEVELS = {"none": 0, "read": 1, "full": 2}

ROLE_PERMISSIONS: dict[str, dict[str, str]] = _RBAC["roles"]


def role_permission(role_name: str, resource: Resource) -> str:
    return ROLE_PERMISSIONS.get(role_name, {}).get(resource.value, "none")


def require_permission(resource: Resource, level: str = "read"):
    """FastAPI dependency enforcing the role's access level on a resource."""
    required = _LEVELS[level]

    def _check(user: User = Depends(get_current_user)):
        granted = _LEVELS.get(role_permission(user.role.name, resource), 0)
        if granted < required:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this resource",
            )
        return user

    return _check
