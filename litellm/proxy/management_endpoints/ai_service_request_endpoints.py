"""
AI SERVICE REQUEST TRACKING

Endpoints for tracking async AI service requests submitted via pass-through endpoints.

GET  /ai-services/requests/{request_id}    — Poll for request status
POST /ai-services/requests/{request_id}/result — Callback from downstream service
GET  /ai-services/requests                  — List recent requests
"""

import json
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, Request

from litellm._logging import verbose_proxy_logger
from litellm.proxy._types import (
    AIServiceRequestResponse,
    AIServiceResultCallback,
    LitellmUserRoles,
    ProxyException,
    UserAPIKeyAuth,
)
from litellm.proxy.auth.user_api_key_auth import user_api_key_auth
from litellm.proxy.utils import PrismaClient

router = APIRouter()


async def _get_prisma() -> PrismaClient:
    from litellm.proxy.proxy_server import prisma_client

    if prisma_client is None:
        raise HTTPException(
            status_code=500, detail={"error": "No database connected"}
        )
    return prisma_client


def _is_admin(user_api_key_dict: UserAPIKeyAuth) -> bool:
    return user_api_key_dict.user_role == LitellmUserRoles.PROXY_ADMIN


def _parse_json_field(value: Any) -> Optional[dict]:
    """Parse a JSON field that may be a string or dict."""
    if value is None:
        return None
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError) as e:
            verbose_proxy_logger.warning(
                "Failed to parse JSON field: %s", str(e)
            )
            return None
    return None


@router.get(
    "/ai-services/requests/{request_id}",
    tags=["ai service requests"],
    dependencies=[Depends(user_api_key_auth)],
    response_model=AIServiceRequestResponse,
)
async def get_ai_service_request(
    request_id: str,
    http_request: Request,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """Get status of a specific AI service request."""
    try:
        prisma_client = await _get_prisma()

        record = await prisma_client.db.litellm_aiservicerequest.find_unique(
            where={"request_id": request_id}
        )
        if record is None:
            raise HTTPException(
                status_code=404,
                detail={"error": f"AI service request {request_id} not found"},
            )

        # Non-admins can only see their own requests
        if not _is_admin(user_api_key_dict):
            if record.user_id != user_api_key_dict.user_id:
                raise HTTPException(
                    status_code=403,
                    detail={"error": "You can only view your own requests"},
                )

        return AIServiceRequestResponse(
            request_id=record.request_id,
            service_type=record.service_type,
            status=record.status,
            request_body=_parse_json_field(record.request_body),
            response_body=_parse_json_field(record.response_body),
            error=record.error,
            created_at=record.created_at.isoformat() if record.created_at else None,
            updated_at=record.updated_at.isoformat() if record.updated_at else None,
        )
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"get_ai_service_request error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )


@router.post(
    "/ai-services/requests/{request_id}/result",
    tags=["ai service requests"],
    dependencies=[Depends(user_api_key_auth)],
)
async def post_ai_service_result(
    request_id: str,
    data: AIServiceResultCallback,
    http_request: Request,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    Callback endpoint for downstream services to post results.

    Only admins or the original request owner can update a request.
    The downstream Lambda or service should use a dedicated admin API key
    to authenticate and update the request status.
    """
    try:
        prisma_client = await _get_prisma()

        record = await prisma_client.db.litellm_aiservicerequest.find_unique(
            where={"request_id": request_id}
        )
        if record is None:
            raise HTTPException(
                status_code=404,
                detail={"error": f"AI service request {request_id} not found"},
            )

        # Only admins or the original request owner can post results
        if not _is_admin(user_api_key_dict):
            if record.user_id != user_api_key_dict.user_id:
                raise HTTPException(
                    status_code=403,
                    detail={"error": "Only admins or the request owner can post results"},
                )

        update_data: Dict[str, Any] = {"status": data.status}
        if data.response_body is not None:
            update_data["response_body"] = data.response_body
        if data.error is not None:
            update_data["error"] = data.error

        updated = await prisma_client.db.litellm_aiservicerequest.update(
            where={"request_id": request_id},
            data=update_data,
        )

        return {
            "request_id": updated.request_id,
            "status": updated.status,
            "updated": True,
            "updated_at": updated.updated_at.isoformat() if updated.updated_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"post_ai_service_result error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )


@router.get(
    "/ai-services/requests",
    tags=["ai service requests"],
    dependencies=[Depends(user_api_key_auth)],
)
async def list_ai_service_requests(
    http_request: Request,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
    status: Optional[str] = Query(default=None, description="Filter by status"),
    service_type: Optional[str] = Query(default=None, max_length=100, description="Filter by service type"),
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=25, ge=1, le=100),
):
    """
    List recent AI service requests.

    Admins see all requests; non-admins see only their own.
    """
    try:
        prisma_client = await _get_prisma()

        where: Dict[str, Any] = {}
        if status is not None:
            where["status"] = status
        if service_type is not None:
            where["service_type"] = service_type

        # Non-admins can only see their own requests
        if not _is_admin(user_api_key_dict):
            where["user_id"] = user_api_key_dict.user_id

        skip = (page - 1) * page_size

        records = await prisma_client.db.litellm_aiservicerequest.find_many(
            where=where,
            skip=skip,
            take=page_size,
            order={"created_at": "desc"},
        )
        total = await prisma_client.db.litellm_aiservicerequest.count(where=where)

        requests = []
        for r in records:
            requests.append(
                AIServiceRequestResponse(
                    request_id=r.request_id,
                    service_type=r.service_type,
                    status=r.status,
                    request_body=_parse_json_field(r.request_body),
                    response_body=_parse_json_field(r.response_body),
                    error=r.error,
                    created_at=r.created_at.isoformat() if r.created_at else None,
                    updated_at=r.updated_at.isoformat() if r.updated_at else None,
                ).model_dump()
            )

        return {
            "requests": requests,
            "total": total,
            "page": page,
            "page_size": page_size,
        }
    except HTTPException:
        raise
    except Exception as e:
        verbose_proxy_logger.exception(f"list_ai_service_requests error: {e}")
        raise ProxyException(
            message=str(e),
            type="internal_server_error",
            param=None,
            code=500,
        )
