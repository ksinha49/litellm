"""
APPLICATION MANAGEMENT

All /application management endpoints

/application/new
/application/info
/application/update
/application/delete
/application/list
/application/{app_id}/keys
/application/{app_id}/keys/assign
/application/{app_id}/keys/unassign
/application/{app_id}/metrics
/application/health
/application/config
/application/config/update
"""

import json
import os
import traceback
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request

import litellm
from litellm._logging import verbose_proxy_logger
from litellm._uuid import uuid
from litellm.proxy._types import (
    ApplicationHealthResponse,
    ApplicationMetrics,
    ApplicationType,
    CommonProxyErrors,
    LitellmUserRoles,
    NewApplicationRequest,
    ProxyException,
    UpdateApplicationRequest,
    UserAPIKeyAuth,
)
from litellm.proxy.auth.user_api_key_auth import user_api_key_auth
from litellm.proxy.management_helpers.utils import management_endpoint_wrapper
from litellm.proxy.utils import PrismaClient

router = APIRouter()

# ─── helpers ────────────────────────────────────────────────────────────────


def _require_admin(user_api_key_dict: UserAPIKeyAuth) -> None:
    """Raise 403 if the caller is not a proxy admin."""
    if user_api_key_dict.user_role != LitellmUserRoles.PROXY_ADMIN:
        raise HTTPException(
            status_code=403,
            detail={
                "error": "Only proxy admins can perform this action. "
                f"Your role: {user_api_key_dict.user_role}"
            },
        )


async def _get_prisma() -> PrismaClient:
    from litellm.proxy.proxy_server import prisma_client

    if prisma_client is None:
        raise HTTPException(
            status_code=500, detail={"error": "No database connected"}
        )
    return prisma_client


async def _get_app_or_404(prisma_client: PrismaClient, application_id: str) -> Any:
    app = await prisma_client.db.litellm_applicationtable.find_unique(
        where={"application_id": application_id}
    )
    if app is None:
        raise HTTPException(
            status_code=404,
            detail={"error": f"Application {application_id} not found"},
        )
    return app


# ─── config helpers ─────────────────────────────────────────────────────────

_APP_CONFIG_KEY = "application_registry_config"
_DEFAULT_APP_CONFIG = {
    "departments": [],
    "lines_of_business": [],
}


async def _read_app_config(prisma_client: PrismaClient) -> Dict[str, Any]:
    row = await prisma_client.db.litellm_config.find_first(
        where={"param_name": _APP_CONFIG_KEY}
    )
    if row is None:
        return dict(_DEFAULT_APP_CONFIG)
    val = row.param_value
    if isinstance(val, str):
        return json.loads(val)
    return dict(val) if val else dict(_DEFAULT_APP_CONFIG)


async def _write_app_config(
    prisma_client: PrismaClient, config: Dict[str, Any]
) -> None:
    await prisma_client.db.litellm_config.upsert(
        where={"param_name": _APP_CONFIG_KEY},
        data={
            "create": {"param_name": _APP_CONFIG_KEY, "param_value": json.dumps(config)},
            "update": {"param_value": json.dumps(config)},
        },
    )


# ─── metrics helpers ────────────────────────────────────────────────────────


