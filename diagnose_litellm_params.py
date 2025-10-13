#!/usr/bin/env python3
"""
LiteLLM Database Diagnostic Script

This script diagnoses invalid litellm_params in the LiteLLM Proxy database
and provides detailed error information to help fix the issues.

Usage:
    python diagnose_litellm_params.py

Requirements:
    - Database URL configured in environment variable DATABASE_URL or in config
    - Required packages: prisma, litellm
"""

import asyncio
import json
import os
import sys
from typing import Any, Dict, List, Optional

# Add parent directory to path to import litellm modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from litellm.proxy.proxy_server import ProxyConfig
from litellm.proxy.utils import PrismaClient, get_instance_fn


class LiteLLMParamsDiagnostic:
    """Diagnostic tool for checking litellm_params validity"""

    def __init__(self):
        self.prisma_client: Optional[PrismaClient] = None
        self.valid_models: List[Dict[str, Any]] = []
        self.invalid_models: List[Dict[str, Any]] = []

    async def initialize_db(self):
        """Initialize database connection"""
        try:
            # Get database URL from environment or config
            database_url = os.getenv("DATABASE_URL")
            if not database_url:
                print("ERROR: DATABASE_URL environment variable not set")
                print("Please set it using: export DATABASE_URL='your_database_url'")
                return False

            # Initialize Prisma client
            self.prisma_client = get_instance_fn()
            if self.prisma_client is None:
                print("ERROR: Failed to initialize Prisma client")
                return False

            await self.prisma_client.connect()
            print("✓ Successfully connected to database")
            return True

        except Exception as e:
            print(f"ERROR: Failed to connect to database: {str(e)}")
            return False

    def parse_litellm_params(self, params: Any, model_id: str, model_name: str) -> tuple[bool, Optional[str]]:
        """
        Try to parse litellm_params and return success status and error message

        Returns:
            (success: bool, error_message: Optional[str])
        """
        try:
            # Use the same parsing logic as the proxy server
            parsed = ProxyConfig.parse_litellm_params(params)
            return True, None
        except ValueError as e:
            return False, str(e)
        except Exception as e:
            return False, f"Unexpected error: {type(e).__name__}: {str(e)}"

    def get_params_info(self, params: Any) -> str:
        """Get readable information about the params structure"""
        if params is None:
            return "NULL"
        elif isinstance(params, dict):
            keys = list(params.keys())
            has_model = "model" in params
            return f"dict with keys: {keys} | has 'model' field: {has_model}"
        elif isinstance(params, str):
            if params.strip().startswith("{"):
                return f"JSON string (length: {len(params)})"
            elif params.strip().startswith("LiteLLM_Params("):
                return "Pydantic string representation"
            else:
                return f"string (length: {len(params)}, preview: {params[:50]}...)"
        else:
            return f"type: {type(params).__name__}"

    async def diagnose_all_models(self):
        """Diagnose all models in the database"""
        if self.prisma_client is None:
            print("ERROR: Database not initialized")
            return

        try:
            # Fetch all models from database
            print("\nFetching models from database...")
            models = await self.prisma_client.db.litellm_proxymodeltable.find_many()

            if not models:
                print("No models found in database")
                return

            print(f"Found {len(models)} models in database\n")
            print("=" * 80)
            print("DIAGNOSING MODELS")
            print("=" * 80)

            # Check each model
            for idx, model in enumerate(models, 1):
                print(f"\n[{idx}/{len(models)}] Model ID: {model.model_id}")
                print(f"    Model Name: {model.model_name}")
                print(f"    Created By: {model.created_by}")
                print(f"    Created At: {model.created_at}")

                # Get params info
                params_info = self.get_params_info(model.litellm_params)
                print(f"    Params Info: {params_info}")

                # Try to parse
                success, error_msg = self.parse_litellm_params(
                    model.litellm_params,
                    model.model_id,
                    model.model_name
                )

                if success:
                    print("    Status: ✓ VALID")
                    self.valid_models.append({
                        "model_id": model.model_id,
                        "model_name": model.model_name,
                        "created_by": model.created_by
                    })
                else:
                    print(f"    Status: ✗ INVALID")
                    print(f"    Error: {error_msg}")

                    self.invalid_models.append({
                        "model_id": model.model_id,
                        "model_name": model.model_name,
                        "created_by": model.created_by,
                        "error": error_msg,
                        "params": model.litellm_params
                    })

            # Print summary
            print("\n" + "=" * 80)
            print("SUMMARY")
            print("=" * 80)
            print(f"Total models: {len(models)}")
            print(f"Valid models: {len(self.valid_models)} ✓")
            print(f"Invalid models: {len(self.invalid_models)} ✗")

            if self.invalid_models:
                print("\n" + "=" * 80)
                print("INVALID MODELS DETAILS")
                print("=" * 80)

                for invalid in self.invalid_models:
                    print(f"\nModel ID: {invalid['model_id']}")
                    print(f"Model Name: {invalid['model_name']}")
                    print(f"Error: {invalid['error']}")
                    print(f"Params: {invalid['params']}")

                    # Provide suggestions
                    print("\nSuggested fixes:")
                    if "model" in invalid["error"].lower() and "required" in invalid["error"].lower():
                        print("  - Add 'model' field to litellm_params (this is required)")
                    if "json" in invalid["error"].lower():
                        print("  - Fix JSON formatting in litellm_params")
                    if "decrypt" in invalid["error"].lower():
                        print("  - Check encryption keys or use plain values")

                    print("\nTo delete this model:")
                    print(f"  SQL: DELETE FROM \"LiteLLM_ProxyModelTable\" WHERE model_id = '{invalid['model_id']}';")

            print("\n" + "=" * 80)
            print("RECOMMENDATIONS")
            print("=" * 80)

            if self.invalid_models:
                print("\n1. Review the error messages above to understand what's wrong")
                print("2. Fix the litellm_params in your database or config file")
                print("3. If models are not needed, delete them using the SQL commands provided")
                print("4. After fixes, restart the LiteLLM Proxy server")
            else:
                print("\n✓ All models have valid litellm_params!")
                print("  If you're still seeing warnings, check the enhanced logs for more details.")

        except Exception as e:
            print(f"\nERROR during diagnosis: {str(e)}")
            import traceback
            traceback.print_exc()

    async def cleanup(self):
        """Cleanup resources"""
        if self.prisma_client:
            await self.prisma_client.disconnect()
            print("\n✓ Disconnected from database")


async def main():
    """Main entry point"""
    print("=" * 80)
    print("LiteLLM Proxy - Database Diagnostic Tool")
    print("=" * 80)

    diagnostic = LiteLLMParamsDiagnostic()

    try:
        # Initialize database
        if not await diagnostic.initialize_db():
            return 1

        # Run diagnosis
        await diagnostic.diagnose_all_models()

        return 0

    except KeyboardInterrupt:
        print("\n\nDiagnostic interrupted by user")
        return 1
    except Exception as e:
        print(f"\n\nFATAL ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1
    finally:
        await diagnostic.cleanup()


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
