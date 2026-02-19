"""
Text chunking utilities for guardrail API calls.

Handles splitting large content into chunks that fit within API limits.
"""

from typing import List, Optional
from litellm._logging import verbose_proxy_logger


class TextChunker:
    """
    Handles chunking of text content for guardrail APIs with size limits.
    """

    def __init__(
        self,
        max_chunk_size_bytes: int = 20480,  # 20KB default (safe for Bedrock)
        overlap_bytes: int = 100,  # Small overlap to maintain context
    ):
        """
        Initialize the text chunker.

        Args:
            max_chunk_size_bytes: Maximum size of each chunk in bytes
            overlap_bytes: Number of bytes to overlap between chunks
        """
        self.max_chunk_size_bytes = max_chunk_size_bytes
        self.overlap_bytes = min(overlap_bytes, max_chunk_size_bytes // 10)

    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into chunks that fit within the size limit.

        Args:
            text: The text to chunk

        Returns:
            List of text chunks
        """
        if not text:
            return []

        # Check if text fits in a single chunk
        text_bytes = text.encode('utf-8')
        if len(text_bytes) <= self.max_chunk_size_bytes:
            return [text]

        verbose_proxy_logger.info(
            f"Chunking large text: {len(text_bytes)} bytes into chunks of {self.max_chunk_size_bytes} bytes"
        )

        chunks = []
        current_position = 0

        while current_position < len(text):
            # Calculate end position for this chunk
            end_position = current_position + self.max_chunk_size_bytes

            # If this would go past the end, just take the rest
            if end_position >= len(text):
                chunk = text[current_position:]
                chunks.append(chunk)
                break

            # Find a good breaking point (sentence boundary, word boundary, etc.)
            chunk_end = self._find_break_point(text, current_position, end_position)

            # Extract the chunk
            chunk = text[current_position:chunk_end]
            chunks.append(chunk)

            # Move to next chunk with overlap
            current_position = chunk_end - self.overlap_bytes

        verbose_proxy_logger.info(
            f"Created {len(chunks)} chunks from {len(text_bytes)} bytes of text"
        )

        return chunks

    def _find_break_point(self, text: str, start: int, max_end: int) -> int:
        """
        Find a natural breaking point in the text.

        Looks for sentence boundaries, then paragraph boundaries, then word boundaries.

        Args:
            text: The full text
            start: Start position
            max_end: Maximum end position

        Returns:
            The position to break at
        """
        # Try to find sentence boundary (. ! ?)
        search_text = text[start:max_end]

        # Look for sentence endings in reverse from max_end
        for i in range(len(search_text) - 1, len(search_text) // 2, -1):
            if search_text[i] in '.!?' and i + 1 < len(search_text):
                # Check if followed by space or newline
                if search_text[i + 1] in ' \n\t':
                    return start + i + 2  # Include the punctuation and space

        # Try to find paragraph boundary
        for i in range(len(search_text) - 1, len(search_text) // 2, -1):
            if search_text[i:i+2] == '\n\n':
                return start + i + 2

        # Try to find word boundary (space)
        for i in range(len(search_text) - 1, len(search_text) // 2, -1):
            if search_text[i] in ' \n\t':
                return start + i + 1

        # If no good boundary found, just break at max_end
        return max_end

    def needs_chunking(self, text: str) -> bool:
        """
        Check if text needs to be chunked.

        Args:
            text: The text to check

        Returns:
            True if text exceeds the chunk size limit
        """
        if not text:
            return False

        text_bytes = text.encode('utf-8')
        return len(text_bytes) > self.max_chunk_size_bytes


# Default chunker for Bedrock Guardrails
DEFAULT_BEDROCK_CHUNKER = TextChunker(
    max_chunk_size_bytes=20480,  # 20KB - safe for Bedrock (limit is ~25KB)
    overlap_bytes=100,
)
