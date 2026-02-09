from database import SessionLocal, engine
from sqlalchemy import text
import models

def verify():
    db = SessionLocal()
    try:
        # Check column existence
        print("Checking 'Gatilhos' table columns...")
        with engine.connect() as conn:
            result = conn.execute(text("SHOW COLUMNS FROM Gatilhos LIKE 'Destinatário'"))
            row = result.fetchone()
            if row:
                print(f"Column 'Destinatário' found: {row}")
            else:
                print("❌ Column 'Destinatário' NOT found in database!")
                # Optional warning
                print("The database schema might need to be updated manually or via migration.")

        # Try to instantiate a Gatilho to see if model is valid (locally)
        print("\nVerifying 'Gatilho' model instantiation...")
        try:
            g = models.Gatilho(
                Descricao="Test Trigger",
                Empresa_id=1,
                Usuario_id=1,
                Tipo="WhatsApp",
                Destinatario="123456789"
            )
            print("✅ Model instantiation successful.")
        except Exception as e:
            print(f"❌ Model instantiation failed: {e}")

    except Exception as e:
        print(f"❌ Verification failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify()
