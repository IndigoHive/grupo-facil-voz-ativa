from sqlalchemy import create_engine, text
import os

# Database URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./sql_app.db"

def add_column():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE Usuários ADD COLUMN admin BOOLEAN DEFAULT 0"))
            print("Column 'admin' added successfully.")
        except Exception as e:
            print(f"Error (column might already exist): {e}")

if __name__ == "__main__":
    add_column()