async def _compute_app_metrics(
    prisma_client: PrismaClient,
    app: Any,
    start_dt: datetime,
    end_dt: datetime,
    active_since: datetime,
) -> ApplicationMetrics:
    """Return ApplicationMetrics for a single application row."""
    # Fetch keys belonging to this app
    keys = await prisma_client.db.litellm_verificationtoken.find_many(
        where={"application_id": app.application_id},
        include={},
    )
    key_tokens = [k.token for k in keys]
    key_count = len(key_tokens)

    total_tokens = 0
    total_cost = 0.0
    avg_latency_ms = 0.0
    error_rate = 0.0
    is_active = False

    if key_tokens:
        # Spend logs for the window
        spend_rows = await prisma_client.db.litellm_spendlogs.find_many(
            where={
                "api_key": {"in": key_tokens},
                "startTime": {"gte": start_dt, "lte": end_dt},
            }
        )

        if spend_rows:
            for row in spend_rows:
                total_tokens += row.total_tokens or 0
                total_cost += row.spend or 0.0

            # Latency: difference between completionStartTime and startTime in ms
            latencies = []
            errors = 0
            for row in spend_rows:
                if row.completionStartTime and row.startTime:
                    delta = (
                        row.completionStartTime - row.startTime
                    ).total_seconds() * 1000
                    if delta >= 0:
                        latencies.append(delta)
                if row.status == "failure":
                    errors += 1

            avg_latency_ms = (
                sum(latencies) / len(latencies) if latencies else 0.0
            )
            error_rate = errors / len(spend_rows)

        # Active check: any request in last 24h
        active_rows = await prisma_client.db.litellm_spendlogs.count(
            where={
                "api_key": {"in": key_tokens},
                "startTime": {"gte": active_since},
            }
        )
        is_active = active_rows > 0

    metrics = ApplicationMetrics(
        application_id=app.application_id,
        application_name=app.application_name,
        application_type=app.application_type,
        department=app.department,
        lob=app.lob,
        team_id=app.team_id,
        total_tokens=total_tokens,
        total_cost=total_cost,
        avg_latency_ms=avg_latency_ms,
        error_rate=error_rate,
        is_active=is_active,
        key_count=key_count,
    )
    metrics.health_check_url = app.health_check_url
    metrics.health_status = app.health_status or "unknown"
    metrics.last_health_check_at = (
        app.last_health_check_at.isoformat() if app.last_health_check_at else None
    )
    return metrics


# ─── cache helpers ──────────────────────────────────────────────────────────

_CACHE_STALENESS_SECONDS = int(
    os.environ.get("APPLICATION_METRICS_CACHE_STALENESS", 360)
)  # 6 min default


def _is_30d_window(start_dt: datetime, end_dt: datetime) -> bool:
    """
    Return True when the requested window is approximately the rolling 30-day
    window ending today — i.e. what the cache stores.

    Matches the UI's 'Last 30 days' preset (and any equivalent custom range).
    end_date must land on today or yesterday; window must be 28–32 days.
    """
    try:
        today = datetime.now(tz=timezone.utc).date()
        end_date = end_dt.date() if hasattr(end_dt, "date") else end_dt
        if abs((end_date - today).days) > 1:
            return False
        # Normalise to UTC-aware before subtraction to avoid TypeError when one
        # operand is naive (e.g. fromisoformat("2026-01-27")) and the other is
        # tz-aware (e.g. datetime.now(tz=utc)).
        _utc = timezone.utc

        def _as_aware(dt: datetime) -> datetime:
            return dt if dt.tzinfo is not None else dt.replace(tzinfo=_utc)

        window_days = (_as_aware(end_dt) - _as_aware(start_dt)).days
        return 28 <= window_days <= 32
    except Exception:
        return False


