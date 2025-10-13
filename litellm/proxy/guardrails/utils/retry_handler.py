"""
Retry handler for guardrail API calls with exponential backoff.

Provides production-ready retry logic for handling rate limits (429) and transient errors.
"""

import asyncio
import random
from typing import Callable, Optional, Set, TypeVar, Any
from functools import wraps
import httpx

from litellm._logging import verbose_proxy_logger

T = TypeVar("T")


class GuardrailRetryConfig:
    """Configuration for guardrail retry behavior."""

    def __init__(
        self,
        max_retries: int = 5,
        retry_backoff_base: float = 0.1,  # 100ms
        retry_backoff_max: float = 10.0,  # 10 seconds
        retry_backoff_multiplier: float = 2.0,
        jitter: bool = True,
        jitter_percent: float = 0.25,  # ±25%
        retry_on_status_codes: Optional[Set[int]] = None,
    ):
        self.max_retries = max_retries
        self.retry_backoff_base = retry_backoff_base
        self.retry_backoff_max = retry_backoff_max
        self.retry_backoff_multiplier = retry_backoff_multiplier
        self.jitter = jitter
        self.jitter_percent = jitter_percent

        # Default: Retry on rate limiting and server errors
        if retry_on_status_codes is None:
            self.retry_on_status_codes = {429, 500, 502, 503, 504}
        else:
            self.retry_on_status_codes = retry_on_status_codes

    def calculate_backoff(self, attempt: int) -> float:
        """
        Calculate backoff delay for the given attempt number.

        Uses exponential backoff with optional jitter.

        Args:
            attempt: The retry attempt number (0-indexed)

        Returns:
            Delay in seconds
        """
        # Exponential backoff: base * multiplier^attempt
        delay = min(
            self.retry_backoff_base * (self.retry_backoff_multiplier ** attempt),
            self.retry_backoff_max,
        )

        # Add jitter to prevent thundering herd
        if self.jitter:
            jitter_amount = delay * self.jitter_percent
            delay += random.uniform(-jitter_amount, jitter_amount)

        # Ensure delay is never negative
        return max(0, delay)

    def is_retryable_error(self, error: Exception) -> bool:
        """
        Determine if an error is retryable.

        Args:
            error: The exception to check

        Returns:
            True if the error should be retried
        """
        # Retry on HTTP status errors with specific status codes
        if isinstance(error, httpx.HTTPStatusError):
            status_code = error.response.status_code
            return status_code in self.retry_on_status_codes

        # Retry on connection/timeout errors
        if isinstance(error, (httpx.ConnectError, httpx.TimeoutException)):
            return True

        # Don't retry other errors
        return False


# Default configuration for Bedrock Guardrails
DEFAULT_BEDROCK_RETRY_CONFIG = GuardrailRetryConfig(
    max_retries=5,
    retry_backoff_base=0.1,
    retry_backoff_max=10.0,
    retry_on_status_codes={429, 500, 502, 503, 504},
)


def async_retry_with_backoff(
    config: Optional[GuardrailRetryConfig] = None,
):
    """
    Decorator to add retry logic with exponential backoff to async functions.

    Usage:
        @async_retry_with_backoff(config=my_config)
        async def my_api_call():
            ...

    Args:
        config: Retry configuration (uses default if None)
    """
    if config is None:
        config = DEFAULT_BEDROCK_RETRY_CONFIG

    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        async def wrapper(*args: Any, **kwargs: Any) -> T:
            last_exception: Optional[Exception] = None

            for attempt in range(config.max_retries + 1):
                try:
                    # Attempt the API call
                    return await func(*args, **kwargs)

                except Exception as e:
                    last_exception = e

                    # Check if this is the last attempt
                    if attempt >= config.max_retries:
                        verbose_proxy_logger.error(
                            f"Guardrail API call failed after {config.max_retries} retries. "
                            f"Final error: {str(e)}"
                        )
                        raise e

                    # Check if error is retryable
                    if not config.is_retryable_error(e):
                        verbose_proxy_logger.warning(
                            f"Guardrail API call failed with non-retryable error: {str(e)}"
                        )
                        raise e

                    # Calculate backoff delay
                    delay = config.calculate_backoff(attempt)

                    # Extract status code for logging
                    status_code = None
                    if isinstance(e, httpx.HTTPStatusError):
                        status_code = e.response.status_code

                    verbose_proxy_logger.warning(
                        f"Guardrail API call failed (attempt {attempt + 1}/{config.max_retries}). "
                        f"Status: {status_code}, Error: {str(e)}. "
                        f"Retrying in {delay:.2f}s..."
                    )

                    # Wait before retrying
                    await asyncio.sleep(delay)

            # This should never be reached, but just in case
            if last_exception:
                raise last_exception
            raise RuntimeError("Retry logic completed without success or exception")

        return wrapper

    return decorator
