from database import SessionLocal
from sqlalchemy import text
import sys

def test_connection():
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        print("Database connection successful!")
        db.close()
    except Exception as e:
        print(f"Database connection failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test_connection()