async def _get_cached_app_metrics(
    prisma_client: Any, app_ids: List[str]
) -> Optional[Dict[str, Any]]:
    """
    Return a dict keyed by application_id if a fresh cache exists for ALL
    requested apps.  Returns None if cache is stale or incomplete — caller
    falls back to live compute.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(seconds=_CACHE_STALENESS_SECONDS)
    rows = await prisma_client.db.litellm_applicationmetricscache.find_many(
        where={
            "application_id": {"in": app_ids},
            "computed_at": {"gte": cutoff},
        }
    )
    if len(rows) < len(app_ids):
        return None  # incomplete — some apps not yet cached
    return {r.application_id: r for r in rows}


# ─── CRUD endpoints ─────────────────────────────────────────────────────────


@router.post(
    "/application/new",
    tags=["application management"],
    dependencies=[Depends(user_api_key_auth)],
    summary="Create Application",
    responses={
        200: {"description": "The newly created application object"},
        403: {"description": "Forbidden — only proxy admins can create applications"},
    },
)
@management_endpoint_wrapper
async def new_application(
    data: NewApplicationRequest,
    http_request: Request,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    Create a new application. Admin only.

    Applications are first-class entities that group virtual keys, track usage
    metrics, and provide health monitoring for your AI-powered services.

    Parameters:
    - application_name: str — Unique name for the application.
    - application_type: str — One of "platform", "dev_tool", "custom_integration".
    - department: str — Department owning the application.
    - lob: str — Line of Business.
    - team_id: Optional[str] — Associated team ID.
    - description: Optional[str] — Description of the application.
    - labels: Optional[dict] — Arbitrary key/value metadata labels.
    - health_check_url: Optional[str] — URL to poll for application health status.

    Example:
    ```bash
    curl -X POST 'http://0.0.0.0:4000/application/new' \\
      -H 'Authorization: Bearer sk-1234' \\
      -H 'Content-Type: application/json' \\
      -d '{
        "application_name": "Invoice Processor",
        "application_type": "platform",
        "department": "Finance",
        "lob": "Commercial",
        "description": "IDP service for invoice extraction"
      }'
    ```
    """
    try:
        _require_admin(user_api_key_dict)
        prisma_client = await _get_prisma()

        create_data: Dict[str, Any] = {
            "application_name": data.application_name,
            "application_type": data.application_type.value,
            "department": data.department,
            "lob": data.lob,
            "created_by": user_api_key_dict.user_id or "admin",
            "updated_by": user_api_key_dict.user_id or "admin",
        }
        if data.team_id is not None:
            create_data["team_id"] = data.team_id
        if data.description is not None:
            create_data["description"] = data.description
        if data.labels is not None:
            create_data["labels"] = json.dumps(data.labels)
        if data.health_check_url is not None:
            create_data["health_check_url"] = data.health_check_url

        app = await prisma_client.db.litellm_applicationtable.create(data=create_data)
        return app.model_dump()
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"new_application error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )


