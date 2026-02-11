import redis
import os
import json
from typing import Optional, Any

# Redis Configuration
REDIS_HOST = os.getenv("REDIS_HOST", "redisgaragem.zrhdsarhreh.shop")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
CACHE_KEY_CALLS = "all_calls_data"
CACHE_KEY_FILTERS = "all_filters_data"

redis_client = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    db=REDIS_DB,
    decode_responses=True, # Return strings instead of bytes
    socket_connect_timeout=5
)

def get_cache(key: str) -> Optional[Any]:
    try:
        data = redis_client.get(key)
        if data:
            return json.loads(data)
        return None
    except redis.RedisError as e:
        print(f"Redis get error: {e}")
        return None

def set_cache(key: str, data: Any, expire: int = 3600):
    try:
        redis_client.set(key, json.dumps(data), ex=expire)
    except redis.RedisError as e:
        print(f"Redis set error: {e}")
        # Depending on requirements, we might want to raise error or just log
