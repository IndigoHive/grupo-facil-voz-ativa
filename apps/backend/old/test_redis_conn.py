import redis
import sys

def test_redis_connection():
    host = "redisgaragem.zrhdsarhreh.shop"
    port = 6379
    
    print(f"Connecting to Redis at {host}:{port}...")
    
    try:
        r = redis.Redis(host=host, port=port, socket_connect_timeout=5)
        r.ping()
        print("Successfully connected to Redis!")
        return True
    except redis.ConnectionError as e:
        print(f"Failed to connect to Redis: {e}")
        return False
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return False

if __name__ == "__main__":
    success = test_redis_connection()
    if not success:
        sys.exit(1)