@router.get(
    "/application/list",
    tags=["application management"],
    dependencies=[Depends(user_api_key_auth)],
    summary="List Applications",
    responses={
        200: {
            "description": "Paginated list of applications",
            "content": {
                "application/json": {
                    "example": {
                        "applications": [{"application_id": "app-abc", "application_name": "Invoice Processor", "application_type": "platform", "department": "Finance", "lob": "Commercial"}],
                        "total": 1,
                        "page": 1,
                        "page_size": 25,
                    }
                }
            },
        },
    },
)
@management_endpoint_wrapper
async def list_applications(
    http_request: Request,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
    application_type: Optional[str] = Query(default=None, description="Filter by application type ('platform', 'dev_tool', 'custom_integration')."),
    department: Optional[str] = Query(default=None, description="Filter by department name."),
    lob: Optional[str] = Query(default=None, description="Filter by line of business."),
    team_id: Optional[str] = Query(default=None, description="Filter by associated team ID."),
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)."),
    page_size: int = Query(default=25, ge=1, le=500, description="Number of records per page (max 500)."),
    sort_by: Optional[str] = Query(default="created_at", description="Sort field: 'created_at', 'updated_at', or 'application_name'."),
    sort_order: Optional[str] = Query(default="desc", description="Sort order: 'asc' or 'desc'."),
):
    """
    List applications with optional filters and pagination.

    Authorization:
    - Admin: sees all applications.
    - Non-admin: sees only applications belonging to their team.

    Example:
    ```bash
    curl -X GET 'http://0.0.0.0:4000/application/list?department=Finance&page=1&page_size=10' \\
      -H 'Authorization: Bearer sk-1234'
    ```
    """
    try:
        prisma_client = await _get_prisma()

        where: Dict[str, Any] = {}
        if application_type is not None:
            where["application_type"] = application_type
        if department is not None:
            where["department"] = department
        if lob is not None:
            where["lob"] = lob
        if team_id is not None:
            where["team_id"] = team_id

        # Non-admins can only see their team's apps
        if user_api_key_dict.user_role != LitellmUserRoles.PROXY_ADMIN:
            if user_api_key_dict.team_id is not None:
                where["team_id"] = user_api_key_dict.team_id
            else:
                return {"applications": [], "total": 0, "page": page, "page_size": page_size}

        skip = (page - 1) * page_size

        valid_sort = {"created_at", "updated_at", "application_name"}
        order_field = sort_by if sort_by in valid_sort else "created_at"
        order_dir = "desc" if sort_order == "desc" else "asc"

        apps = await prisma_client.db.litellm_applicationtable.find_many(
            where=where,
            skip=skip,
            take=page_size,
            order={order_field: order_dir},
        )
        total = await prisma_client.db.litellm_applicationtable.count(where=where)

        return {
            "applications": [a.model_dump() for a in apps],
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"list_applications error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )


@router.get(
    "/application/info",
    tags=["application management"],
    dependencies=[Depends(user_api_key_auth)],
    summary="Get Application Info",
    responses={
        200: {"description": "Application details"},
        404: {"description": "Application not found"},
    },
)
@management_endpoint_wrapper
async def application_info(
    http_request: Request,
    application_id: str = Query(..., description="The unique application ID to retrieve."),
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    Get details for a single application by application_id.

    Parameters:
    - application_id: str — The unique application ID.

    Example:
    ```bash
    curl -X GET 'http://0.0.0.0:4000/application/info?application_id=app-abc' \\
      -H 'Authorization: Bearer sk-1234'
    ```
    """
    try:
        prisma_client = await _get_prisma()
        app = await _get_app_or_404(prisma_client, application_id)
        return app.model_dump()
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"application_info error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )


@router.patch(
    "/application/update",
    tags=["application management"],
    dependencies=[Depends(user_api_key_auth)],
    summary="Update Application",
    responses={
        200: {"description": "The updated application object"},
        403: {"description": "Forbidden — only proxy admins can update applications"},
        404: {"description": "Application not found"},
    },
)
@management_endpoint_wrapper
async def update_application(
    data: UpdateApplicationRequest,
    http_request: Request,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    Update application metadata. Admin only.

    Performs a partial update — only fields present in the request body are changed.

    Parameters:
    - application_id: str — The application to update (required).
    - application_name: Optional[str] — New name.
    - application_type: Optional[str] — New type.
    - department: Optional[str] — New department.
    - lob: Optional[str] — New line of business.
    - team_id: Optional[str] — New team association.
    - description: Optional[str] — New description.
    - labels: Optional[dict] — New metadata labels.
    - health_check_url: Optional[str] — New health check URL.

    Example:
    ```bash
    curl -X PATCH 'http://0.0.0.0:4000/application/update' \\
      -H 'Authorization: Bearer sk-1234' \\
      -H 'Content-Type: application/json' \\
      -d '{
        "application_id": "app-abc",
        "department": "Engineering",
        "health_check_url": "https://my-app.example.com/health"
      }'
    ```
    """
    try:
        _require_admin(user_api_key_dict)
        prisma_client = await _get_prisma()
        await _get_app_or_404(prisma_client, data.application_id)

        update_data: Dict[str, Any] = {
            "updated_by": user_api_key_dict.user_id or "admin"
        }
        if data.application_name is not None:
            update_data["application_name"] = data.application_name
        if data.application_type is not None:
            update_data["application_type"] = data.application_type.value
        if data.department is not None:
            update_data["department"] = data.department
        if data.lob is not None:
            update_data["lob"] = data.lob
        if data.team_id is not None:
            update_data["team_id"] = data.team_id
        if data.description is not None:
            update_data["description"] = data.description
        if data.labels is not None:
            update_data["labels"] = json.dumps(data.labels)
        if data.health_check_url is not None:
            update_data["health_check_url"] = data.health_check_url

        app = await prisma_client.db.litellm_applicationtable.update(
            where={"application_id": data.application_id},
            data=update_data,
        )
        return app.model_dump()
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"update_application error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )


@router.delete(
    "/application/delete",
    tags=["application management"],
    dependencies=[Depends(user_api_key_auth)],
    summary="Delete Application",
    responses={
        200: {
            "description": "Application deleted",
            "content": {"application/json": {"example": {"deleted": True, "application_id": "app-abc"}}},
        },
        403: {"description": "Forbidden — only proxy admins can delete applications"},
        404: {"description": "Application not found"},
    },
)
@management_endpoint_wrapper
async def delete_application(
    http_request: Request,
    application_id: str = Query(..., description="The unique application ID to delete."),
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    Delete an application by application_id. Admin only.

    Also unlinks any virtual keys that were assigned to this application.

    Parameters:
    - application_id: str — The application to delete.

    Example:
    ```bash
    curl -X DELETE 'http://0.0.0.0:4000/application/delete?application_id=app-abc' \\
      -H 'Authorization: Bearer sk-1234'
    ```
    """
    try:
        _require_admin(user_api_key_dict)
        prisma_client = await _get_prisma()
        await _get_app_or_404(prisma_client, application_id)

        # Unlink any keys pointing to this app
        await prisma_client.db.litellm_verificationtoken.update_many(
            where={"application_id": application_id},
            data={"application_id": None},
        )

        await prisma_client.db.litellm_applicationtable.delete(
            where={"application_id": application_id}
        )
        return {"deleted": True, "application_id": application_id}
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"delete_application error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )


# ─── Key assign / unassign ──────────────────────────────────────────────────


@router.get(
    "/application/{app_id}/keys",
    tags=["application management"],
    dependencies=[Depends(user_api_key_auth)],
    summary="List Application Keys",
    responses={
        200: {
            "description": "List of virtual keys assigned to the application",
            "content": {"application/json": {"example": {"application_id": "app-abc", "keys": [{"token": "sk-...", "key_alias": "prod-key"}]}}},
        },
        404: {"description": "Application not found"},
    },
)
@management_endpoint_wrapper
async def application_keys(
    app_id: str,
    http_request: Request,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    List all virtual keys belonging to an application.

    Parameters:
    - app_id: str — The application ID (path parameter).

    Example:
    ```bash
    curl -X GET 'http://0.0.0.0:4000/application/app-abc/keys' \\
      -H 'Authorization: Bearer sk-1234'
    ```
    """
    try:
        prisma_client = await _get_prisma()
        await _get_app_or_404(prisma_client, app_id)

        keys = await prisma_client.db.litellm_verificationtoken.find_many(
            where={"application_id": app_id}
        )
        return {"application_id": app_id, "keys": [k.model_dump() for k in keys]}
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"application_keys error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )


@router.post(
    "/application/{app_id}/keys/assign",
    tags=["application management"],
    dependencies=[Depends(user_api_key_auth)],
    summary="Assign Key to Application",
    responses={
        200: {
            "description": "Key successfully assigned",
            "content": {"application/json": {"example": {"application_id": "app-abc", "key_token": "sk-...", "assigned": True}}},
        },
        403: {"description": "Forbidden — only proxy admins can assign keys"},
        404: {"description": "Application or key not found"},
    },
)
@management_endpoint_wrapper
async def assign_key_to_application(
    app_id: str,
    http_request: Request,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
    key_token: str = Query(..., description="Hashed token of the virtual key to assign"),
):
    """
    Assign an existing virtual key to this application. Admin only.

    Links a virtual key to an application for usage tracking and grouping.

    Parameters:
    - app_id: str — The application ID (path parameter).
    - key_token: str — Hashed token of the virtual key to assign.

    Example:
    ```bash
    curl -X POST 'http://0.0.0.0:4000/application/app-abc/keys/assign?key_token=sk-hashed-token' \\
      -H 'Authorization: Bearer sk-1234'
    ```
    """
    try:
        _require_admin(user_api_key_dict)
        prisma_client = await _get_prisma()
        await _get_app_or_404(prisma_client, app_id)

        key = await prisma_client.db.litellm_verificationtoken.find_unique(
            where={"token": key_token}
        )
        if key is None:
            raise HTTPException(
                status_code=404,
                detail={"error": f"Key {key_token} not found"},
            )

        await prisma_client.db.litellm_verificationtoken.update(
            where={"token": key_token},
            data={"application_id": app_id},
        )
        return {"application_id": app_id, "key_token": key_token, "assigned": True}
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"assign_key_to_application error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )


@router.post(
    "/application/{app_id}/keys/unassign",
    tags=["application management"],
    dependencies=[Depends(user_api_key_auth)],
    summary="Unassign Key from Application",
    responses={
        200: {
            "description": "Key successfully unassigned",
            "content": {"application/json": {"example": {"application_id": "app-abc", "key_token": "sk-...", "unassigned": True}}},
        },
        403: {"description": "Forbidden — only proxy admins can unassign keys"},
        404: {"description": "Key not found or not assigned to this application"},
    },
)
@management_endpoint_wrapper
async def unassign_key_from_application(
    app_id: str,
    http_request: Request,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
    key_token: str = Query(..., description="Hashed token of the virtual key to unassign"),
):
    """
    Remove a virtual key from this application. Admin only.

    Unlinks the key from the application. The key itself is not deleted.

    Parameters:
    - app_id: str — The application ID (path parameter).
    - key_token: str — Hashed token of the virtual key to unassign.

    Example:
    ```bash
    curl -X POST 'http://0.0.0.0:4000/application/app-abc/keys/unassign?key_token=sk-hashed-token' \\
      -H 'Authorization: Bearer sk-1234'
    ```
    """
    try:
        _require_admin(user_api_key_dict)
        prisma_client = await _get_prisma()

        key = await prisma_client.db.litellm_verificationtoken.find_unique(
            where={"token": key_token}
        )
        if key is None or key.application_id != app_id:
            raise HTTPException(
                status_code=404,
                detail={"error": f"Key {key_token} not assigned to application {app_id}"},
            )

        await prisma_client.db.litellm_verificationtoken.update(
            where={"token": key_token},
            data={"application_id": None},
        )
        return {"application_id": app_id, "key_token": key_token, "unassigned": True}
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"unassign_key_from_application error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )


# ─── Metrics endpoints ──────────────────────────────────────────────────────


@router.get(
    "/application/{app_id}/metrics",
    tags=["application management"],
    dependencies=[Depends(user_api_key_auth)],
    response_model=ApplicationMetrics,
    summary="Get Application Metrics",
    responses={
        200: {"description": "Per-application observability metrics"},
        404: {"description": "Application not found"},
    },
)
@management_endpoint_wrapper
async def application_metrics(
    app_id: str,
    http_request: Request,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
    start_date: Optional[str] = Query(default=None, description="ISO 8601 start date (defaults to 30 days before end_date)."),
    end_date: Optional[str] = Query(default=None, description="ISO 8601 end date (defaults to now)."),
):
    """
    Per-application observability metrics.

    Returns token usage, cost, latency, error rate, active status, key count,
    and health check status for a specific application.

    Metrics window defaults to the last 30 days if not specified.
    Active status is always evaluated against the last 24 hours.

    Parameters:
    - app_id: str — The application ID (path parameter).
    - start_date: Optional[str] — ISO 8601 start date for the metrics window.
    - end_date: Optional[str] — ISO 8601 end date for the metrics window.

    Example:
    ```bash
    curl -X GET 'http://0.0.0.0:4000/application/app-abc/metrics?start_date=2026-01-01T00:00:00Z' \\
      -H 'Authorization: Bearer sk-1234'
    ```
    """
    try:
        prisma_client = await _get_prisma()
        app = await _get_app_or_404(prisma_client, app_id)

        now = datetime.now(tz=timezone.utc)
        end_dt = datetime.fromisoformat(end_date) if end_date else now
        start_dt = (
            datetime.fromisoformat(start_date)
            if start_date
            else end_dt - timedelta(days=30)
        )
        active_since = now - timedelta(hours=24)

        # Attempt cache hit for ~30-day windows
        if _is_30d_window(start_dt, end_dt):
            try:
                cache = await _get_cached_app_metrics(prisma_client, [app_id])
            except Exception:
                cache = None
            if cache is not None:
                row = cache[app_id]
                metrics = ApplicationMetrics(
                    application_id=app.application_id,
                    application_name=app.application_name,
                    application_type=app.application_type,
                    department=app.department,
                    lob=app.lob,
                    team_id=app.team_id,
                    total_tokens=int(row.total_tokens),
                    total_cost=float(row.total_cost),
                    avg_latency_ms=float(row.avg_latency_ms),
                    error_rate=float(row.error_rate),
                    is_active=bool(row.is_active),
                    key_count=int(row.key_count),
                )
                metrics.health_check_url = app.health_check_url
                metrics.health_status = app.health_status or "unknown"
                metrics.last_health_check_at = (
                    app.last_health_check_at.isoformat()
                    if app.last_health_check_at
                    else None
                )
                return metrics

        metrics = await _compute_app_metrics(
            prisma_client, app, start_dt, end_dt, active_since
        )
        return metrics
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"application_metrics error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )


@router.get(
    "/application/health",
    tags=["application management"],
    dependencies=[Depends(user_api_key_auth)],
    response_model=ApplicationHealthResponse,
    summary="Application Health Dashboard",
    responses={
        200: {"description": "Aggregate health metrics across all applications"},
    },
)
@management_endpoint_wrapper
async def application_health(
    http_request: Request,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
    start_date: Optional[str] = Query(default=None, description="ISO 8601 start date (defaults to 30 days before end_date)."),
    end_date: Optional[str] = Query(default=None, description="ISO 8601 end date (defaults to now)."),
    application_type: Optional[str] = Query(default=None, description="Filter by application type."),
    department: Optional[str] = Query(default=None, description="Filter by department."),
    lob: Optional[str] = Query(default=None, description="Filter by line of business."),
):
    """
    All-apps health dashboard aggregate.

    Returns per-app metrics plus totals for active apps, total apps, etc.
    Default metrics window: last 30 days. Active status is evaluated
    against the last 24 hours.

    Authorization:
    - Admin: sees all applications.
    - Non-admin: sees only applications belonging to their team.

    Parameters:
    - start_date: Optional[str] — ISO 8601 start date.
    - end_date: Optional[str] — ISO 8601 end date.
    - application_type: Optional[str] — Filter by type.
    - department: Optional[str] — Filter by department.
    - lob: Optional[str] — Filter by line of business.

    Example:
    ```bash
    curl -X GET 'http://0.0.0.0:4000/application/health?department=Finance' \\
      -H 'Authorization: Bearer sk-1234'
    ```
    """
    try:
        prisma_client = await _get_prisma()

        now = datetime.now(tz=timezone.utc)
        end_dt = datetime.fromisoformat(end_date) if end_date else now
        start_dt = (
            datetime.fromisoformat(start_date)
            if start_date
            else end_dt - timedelta(days=30)
        )
        active_since = now - timedelta(hours=24)

        where: Dict[str, Any] = {}
        if application_type:
            where["application_type"] = application_type
        if department:
            where["department"] = department
        if lob:
            where["lob"] = lob

        # Non-admins restricted to their team
        if user_api_key_dict.user_role != LitellmUserRoles.PROXY_ADMIN:
            if user_api_key_dict.team_id:
                where["team_id"] = user_api_key_dict.team_id
            else:
                return ApplicationHealthResponse(
                    applications=[],
                    total_apps=0,
                    active_apps=0,
                    time_window_start=start_dt.isoformat(),
                    time_window_end=end_dt.isoformat(),
                )

        apps = await prisma_client.db.litellm_applicationtable.find_many(where=where)

        app_metrics: List[ApplicationMetrics] = []

        # Attempt cache hit for ~30-day windows (all apps must be present + fresh)
        if apps and _is_30d_window(start_dt, end_dt):
            app_ids = [a.application_id for a in apps]
            try:
                cache = await _get_cached_app_metrics(prisma_client, app_ids)
            except Exception:
                cache = None
            if cache is not None:
                for app in apps:
                    row = cache[app.application_id]
                    m = ApplicationMetrics(
                        application_id=app.application_id,
                        application_name=app.application_name,
                        application_type=app.application_type,
                        department=app.department,
                        lob=app.lob,
                        team_id=app.team_id,
                        total_tokens=int(row.total_tokens),
                        total_cost=float(row.total_cost),
                        avg_latency_ms=float(row.avg_latency_ms),
                        error_rate=float(row.error_rate),
                        is_active=bool(row.is_active),
                        key_count=int(row.key_count),
                    )
                    m.health_check_url = app.health_check_url
                    m.health_status = app.health_status or "unknown"
                    m.last_health_check_at = (
                        app.last_health_check_at.isoformat()
                        if app.last_health_check_at
                        else None
                    )
                    app_metrics.append(m)
                active_count = sum(1 for m in app_metrics if m.is_active)
                return ApplicationHealthResponse(
                    applications=app_metrics,
                    total_apps=len(app_metrics),
                    active_apps=active_count,
                    time_window_start=start_dt.isoformat(),
                    time_window_end=end_dt.isoformat(),
                )

        for app in apps:
            m = await _compute_app_metrics(
                prisma_client, app, start_dt, end_dt, active_since
            )
            app_metrics.append(m)

        active_count = sum(1 for m in app_metrics if m.is_active)

        return ApplicationHealthResponse(
            applications=app_metrics,
            total_apps=len(app_metrics),
            active_apps=active_count,
            time_window_start=start_dt.isoformat(),
            time_window_end=end_dt.isoformat(),
        )
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"application_health error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )


# ─── Config endpoints ────────────────────────────────────────────────────────


@router.get(
    "/application/config",
    tags=["application management"],
    dependencies=[Depends(user_api_key_auth)],
    summary="Get Application Config",
    responses={
        200: {
            "description": "Application configuration (departments and lines of business)",
            "content": {
                "application/json": {
                    "example": {
                        "departments": ["Engineering", "Finance", "Operations"],
                        "lines_of_business": ["Retail", "Commercial", "Wealth"],
                    }
                }
            },
        },
    },
)
@management_endpoint_wrapper
async def get_application_config(
    http_request: Request,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    Get configured department and line-of-business lists.

    Returns the available dropdown options used when creating or updating applications.

    Example:
    ```bash
    curl -X GET 'http://0.0.0.0:4000/application/config' \\
      -H 'Authorization: Bearer sk-1234'
    ```
    """
    try:
        prisma_client = await _get_prisma()
        config = await _read_app_config(prisma_client)
        return config
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"get_application_config error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )


@router.post(
    "/application/config/update",
    tags=["application management"],
    dependencies=[Depends(user_api_key_auth)],
    summary="Update Application Config",
    responses={
        200: {
            "description": "Updated application configuration",
            "content": {
                "application/json": {
                    "example": {
                        "departments": ["Engineering", "Finance", "Operations"],
                        "lines_of_business": ["Retail", "Commercial", "Wealth"],
                    }
                }
            },
        },
        403: {"description": "Forbidden — only proxy admins can update config"},
    },
)
@management_endpoint_wrapper
async def update_application_config(
    http_request: Request,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    Update department / line-of-business lists. Admin only.

    Merges the provided fields into the existing config. Only the fields
    included in the request body are updated.

    Request body (JSON):
    ```json
    {
        "departments": ["Engineering", "Finance", "Operations"],
        "lines_of_business": ["Retail", "Commercial", "Wealth"]
    }
    ```

    Example:
    ```bash
    curl -X POST 'http://0.0.0.0:4000/application/config/update' \\
      -H 'Authorization: Bearer sk-1234' \\
      -H 'Content-Type: application/json' \\
      -d '{"departments": ["Engineering", "Finance", "Operations"]}'
    ```
    """
    try:
        _require_admin(user_api_key_dict)
        prisma_client = await _get_prisma()

        body = await http_request.json()
        config: Dict[str, Any] = {}
        if "departments" in body:
            config["departments"] = body["departments"]
        if "lines_of_business" in body:
            config["lines_of_business"] = body["lines_of_business"]

        existing = await _read_app_config(prisma_client)
        existing.update(config)
        await _write_app_config(prisma_client, existing)
        return existing
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"update_application_config error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )
