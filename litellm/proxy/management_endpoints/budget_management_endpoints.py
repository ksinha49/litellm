"""
BUDGET MANAGEMENT

All /budget management endpoints

/budget/new
/budget/info
/budget/update
/budget/delete
/budget/settings
/budget/list
"""

#### BUDGET TABLE MANAGEMENT ####
import asyncio
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException

from litellm._logging import verbose_proxy_logger
from litellm.litellm_core_utils.duration_parser import duration_in_seconds
from litellm.proxy._types import *
from litellm.proxy.auth.auth_checks import _delete_cache_key_object
from litellm.proxy.auth.user_api_key_auth import user_api_key_auth
from litellm.proxy.utils import jsonify_object

router = APIRouter()


@router.post(
    "/budget/new",
    tags=["budget management"],
    dependencies=[Depends(user_api_key_auth)],
)
async def new_budget(
    budget_obj: BudgetNewRequest,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    Create a new budget object. Can apply this to teams, orgs, end-users, keys.

    Parameters:
    - budget_duration: Optional[str] - Budget reset period ("30d", "1h", etc.)
    - budget_id: Optional[str] - The id of the budget. If not provided, a new id will be generated.
    - max_budget: Optional[float] - The max budget for the budget.
    - soft_budget: Optional[float] - The soft budget for the budget.
    - max_parallel_requests: Optional[int] - The max number of parallel requests for the budget.
    - tpm_limit: Optional[int] - The tokens per minute limit for the budget.
    - rpm_limit: Optional[int] - The requests per minute limit for the budget.
    - model_max_budget: Optional[dict] - Specify max budget for a given model. Example: {"openai/gpt-4o-mini": {"max_budget": 100.0, "budget_duration": "1d", "tpm_limit": 100000, "rpm_limit": 100000}}
    - budget_reset_at: Optional[datetime] - Datetime when the initial budget is reset. Default is now.
    """
    from litellm.proxy.proxy_server import litellm_proxy_admin_name, prisma_client

    if prisma_client is None:
        raise HTTPException(
            status_code=500,
            detail={"error": CommonProxyErrors.db_not_connected_error.value},
        )

    # if no budget_reset_at date is set, but a budget_duration is given, then set budget_reset_at initially to the first completed duration interval in future
    if budget_obj.budget_reset_at is None and budget_obj.budget_duration is not None:
        budget_obj.budget_reset_at = datetime.utcnow() + timedelta(
            seconds=duration_in_seconds(duration=budget_obj.budget_duration)
        )

    budget_obj_json = budget_obj.model_dump(exclude_none=True)
    budget_obj_jsonified = jsonify_object(budget_obj_json)  # json dump any dictionaries
    response = await prisma_client.db.litellm_budgettable.create(
        data={
            **budget_obj_jsonified,  # type: ignore
            "created_by": user_api_key_dict.user_id or litellm_proxy_admin_name,
            "updated_by": user_api_key_dict.user_id or litellm_proxy_admin_name,
        }  # type: ignore
    )

    return response


async def _invalidate_budget_related_caches(
    budget_id: str,
    prisma_client: Any,
    user_api_key_cache: Any,
    proxy_logging_obj: Any,
) -> Dict[str, int]:
    """
    Invalidate all caches for entities that reference a budget_id.

    This is critical when budget limits are updated - all cached objects using that
    budget must be invalidated so they fetch fresh budget data.

    Args:
        budget_id: The budget_id that was updated
        prisma_client: Database client
        user_api_key_cache: Cache instance
        proxy_logging_obj: Logging object with Redis cache access

    Returns:
        Dict with counts of invalidated objects: {"keys": n, "end_users": n, "teams": n}
    """
    from litellm.proxy.utils import hash_token

    counts = {"keys": 0, "end_users": 0, "teams": 0, "team_memberships": 0}

    try:
        # 1. Invalidate all keys with this budget_id
        keys_with_budget = await prisma_client.db.litellm_verificationtoken.find_many(
            where={"budget_id": budget_id},
            select={"token": True}
        )

        for key_row in keys_with_budget:
            try:
                await _delete_cache_key_object(
                    hashed_token=key_row.token,  # Token is already hashed in DB
                    user_api_key_cache=user_api_key_cache,
                    proxy_logging_obj=proxy_logging_obj,
                )
                counts["keys"] += 1
            except Exception as e:
                verbose_proxy_logger.warning(
                    f"Failed to invalidate key cache for token={key_row.token}: {e}"
                )

        # 2. Invalidate all end users with this budget_id
        end_users_with_budget = await prisma_client.db.litellm_endusertable.find_many(
            where={"budget_id": budget_id},
            select={"user_id": True}
        )

        for end_user_row in end_users_with_budget:
            try:
                # End users are cached as "end_user_id:{user_id}"
                cache_key = f"end_user_id:{end_user_row.user_id}"
                user_api_key_cache.delete_cache(key=cache_key)
                if proxy_logging_obj is not None:
                    await proxy_logging_obj.internal_usage_cache.dual_cache.async_delete_cache(
                        key=cache_key
                    )
                counts["end_users"] += 1
            except Exception as e:
                verbose_proxy_logger.warning(
                    f"Failed to invalidate end user cache for user_id={end_user_row.user_id}: {e}"
                )

        # 3. Invalidate team memberships with this budget_id
        # Team memberships have their own cache: "team_membership:{user_id}:{team_id}"
        team_memberships_with_budget = await prisma_client.db.litellm_teammembership.find_many(
            where={"budget_id": budget_id},
            select={"user_id": True, "team_id": True}
        )

        for membership_row in team_memberships_with_budget:
            try:
                cache_key = f"team_membership:{membership_row.user_id}:{membership_row.team_id}"
                user_api_key_cache.delete_cache(key=cache_key)
                if proxy_logging_obj is not None:
                    await proxy_logging_obj.internal_usage_cache.dual_cache.async_delete_cache(
                        key=cache_key
                    )
                counts["team_memberships"] += 1
            except Exception as e:
                verbose_proxy_logger.warning(
                    f"Failed to invalidate team membership cache: {e}"
                )

        # 4. Note: Organizations reference budgets but are not cached currently
        # If organization caching is added in the future, add invalidation here

        verbose_proxy_logger.info(
            f"Budget cache invalidation for budget_id={budget_id}: "
            f"Invalidated {counts['keys']} keys, {counts['end_users']} end users, "
            f"{counts['team_memberships']} team memberships"
        )

    except Exception as e:
        verbose_proxy_logger.error(
            f"Error during budget cache invalidation for budget_id={budget_id}: {e}"
        )
        # Don't raise - cache invalidation failure shouldn't break budget updates

    return counts


@router.post(
    "/budget/update",
    tags=["budget management"],
    dependencies=[Depends(user_api_key_auth)],
)
async def update_budget(
    budget_obj: BudgetNewRequest,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    Update an existing budget object.

    Parameters:
    - budget_duration: Optional[str] - Budget reset period ("30d", "1h", etc.)
    - budget_id: Optional[str] - The id of the budget. If not provided, a new id will be generated.
    - max_budget: Optional[float] - The max budget for the budget.
    - soft_budget: Optional[float] - The soft budget for the budget.
    - max_parallel_requests: Optional[int] - The max number of parallel requests for the budget.
    - tpm_limit: Optional[int] - The tokens per minute limit for the budget.
    - rpm_limit: Optional[int] - The requests per minute limit for the budget.
    - model_max_budget: Optional[dict] - Specify max budget for a given model. Example: {"openai/gpt-4o-mini": {"max_budget": 100.0, "budget_duration": "1d", "tpm_limit": 100000, "rpm_limit": 100000}}
    - budget_reset_at: Optional[datetime] - Update the Datetime when the budget was last reset.
    """
    from litellm.proxy.proxy_server import litellm_proxy_admin_name, prisma_client

    if prisma_client is None:
        raise HTTPException(
            status_code=500,
            detail={"error": CommonProxyErrors.db_not_connected_error.value},
        )
    if budget_obj.budget_id is None:
        raise HTTPException(status_code=400, detail={"error": "budget_id is required"})

    response = await prisma_client.db.litellm_budgettable.update(
        where={"budget_id": budget_obj.budget_id},
        data={
            **budget_obj.model_dump(exclude_none=True),  # type: ignore
            "updated_by": user_api_key_dict.user_id or litellm_proxy_admin_name,
        },  # type: ignore
    )

    # CRITICAL: Invalidate all caches for entities referencing this budget
    # This ensures budget checks use the NEW budget limits immediately
    from litellm.proxy.proxy_server import user_api_key_cache, proxy_logging_obj

    asyncio.create_task(
        _invalidate_budget_related_caches(
            budget_id=budget_obj.budget_id,
            prisma_client=prisma_client,
            user_api_key_cache=user_api_key_cache,
            proxy_logging_obj=proxy_logging_obj,
        )
    )

    return response


@router.post(
    "/budget/info",
    tags=["budget management"],
    dependencies=[Depends(user_api_key_auth)],
)
async def info_budget(data: BudgetRequest):
    """
    Get the budget id specific information

    Parameters:
    - budgets: List[str] - The list of budget ids to get information for
    """
    from litellm.proxy.proxy_server import prisma_client

    if prisma_client is None:
        raise HTTPException(status_code=500, detail={"error": "No db connected"})

    if len(data.budgets) == 0:
        raise HTTPException(
            status_code=400,
            detail={
                "error": f"Specify list of budget id's to query. Passed in={data.budgets}"
            },
        )
    response = await prisma_client.db.litellm_budgettable.find_many(
        where={"budget_id": {"in": data.budgets}},
    )

    return response


@router.get(
    "/budget/settings",
    tags=["budget management"],
    dependencies=[Depends(user_api_key_auth)],
)
async def budget_settings(
    budget_id: str,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    Get list of configurable params + current value for a budget item + description of each field

    Used on Admin UI.

    Query Parameters:
    - budget_id: str - The budget id to get information for
    """
    from litellm.proxy.proxy_server import prisma_client

    if prisma_client is None:
        raise HTTPException(
            status_code=400,
            detail={"error": CommonProxyErrors.db_not_connected_error.value},
        )

    if user_api_key_dict.user_role != LitellmUserRoles.PROXY_ADMIN:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "{}, your role={}".format(
                    CommonProxyErrors.not_allowed_access.value,
                    user_api_key_dict.user_role,
                )
            },
        )

    ## get budget item from db
    db_budget_row = await prisma_client.db.litellm_budgettable.find_first(
        where={"budget_id": budget_id}
    )

    if db_budget_row is not None:
        db_budget_row_dict = db_budget_row.model_dump(exclude_none=True)
    else:
        db_budget_row_dict = {}

    allowed_args = {
        "max_parallel_requests": {"type": "Integer"},
        "tpm_limit": {"type": "Integer"},
        "rpm_limit": {"type": "Integer"},
        "budget_duration": {"type": "String"},
        "max_budget": {"type": "Float"},
        "soft_budget": {"type": "Float"},
    }

    return_val = []

    for field_name, field_info in BudgetNewRequest.model_fields.items():
        if field_name in allowed_args:
            _stored_in_db = True

            _response_obj = ConfigList(
                field_name=field_name,
                field_type=allowed_args[field_name]["type"],
                field_description=field_info.description or "",
                field_value=db_budget_row_dict.get(field_name, None),
                stored_in_db=_stored_in_db,
                field_default_value=field_info.default,
            )
            return_val.append(_response_obj)

    return return_val


@router.get(
    "/budget/list",
    tags=["budget management"],
    dependencies=[Depends(user_api_key_auth)],
)
async def list_budget(
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """List all the created budgets in proxy db. Used on Admin UI."""
    from litellm.proxy.proxy_server import prisma_client

    if prisma_client is None:
        raise HTTPException(
            status_code=400,
            detail={"error": CommonProxyErrors.db_not_connected_error.value},
        )

    if user_api_key_dict.user_role != LitellmUserRoles.PROXY_ADMIN:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "{}, your role={}".format(
                    CommonProxyErrors.not_allowed_access.value,
                    user_api_key_dict.user_role,
                )
            },
        )

    response = await prisma_client.db.litellm_budgettable.find_many()

    return response


@router.post(
    "/budget/delete",
    tags=["budget management"],
    dependencies=[Depends(user_api_key_auth)],
)
async def delete_budget(
    data: BudgetDeleteRequest,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    Delete budget

    Parameters:
    - id: str - The budget id to delete
    """
    from litellm.proxy.proxy_server import prisma_client

    if prisma_client is None:
        raise HTTPException(
            status_code=500,
            detail={"error": CommonProxyErrors.db_not_connected_error.value},
        )

    if user_api_key_dict.user_role != LitellmUserRoles.PROXY_ADMIN:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "{}, your role={}".format(
                    CommonProxyErrors.not_allowed_access.value,
                    user_api_key_dict.user_role,
                )
            },
        )

    response = await prisma_client.db.litellm_budgettable.delete(
        where={"budget_id": data.id}
    )

    return response
