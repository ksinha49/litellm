"""
CRUD endpoints for storing reusable credentials.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Request, Response

import litellm
from litellm._logging import verbose_proxy_logger
from litellm.litellm_core_utils.credential_accessor import CredentialAccessor
from litellm.litellm_core_utils.litellm_logging import _get_masked_values
from litellm.proxy._types import CommonProxyErrors, UserAPIKeyAuth
from litellm.proxy.auth.user_api_key_auth import user_api_key_auth
from litellm.proxy.common_utils.encrypt_decrypt_utils import (
    encrypt_value_helper,
    decrypt_value_helper,
)
from litellm.proxy.utils import handle_exception_on_proxy, jsonify_object
from litellm.types.utils import CreateCredentialItem, CredentialItem

router = APIRouter()


class CredentialHelperUtils:
    @staticmethod
    def encrypt_credential_values(credential: CredentialItem) -> CredentialItem:
        """Encrypt values in credential.credential_values with salt-key hash prefix and add to DB"""
        prefixed_encrypted_credential_values = {}
        for key, value in credential.credential_values.items():
            prefixed_encrypted_credential_values[key] = encrypt_value_helper(value)
        credential.credential_values = prefixed_encrypted_credential_values
        return credential

    @staticmethod
    def decrypt_credential_values(credential: CredentialItem) -> CredentialItem:
        """Decrypt values in credential.credential_values loaded from DB"""
        decrypted_credential_values = {}
        for key, value in credential.credential_values.items():
            decrypted_value = decrypt_value_helper(value=value, key=key)
            # If decryption returns None, keep the original value
            decrypted_credential_values[key] = (
                decrypted_value if decrypted_value is not None else value
            )
        credential.credential_values = decrypted_credential_values
        return credential


@router.post(
    "/credentials",
    dependencies=[Depends(user_api_key_auth)],
    tags=["credential management"],
)
async def create_credential(
    request: Request,
    fastapi_response: Response,
    credential: CreateCredentialItem,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    [BETA] endpoint. This might change unexpectedly.
    Stores credential in DB.
    Reloads credentials in memory.
    """
    from litellm.proxy.proxy_server import llm_router, prisma_client

    try:
        if prisma_client is None:
            raise HTTPException(
                status_code=500,
                detail={"error": CommonProxyErrors.db_not_connected_error.value},
            )
        if credential.model_id:
            if llm_router is None:
                raise HTTPException(
                    status_code=500,
                    detail="LLM router not found. Please ensure you have a valid router instance.",
                )
            # get model from router
            model = llm_router.get_deployment(credential.model_id)
            if model is None:
                raise HTTPException(status_code=404, detail="Model not found")
            credential_values = llm_router.get_deployment_credentials(
                credential.model_id
            )
            if credential_values is None:
                raise HTTPException(status_code=404, detail="Model not found")
            credential.credential_values = credential_values

        if credential.credential_values is None:
            raise HTTPException(
                status_code=400,
                detail="Credential values are required. Unable to infer credential values from model ID.",
            )
        processed_credential = CredentialItem(
            credential_name=credential.credential_name,
            credential_values=credential.credential_values,
            credential_info=credential.credential_info,
        )
        encrypted_credential = CredentialHelperUtils.encrypt_credential_values(
            processed_credential
        )
        credentials_dict = encrypted_credential.model_dump()
        credentials_dict_jsonified = jsonify_object(credentials_dict)
        await prisma_client.db.litellm_credentialstable.create(
            data={
                **credentials_dict_jsonified,
                "created_by": user_api_key_dict.user_id,
                "updated_by": user_api_key_dict.user_id,
            }
        )

        ## ADD TO LITELLM ##
        CredentialAccessor.upsert_credentials([processed_credential])

        return {"success": True, "message": "Credential created successfully"}
    except Exception as e:
        verbose_proxy_logger.exception(e)
        raise handle_exception_on_proxy(e)


