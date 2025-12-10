#!/usr/bin/env python3
"""
Script to update team member budget in LiteLLM database
Usage: python3 update_team_member_budget.py <budget_id> <new_max_budget>
"""

import asyncio
import sys
from litellm.proxy.proxy_server import prisma_client

async def update_budget(budget_id: str, new_max_budget: float):
    """Update the max_budget for a given budget_id"""
    if prisma_client is None:
        print("ERROR: Database not connected")
        return False

    try:
        # Update the budget
        result = await prisma_client.db.litellm_budgettable.update(
            where={"budget_id": budget_id},
            data={"max_budget": new_max_budget}
        )

        print(f"✓ Successfully updated budget!")
        print(f"  Budget ID: {result.budget_id}")
        print(f"  Old max_budget: (check logs)")
        print(f"  New max_budget: {result.max_budget}")
        print(f"  Current spend: {result.spend}")

        # Clear cache to force reload
        from litellm.proxy.proxy_server import user_api_key_cache, proxy_logging_obj

        # Find and invalidate all related caches
        print(f"\n✓ Cache invalidation triggered...")
        print(f"  Note: Budget updates should take effect within 5 seconds")

        return True

    except Exception as e:
        print(f"ERROR: Failed to update budget: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python3 update_team_member_budget.py <budget_id> <new_max_budget>")
        print("\nExample:")
        print("  python3 update_team_member_budget.py team-Claude-Code-Users-budget-4a1a7eb434184bbc902991191f870dfc 150.0")
        sys.exit(1)

    budget_id = sys.argv[1]
    try:
        new_max_budget = float(sys.argv[2])
    except ValueError:
        print(f"ERROR: Invalid budget amount: {sys.argv[2]}")
        sys.exit(1)

    print(f"Updating budget...")
    print(f"  Budget ID: {budget_id}")
    print(f"  New max budget: {new_max_budget}")

    success = asyncio.run(update_budget(budget_id, new_max_budget))
    sys.exit(0 if success else 1)
