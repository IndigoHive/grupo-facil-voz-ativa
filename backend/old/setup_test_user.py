from database import SessionLocal
import models
import auth

def create_test_user():
    db = SessionLocal()
    try:
        email = "teste_reset@vozativa.com"
        
        # Check if exists
        user = db.query(models.User).filter(models.User.email == email).first()
        if user:
            print(f"User {email} already exists.")
            return

        # Check for company or create one
        company = db.query(models.Empresa).first()
        if not company:
            company = models.Empresa(Nome="Test Company", api_key="sk_test", Status=True)
            db.add(company)
            db.commit()
            db.refresh(company)
            print("Created test company.")
        
        user = models.User(
            email=email,
            Senha_Criptografada=auth.get_password_hash("OldPassword123!"),
            Empresa_id=company.id,
            is_superadmin=False,
            admin=True
        )
        db.add(user)
        db.commit()
        print(f"Created user {email}.")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