@router.get(
    "/credentials",
    dependencies=[Depends(user_api_key_auth)],
    tags=["credential management"],
)
async def get_credentials(
    request: Request,
    fastapi_response: Response,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    [BETA] endpoint. This might change unexpectedly.
    """
    try:
        masked_credentials = [
            {
                "credential_name": credential.credential_name,
                "credential_values": _get_masked_values(credential.credential_values),
                "credential_info": credential.credential_info,
            }
            for credential in litellm.credential_list
        ]
        return {"success": True, "credentials": masked_credentials}
    except Exception as e:
        return handle_exception_on_proxy(e)


@router.get(
    "/credentials/by_name/{credential_name:path}",
    dependencies=[Depends(user_api_key_auth)],
    tags=["credential management"],
    response_model=CredentialItem,
)
@router.get(
    "/credentials/by_model/{model_id}",
    dependencies=[Depends(user_api_key_auth)],
    tags=["credential management"],
    response_model=CredentialItem,
)
async def get_credential(
    request: Request,
    fastapi_response: Response,
    credential_name: str = Path(..., description="The credential name, percent-decoded; may contain slashes"),
    model_id: Optional[str] = None,
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    [BETA] endpoint. This might change unexpectedly.
    """
    from litellm.proxy.proxy_server import llm_router

    try:
        if model_id:
            if llm_router is None:
                raise HTTPException(status_code=500, detail="LLM router not found")
            model = llm_router.get_deployment(model_id)
            if model is None:
                raise HTTPException(status_code=404, detail="Model not found")
            credential_values = llm_router.get_deployment_credentials(model_id)
            if credential_values is None:
                raise HTTPException(status_code=404, detail="Model not found")
            masked_credential_values = _get_masked_values(
                credential_values,
                unmasked_length=4,
                number_of_asterisks=4,
            )
            credential = CredentialItem(
                credential_name="{}-credential-{}".format(model.model_name, model_id),
                credential_values=masked_credential_values,
                credential_info={},
            )
            # return credential object
            return credential
        elif credential_name:
            for credential in litellm.credential_list:
                if credential.credential_name == credential_name:
                    masked_credential = CredentialItem(
                        credential_name=credential.credential_name,
                        credential_values=_get_masked_values(
                            credential.credential_values,
                            unmasked_length=4,
                            number_of_asterisks=4,
                        ),
                        credential_info=credential.credential_info,
                    )
                    return masked_credential
            raise HTTPException(
                status_code=404,
                detail="Credential not found. Got credential name: " + credential_name,
            )
        else:
            raise HTTPException(
                status_code=404, detail="Credential name or model ID required"
            )
    except Exception as e:
        verbose_proxy_logger.exception(e)
        raise handle_exception_on_proxy(e)


@router.delete(
    "/credentials/{credential_name:path}",
    dependencies=[Depends(user_api_key_auth)],
    tags=["credential management"],
)
async def delete_credential(
    request: Request,
    fastapi_response: Response,
    credential_name: str = Path(..., description="The credential name, percent-decoded; may contain slashes"),
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    [BETA] endpoint. This might change unexpectedly.
    """
    from litellm.proxy.proxy_server import prisma_client

    try:
        if prisma_client is None:
            raise HTTPException(
                status_code=500,
                detail={"error": CommonProxyErrors.db_not_connected_error.value},
            )
        await prisma_client.db.litellm_credentialstable.delete(
            where={"credential_name": credential_name}
        )

        ## DELETE FROM LITELLM ##
        litellm.credential_list = [
            cred
            for cred in litellm.credential_list
            if cred.credential_name != credential_name
        ]
        return {"success": True, "message": "Credential deleted successfully"}
    except Exception as e:
        return handle_exception_on_proxy(e)


def update_db_credential(
    db_credential: CredentialItem, updated_patch: CredentialItem
) -> CredentialItem:
    """
    Update a credential in the DB.

    Decrypts existing DB credential, merges with update, then re-encrypts.
    """
    # Decrypt the existing DB credential first
    decrypted_db_credential = CredentialHelperUtils.decrypt_credential_values(
        CredentialItem(
            credential_name=db_credential.credential_name,
            credential_info=db_credential.credential_info,
            credential_values=db_credential.credential_values,
        )
    )

    # Start with decrypted values
    merged_credential = CredentialItem(
        credential_name=decrypted_db_credential.credential_name,
        credential_info=decrypted_db_credential.credential_info,
        credential_values=decrypted_db_credential.credential_values,
    )

    # Update with new values (not encrypted yet)
    # update credential name
    if updated_patch.credential_name:
        merged_credential.credential_name = updated_patch.credential_name

    # update credential values (merge plaintext values)
    if updated_patch.credential_values:
        merged_credential.credential_values.update(updated_patch.credential_values)

    # update credential info
    if updated_patch.credential_info:
        if "credential_info" not in merged_credential.credential_info:
            merged_credential.credential_info = {}
        merged_credential.credential_info.update(updated_patch.credential_info)

    # Now encrypt all values before returning
    encrypted_credential = CredentialHelperUtils.encrypt_credential_values(
        merged_credential
    )

    return encrypted_credential


@router.patch(
    "/credentials/{credential_name:path}",
    dependencies=[Depends(user_api_key_auth)],
    tags=["credential management"],
)
async def update_credential(
    request: Request,
    fastapi_response: Response,
    credential: CredentialItem,
    credential_name: str = Path(..., description="The credential name, percent-decoded; may contain slashes"),
    user_api_key_dict: UserAPIKeyAuth = Depends(user_api_key_auth),
):
    """
    [BETA] endpoint. This might change unexpectedly.
    """
    from litellm.proxy.proxy_server import prisma_client

    try:
        if prisma_client is None:
            raise HTTPException(
                status_code=500,
                detail={"error": CommonProxyErrors.db_not_connected_error.value},
            )
        db_credential = await prisma_client.db.litellm_credentialstable.find_unique(
            where={"credential_name": credential_name},
        )
        if db_credential is None:
            raise HTTPException(status_code=404, detail="Credential not found in DB.")
        merged_credential = update_db_credential(db_credential, credential)
        credential_object_jsonified = jsonify_object(merged_credential.model_dump())
        await prisma_client.db.litellm_credentialstable.update(
            where={"credential_name": credential_name},
            data={
                **credential_object_jsonified,
                "updated_by": user_api_key_dict.user_id,
            },
        )
        return {"success": True, "message": "Credential updated successfully"}
    except Exception as e:
        return handle_exception_on_proxy(e)
