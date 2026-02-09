
import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add current directory to path so we can import modules
sys.path.append(os.getcwd())

from redis_client import get_cache, CACHE_KEY_CALLS
import models
from database import DATABASE_URL

def debug_full():
    print("--- DEBUGGING ---")
    
    # 1. Check DB Users
    print("\n[DB] Checking Users:")
    # DATABASE_URL might be loaded from env, let's check
    print(f"URL: {DATABASE_URL}")
    
    try:
        engine = create_engine(DATABASE_URL)
        Session = sessionmaker(bind=engine)
        db = Session()
        
        users = db.query(models.User).all()
        for u in users:
            print(f"User ID: {u.id}, Email: {u.email}, Empresa_id: {u.Empresa_id} (Type: {type(u.Empresa_id)})")
            
        db.close()
    except Exception as e:
        print(f"DB Error: {e}")

    # 2. Check Redis Cache
    print("\n[Redis] Checking Cache:")
    data = get_cache(CACHE_KEY_CALLS)
    
    if not data:
        print("Cache is empty.")
    else:
        print(f"Total calls in cache: {len(data)}")
        
        counts = {}
        missing_company_id = 0
        company_ids_types = set()
        
        for call in data:
            eid = call.get('Empresa_id')
            if eid is None:
                missing_company_id += 1
            
            counts[eid] = counts.get(eid, 0) + 1
            company_ids_types.add(type(eid))
        
        print("\nCall counts by Empresa_id in Cache:")
        for eid, count in counts.items():
            print(f"Empresa_id: {eid} (Type: {type(eid)}) - Count: {count}")
            
        print(f"Types found for Empresa_id: {company_ids_types}")

        if missing_company_id > 0:
            print(f"\nWARNING: {missing_company_id} calls have missing Empresa_id!")

if __name__ == "__main__":
    debug_full()
