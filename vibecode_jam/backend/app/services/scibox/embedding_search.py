"""
Embedding-based similarity search for code solutions
"""

import logging
import numpy as np
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)


class EmbeddingSearch:
    """Find similar solutions using embeddings"""

    def __init__(self, client):
        """
        Initialize embedding search

        Args:
            client: SciboxClient instance
        """
        self.client = client
        self.known_solutions: List[Dict] = []

    async def add_known_solution(
        self,
        code: str,
        metadata: Dict
    ) -> None:
        """
        Add a known solution to the database

        Args:
            code: Solution code
            metadata: Metadata dict with task_id, level, domain, etc.
        """
        try:
            embedding = await self.client.get_embedding(code, model="bge-m3")

            self.known_solutions.append({
                'code': code,
                'embedding': embedding,
                'metadata': metadata,
                'code_hash': self._hash_code(code)
            })

            logger.info(f"Added known solution from {metadata.get('source', 'unknown')}")

        except Exception as e:
            logger.error(f"Failed to add known solution: {e}")
            raise

    async def find_similar(
        self,
        code: str,
        threshold: float = 0.85,
        max_results: int = 5
    ) -> List[Dict]:
        """
        Find similar solutions

        Args:
            code: Code to check
            threshold: Similarity threshold (0-1)
            max_results: Maximum results to return

        Returns:
            List of similar solutions with scores
        """
        if not self.known_solutions:
            logger.debug("No known solutions to compare against")
            return []

        try:
            code_embedding = await self.client.get_embedding(code, model="bge-m3")

            similar = []

            for solution in self.known_solutions:
                similarity = self._cosine_similarity(
                    code_embedding,
                    solution['embedding']
                )

                if similarity >= threshold:
                    similar.append({
                        'code': solution['code'],
                        'similarity_score': round(similarity, 4),
                        'metadata': solution['metadata'],
                        'source': solution['metadata'].get('source', 'unknown')
                    })

            # Sort by similarity descending
            similar.sort(key=lambda x: x['similarity_score'], reverse=True)

            # Limit results
            similar = similar[:max_results]

            logger.info(f"Found {len(similar)} similar solutions")
            return similar

        except Exception as e:
            logger.error(f"Similarity search error: {e}")
            raise

    async def find_exact_match(self, code: str) -> Optional[Dict]:
        """
        Check for exact code matches

        Args:
            code: Code to check

        Returns:
            Exact match if found, None otherwise
        """
        code_hash = self._hash_code(code)

        for solution in self.known_solutions:
            if solution['code_hash'] == code_hash:
                return {
                    'found': True,
                    'metadata': solution['metadata'],
                    'source': solution['metadata'].get('source', 'unknown')
                }

        return None

    @staticmethod
    def _cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        """
        Calculate cosine similarity between two vectors

        Args:
            vec1: First vector
            vec2: Second vector

        Returns:
            Cosine similarity score (0-1)
        """
        try:
            vec1 = np.array(vec1, dtype=np.float32)
            vec2 = np.array(vec2, dtype=np.float32)

            dot_product = np.dot(vec1, vec2)
            norm_product = np.linalg.norm(vec1) * np.linalg.norm(vec2)

            if norm_product == 0:
                return 0.0

            similarity = float(dot_product / norm_product)
            return max(0.0, min(1.0, similarity))  # Clamp to [0, 1]

        except Exception as e:
            logger.error(f"Similarity calculation error: {e}")
            return 0.0

    @staticmethod
    def _hash_code(code: str) -> str:
        """
        Create hash of code for exact match detection

        Args:
            code: Code to hash

        Returns:
            Hash string
        """
        import hashlib
        # Normalize code slightly (remove extra whitespace)
        normalized = '\n'.join(line.strip() for line in code.split('\n') if line.strip())
        return hashlib.sha256(normalized.encode()).hexdigest()

    def clear_solutions(self) -> None:
        """Clear all known solutions"""
        self.known_solutions = []
        logger.info("Cleared all known solutions")

    def get_stats(self) -> Dict:
        """Get database statistics"""
        return {
            'total_solutions': len(self.known_solutions),
            'by_source': self._count_by_source(),
            'by_domain': self._count_by_domain()
        }

    def _count_by_source(self) -> Dict[str, int]:
        """Count solutions by source"""
        counts = {}
        for solution in self.known_solutions:
            source = solution['metadata'].get('source', 'unknown')
            counts[source] = counts.get(source, 0) + 1
        return counts

    def _count_by_domain(self) -> Dict[str, int]:
        """Count solutions by domain"""
        counts = {}
        for solution in self.known_solutions:
            domain = solution['metadata'].get('domain', 'unknown')
            counts[domain] = counts.get(domain, 0) + 1
        return counts
