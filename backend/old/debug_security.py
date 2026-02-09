import models
import schemas
import cache_logic
from database import SessionLocal
import json

db = SessionLocal()

try:
    with open("debug_res.txt", "w", encoding="utf-8") as f:
        def log(msg):
            print(msg)
            f.write(msg + "\n")

        log("--- Debugging Security Filters ---")
        
        # 1. Check User 2
        user2 = db.query(models.User).filter(models.User.id == 2).first()
        if user2:
            log(f"User 2: ID={user2.id}, Email={user2.email}, Empresa_id={user2.Empresa_id}")
        else:
            log("User 2 not found!")

        # 2. Check Calls (Limit 5 from DB)
        calls = db.query(models.CogfyAll).limit(5).all()
        log(f"Inspecting {len(calls)} random calls from DB:")
        for c in calls:
            log(f"  Call ID={c.id}, Empresa_id={c.Empresa_id}, User_Sent_As={c.Customer_Name}")

        # 4. Simulate Cache Dump (Pydantic serialization)
        log("\n--- Simulating Cache Serialization ---")
        if calls:
            sample_call = calls[0]
            try:
                pydantic_call = schemas.CallData.model_validate(sample_call)
                json_dump = pydantic_call.model_dump(mode='json')
                log(f"Serialized Call (ID {sample_call.id}):")
                log(f"  Empresa_id in JSON: {json_dump.get('Empresa_id')}")
                
                if 'Empresa_id' not in json_dump:
                    log("  ALARM: Empresa_id Missing from Dump!")
                else:
                    log("  OK: Empresa_id is present.")
            except Exception as e:
                log(f"Serialization failed: {e}")

        # 5. Check Redis Content (Simulated via cache_logic if connected)
        log("\n--- Checking Redis Cache ---")
        cached_calls = cache_logic.get_cache(cache_logic.CACHE_KEY_CALLS)
        if cached_calls:
            log(f"Total calls in cache: {len(cached_calls)}")
            sample = cached_calls[0]
            log(f"Sample Cached Call Keys: {list(sample.keys())}")
            log(f"Sample Cached Call Empresa_id: {sample.get('Empresa_id')}")
            
            # Count by company
            count_emp1 = len([c for c in cached_calls if c.get('Empresa_id') == 1])
            count_emp2 = len([c for c in cached_calls if c.get('Empresa_id') == 2])
            count_none = len([c for c in cached_calls if c.get('Empresa_id') is None])
            log(f"Calls in Cache with Empresa_id=1: {count_emp1}")
            log(f"Calls in Cache with Empresa_id=2: {count_emp2}")
            log(f"Calls in Cache with Empresa_id=None: {count_none}")
        else:
            log("Cache is empty or unreachable.")

finally:
    db.close()
