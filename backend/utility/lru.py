import time
from functools import lru_cache


def lru_with_ttl(*, ttl_seconds, maxsize=128):
    def resp(param):
        @lru_cache(maxsize=maxsize)
        def cached_with_ttl(*args, ttl_hash, **kwargs):
            return param(*args, **kwargs)

        def inner(*args, **kwargs):
            return cached_with_ttl(
                *args, ttl_hash=round(time.time() / ttl_seconds), **kwargs
            )

        return inner

    return resp
