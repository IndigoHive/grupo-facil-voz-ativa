import sys
import os
import uuid

# Add parent directory to path to import models and database
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import engine, SessionLocal
from models import Empresa
from sqlalchemy import text

def migrate():
    print("Starting migration...")
    db = SessionLocal()
    try:
        # 1. Add column if not exists
        print("Checking if api_key column exists...")
        try:
            db.execute(text("SELECT api_key FROM Empresas LIMIT 1"))
            print("Column api_key already exists.")
        except Exception:
            print("Column api_key does not exist. Adding...")
            # MySQL syntax
            db.execute(text("ALTER TABLE Empresas ADD COLUMN api_key VARCHAR(100)"))
            db.commit()
            print("Column added.")

        # 2. Populate empty keys
        print("Populating empty api keys...")
        companies = db.query(Empresa).filter((Empresa.api_key == None) | (Empresa.api_key == "")).all()
        count = 0
        for company in companies:
            new_key = f"sk_{uuid.uuid4().hex}"
            company.api_key = new_key
            count += 1
        
        db.commit()
        print(f"Updated {count} companies with new API keys.")

    except Exception as e:
        print(f"Migration failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()
