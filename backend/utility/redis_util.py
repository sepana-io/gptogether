import os
import redis
from functools import update_wrapper

GPTOGETHER_REDIS_PASSWORD = os.environ.get("GPTOGETHER_REDIS_PASSWORD")
GPTOGETHER_REDIS_HOST = os.getenv("GPTOGETHER_REDIS_HOST", "localhost")
GPTOGETHER_REDIS_PORT = os.getenv("GPTOGETHER_REDIS_PORT", "6379")

pool = redis.ConnectionPool(
    host=GPTOGETHER_REDIS_HOST, port=GPTOGETHER_REDIS_PORT, password=GPTOGETHER_REDIS_PASSWORD
)
redis_url = (
    "redis://:"
    + GPTOGETHER_REDIS_PASSWORD
    + "@"
    + GPTOGETHER_REDIS_HOST
    + ":"
    + GPTOGETHER_REDIS_PORT
)


def singleton(fn):
    name = fn.__name__

    def wrapper(*args, **kw):
        if name not in singleton.__dict__:
            ret = fn(*args, **kw)
            singleton.__dict__[name] = ret
            return ret
        else:
            return singleton.__dict__[name]

    return update_wrapper(wrapper, fn)


@singleton
def get_redis_client():

    client = redis.Redis(
        connection_pool=pool, charset="utf-8", decode_responses=True
    )
    return client
