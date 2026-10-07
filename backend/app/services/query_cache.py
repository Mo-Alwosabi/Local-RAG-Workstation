import time
from typing import NamedTuple

class CachedResponse(NamedTuple):
    answer: str
    sources: list[dict]
    timestamp: float

class QueryCache:
    def __init__(self, ttl_seconds: int = 3600, max_size: int = 500):
        self._cache: dict[str, CachedResponse] = {}
        self.ttl = ttl_seconds
        self.max_size = max_size

    def _normalize_key(self, query: str) -> str:
        return ' '.join(query.strip().lower().split())

    def get(self, query: str) -> CachedResponse | None:
        key = self._normalize_key(query)
        entry = self._cache.get(key)
        if entry:
            if time.time() - entry.timestamp < self.ttl:
                return entry
            else:
                del self._cache[key]
        return None

    def set(self, query: str, answer: str, sources: list[dict]) -> None:
        if len(self._cache) >= self.max_size:
            oldest = min(self._cache.keys(), key=lambda k: self._cache[k].timestamp)
            del self._cache[oldest]
        key = self._normalize_key(query)
        self._cache[key] = CachedResponse(
            answer=answer,
            sources=sources,
            timestamp=time.time()
        )

    def clear(self) -> None:
        self._cache.clear()

global_query_cache = QueryCache()
