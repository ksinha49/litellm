import os
import sys
from typing import Dict, Optional, Any

import litellm
from litellm._logging import verbose_proxy_logger
from litellm.proxy.proxy_server import LiteLLM_TeamTable, UserAPIKeyAuth
from litellm.types.guardrails import *

sys.path.insert(
    0, os.path.abspath("../..")
)  # Adds the parent directory to the system path


def can_modify_guardrails(team_obj: Optional[LiteLLM_TeamTable]) -> bool:
    if team_obj is None:
        return True

    team_metadata = team_obj.metadata or {}

    if team_metadata.get("guardrails", None) is not None and isinstance(
        team_metadata.get("guardrails"), Dict
    ):
        if team_metadata.get("guardrails", {}).get("modify_guardrails", None) is False:
            return False

    return True


async def should_proceed_based_on_metadata(data: dict, guardrail_name: str) -> bool:
    """
    checks if this guardrail should be applied to this call
    """
    if "metadata" in data and isinstance(data["metadata"], dict):
        if "guardrails" in data["metadata"]:
            # expect users to pass
            # guardrails: { prompt_injection: true, rail_2: false }
            request_guardrails = data["metadata"]["guardrails"]
            verbose_proxy_logger.debug(
                "Guardrails %s passed in request - checking which to apply",
                request_guardrails,
            )

            requested_callback_names = []

            # v1 implementation of this
            if isinstance(request_guardrails, dict):
                # get guardrail configs from `init_guardrails.py`
                # for all requested guardrails -> get their associated callbacks
                for _guardrail_name, should_run in request_guardrails.items():
                    if should_run is False:
                        verbose_proxy_logger.debug(
                            "Guardrail %s skipped because request set to False",
                            _guardrail_name,
                        )
                        continue

                    # lookup the guardrail in guardrail_name_config_map
                    guardrail_item: GuardrailItem = litellm.guardrail_name_config_map[
                        _guardrail_name
                    ]

                    guardrail_callbacks = guardrail_item.callbacks
                    requested_callback_names.extend(guardrail_callbacks)

                verbose_proxy_logger.debug(
                    "requested_callback_names %s", requested_callback_names
                )
                if guardrail_name in requested_callback_names:
                    return True

                # Do no proceeed if - "metadata": { "guardrails": { "lakera_prompt_injection": false } }
                return False

    return True


async def should_proceed_based_on_api_key(
    user_api_key_dict: UserAPIKeyAuth, guardrail_name: str
) -> bool:
    """
    checks if this guardrail should be applied to this call
    """
    if user_api_key_dict.permissions is not None:
        # { prompt_injection: true, rail_2: false }
        verbose_proxy_logger.debug(
            "Guardrails valid for API Key= %s - checking which to apply",
            user_api_key_dict.permissions,
        )

        if not isinstance(user_api_key_dict.permissions, dict):
            verbose_proxy_logger.error(
                "API Key permissions must be a dict - %s running guardrail %s",
                user_api_key_dict,
                guardrail_name,
            )
            return True

        for _guardrail_name, should_run in user_api_key_dict.permissions.items():
            if should_run is False:
                verbose_proxy_logger.debug(
                    "Guardrail %s skipped because request set to False",
                    _guardrail_name,
                )
                continue

            # lookup the guardrail in guardrail_name_config_map
            guardrail_item: GuardrailItem = litellm.guardrail_name_config_map[
                _guardrail_name
            ]

            guardrail_callbacks = guardrail_item.callbacks
            if guardrail_name in guardrail_callbacks:
                return True

        # Do not proceeed if - "metadata": { "guardrails": { "lakera_prompt_injection": false } }
        return False
    return True


def clean_guardrails_from_metadata(
    metadata: Optional[Dict[str, Any]],
    new_guardrails: Optional[Any] = None,
) -> Optional[Dict[str, Any]]:
    """
    Clean old guardrail data from metadata and optionally set new guardrails.

    This function removes residual guardrail data that may persist in metadata,
    including:
    - Old guardrail lists
    - Stale guardrail configurations
    - standard_logging_guardrail_information (which should be set per-request, not stored)

    Args:
        metadata: The metadata dictionary to clean
        new_guardrails: Optional new guardrails to set (list, dict, or None to remove all)

    Returns:
        Cleaned metadata dictionary, or None if metadata was None
    """
    if metadata is None:
        return None

    # Create a copy to avoid modifying the original
    cleaned_metadata = metadata.copy()

    # Remove per-request guardrail information that shouldn't be stored
    if "standard_logging_guardrail_information" in cleaned_metadata:
        del cleaned_metadata["standard_logging_guardrail_information"]
        verbose_proxy_logger.debug(
            "Removed standard_logging_guardrail_information from metadata - this should be set per-request only"
        )

    # Handle guardrails field
    if new_guardrails is None or (isinstance(new_guardrails, (list, dict)) and len(new_guardrails) == 0):
        # Remove guardrails entirely if None or empty
        if "guardrails" in cleaned_metadata:
            del cleaned_metadata["guardrails"]
            verbose_proxy_logger.debug("Removed guardrails from metadata (None or empty)")
    else:
        # Set new guardrails, replacing any old ones
        cleaned_metadata["guardrails"] = new_guardrails
        verbose_proxy_logger.debug(
            f"Set new guardrails in metadata: {new_guardrails}"
        )

    return cleaned_metadata
