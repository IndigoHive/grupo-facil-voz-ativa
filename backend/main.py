from fastapi import FastAPI, Depends, HTTPException, status, Query, BackgroundTasks, Header, Request
import httpx
from dotenv import load_dotenv

load_dotenv()
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, asc, or_, distinct, func
from typing import Optional, List
import models
import schemas
import auth
from database import get_db, engine
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from datetime import timedelta
import asyncio
from contextlib import asynccontextmanager
import redis_client
import cache_logic
import secrets
import string

# Create tables if they don't exist (though we expect them to exist)
# models.Base.metadata.create_all(bind=engine)

# Background Task for Hourly Update
async def periodic_cache_update():
    while True:
        try:
            print("Running scheduled cache update... (Staggered Mode)")
            # 1. Get all active companies first
            db_session_gen = get_db()
            db = next(db_session_gen)
            try:
                companies = db.query(models.Empresa).filter(models.Empresa.Status == True).all()
                company_ids = [c.id for c in companies]
            finally:
                db.close() # Close session immediately after getting IDs
            
            print(f"Found {len(company_ids)} active companies to update.")

            # 2. Iterate and update each one with a delay
            for emp_id in company_ids:
                try:
                    # Create a NEW session for each update to keep transactions short
                    db_loop_gen = get_db()
                    db_loop = next(db_loop_gen)
                    try:
                        print(f"Updating cache for Company {emp_id}...")
                        await asyncio.to_thread(cache_logic.fetch_and_cache_data, db_loop, emp_id)
                    except Exception as e:
                        print(f"Error updating cache for company {emp_id}: {e}")
                    finally:
                        db_loop.close()
                    
                    # Sleep between updates to persist server stability (e.g. 10 seconds)
                    await asyncio.sleep(10) 

                except Exception as inner_e:
                    print(f"Critical loop error for company {emp_id}: {inner_e}")

        except Exception as e:
            print(f"Error in background cache update manager: {e}")
        
        # Wait for 1 hour before restarting the cycle
        print("Cycle complete. Waiting 1 hour.")
        await asyncio.sleep(3600)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Start the background task on startup
    task = asyncio.create_task(periodic_cache_update())
    yield
    # Clean up? task.cancel()

tags_metadata = [
    {
        "name": "Authentication",
        "description": "Operations for user authentication and token management.",
    },
    {
        "name": "Users",
        "description": "User management operations.",
    },
    {
        "name": "Calls",
        "description": "Operations related to fetching and filtering call data.",
    },
    {
        "name": "Triggers",
        "description": "Management of triggers (Gatilhos) for automated actions.",
    },
    {
        "name": "System",
        "description": "System-wide operations like cache refreshing.",
    },
]

app = FastAPI(
    title="Voz Ativa API",
    description="API for Voz Ativa v2 dashboard, managing calls, triggers, and analytics.",
    version="2.0.0",
    openapi_tags=tags_metadata,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# ... imports ...

security = HTTPBearer(auto_error=False)

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key"),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # 1. Try API Key Authentication
    if x_api_key:
        company = db.query(models.Empresa).filter(models.Empresa.api_key == x_api_key).first()
        if not company:
            # API Key provided but invalid
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid API Key",
            )
        
        if not company.Status:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Empresa inativa. Contate o suporte.",
            )

        # Find the first admin user for this company
        # We need a user context for the application logic (e.g. current_user.Empresa_id)
        admin_user = db.query(models.User).options(joinedload(models.User.empresa)).filter(
            models.User.Empresa_id == company.id,
            models.User.admin == True # Explicitly check for admin
        ).order_by(models.User.id.asc()).first()

        if not admin_user:
            # Fallback: try superadmin if no local admin? Or just fail.
            # Assuming every company created via our logic has an admin.
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="No admin user found for this company context.",
            )
            
        return admin_user

    # 2. Try Bearer Token Authentication
    if credentials:
        token = credentials.credentials
        try:
            payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
            email: str = payload.get("sub")
            if email is None:
                print("Credentials validation failed: Email is missing in token payload")
                raise credentials_exception
            token_data = schemas.TokenData(email=email)
        except Exception as e:
            print(f"Credentials validation failed: {str(e)}")
            raise credentials_exception
            
        user = db.query(models.User).options(joinedload(models.User.empresa)).filter(models.User.email == token_data.email).first()
        if user is None:
            raise credentials_exception
        
        # Check if company is active for every request
        if user.empresa and not user.empresa.Status:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Empresa inativa. Contate o suporte.",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        return user

    # 3. No credentials provided
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

@app.get("/users/me", response_model=schemas.UserMe, tags=["Users"], summary="Get Current User", description="Retrieve the profile of the currently authenticated user.")
async def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@app.post("/token", response_model=schemas.Token, tags=["Authentication"], summary="Login / Get Token", description="Authenticate a user and return an access token.")
async def login_for_access_token(user_login: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == user_login.email).first()
    if not user or not auth.verify_password(user_login.password, user.Senha_Criptografada):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if company is active
    if user.empresa and not user.empresa.Status:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empresa inativa. Contate o suporte.",
        )

    access_token_expires = timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/companies/me/api-key", tags=["Companies"], summary="Get Company API Key", description="Get the API Key for the current user's company (Admin only).")
def get_company_api_key(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not (current_user.admin or current_user.is_superadmin):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Reload company to ensure we have the latest data (though joinedload might have handled it, explicit query is safer for sensitive data)
    company = db.query(models.Empresa).filter(models.Empresa.id == current_user.Empresa_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
        
    return {"api_key": company.api_key}

class EmailSchema(BaseModel):
    email: str

@app.post("/auth/forgot-password", tags=["Authentication"], summary="Forgot Password", description="Send a password reset link to the user's email.")
async def forgot_password(email_data: EmailSchema, db: Session = Depends(get_db)):
    email = email_data.email
    user = db.query(models.User).filter(models.User.email == email).first()
    
    if not user:
        # Return 200 for security
        # raise HTTPException(status_code=404, detail="Email não encontrado.")
        # But per previous logic, we might want to return 404 or just succeed.
        # Let's keep consistent with valid flow and just return success to avoid enumeration if possible,
        # but the previous code returned 404. Let's return 404 for helpfulness in this B2B context.
        raise HTTPException(status_code=404, detail="Email não encontrado.")

    # Generate Token
    import uuid
    reset_token = str(uuid.uuid4())
    
    # Store in Redis (15 mins = 900 seconds)
    redis_key = f"reset_password:{reset_token}"
    redis_client.set_cache(redis_key, email, expire=900)

    # Send Link
    import email_service
    success = email_service.send_password_reset_link(email, reset_token)
    
    if not success:
         raise HTTPException(status_code=500, detail="Falha ao enviar email. Tente novamente mais tarde.")

    return {"message": "Um link de redefinição de senha foi enviado para o seu email."}

@app.post("/auth/reset-password", tags=["Authentication"], summary="Reset Password", description="Reset password using a valid token.")
async def reset_password(reset_data: schemas.ResetPasswordSchema, db: Session = Depends(get_db)):
    token = reset_data.token
    new_password = reset_data.new_password
    
    # Verify Token
    redis_key = f"reset_password:{token}"
    email = redis_client.get_cache(redis_key)
    
    if not email:
        raise HTTPException(status_code=400, detail="Token inválido ou expirado.")
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado.")
        
    # Update Password
    hashed_password = auth.get_password_hash(new_password)
    user.Senha_Criptografada = hashed_password
    db.commit()
    
    # Invalidate Token (Optional but recommended so it can't be reused)
    # Redis set_cache helper doesn't have delete, need to access client directly or just let it expire.
    # But for better security let's delete it.
    try:
        redis_client.redis_client.delete(redis_key)
    except:
        pass
        
    return {"message": "Senha redefinida com sucesso."}


@app.get("/admin/companies", response_model=List[schemas.Company], tags=["Admin"], summary="List Companies (Superadmin)", description="List all companies (Superadmin only).")
def get_companies(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_superadmin:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(models.Empresa).all()

import uuid
@app.post("/admin/companies", response_model=schemas.Company, tags=["Admin"], summary="Create Company", description="Create a new company (Superadmin only).")
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_superadmin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Check if user email already exists
    if db.query(models.User).filter(models.User.email == company.email_usuario).first():
        raise HTTPException(status_code=400, detail="User email already registered")

    new_key = f"sk_{uuid.uuid4().hex}"
    db_company = models.Empresa(
        Nome=company.Nome,
        api_key=new_key,
        Status=True
    )
    db.add(db_company)
    db.commit()
    db.refresh(db_company)

    # Auto-create user
    alphabet = string.ascii_letters + string.digits
    password = ''.join(secrets.choice(alphabet) for i in range(12))
    hashed_password = auth.get_password_hash(password)
    
    db_user = models.User(
        email=company.email_usuario,
        Senha_Criptografada=hashed_password,
        Empresa_id=db_company.id,
        is_superadmin=False,
        admin=True
    )
    db.add(db_user)
    db.commit()

    # Send Email with temporary password
    import email_service
    try:
        email_service.send_temporary_password(company.email_usuario, password)
    except Exception as e:
        print(f"Error sending email to {company.email_usuario}: {e}")
        # We might want to warn the admin, but for now we print to log. 
        # The company is created, so we don't rollback.

    return db_company

@app.post("/users", response_model=schemas.UserMe, tags=["Users"], summary="Create User", description="Create a new user. If password is not provided, one will be generated and sent via email.")
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Authorization: Must be Admin or Superadmin
    if not (current_user.admin or current_user.is_superadmin):
        raise HTTPException(status_code=403, detail="Not authorized. Only Admins can create users.")
    
    # Validation: Email unique
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    password_to_use = user.password
    if not password_to_use:
        # Generate password
        alphabet = string.ascii_letters + string.digits
        password_to_use = ''.join(secrets.choice(alphabet) for i in range(12))
    
    hashed_password = auth.get_password_hash(password_to_use)
    
    company_id = current_user.Empresa_id
    
    new_user = models.User(
        email=user.email,
        Senha_Criptografada=hashed_password,
        Empresa_id=company_id,
        is_superadmin=False,
        admin=user.is_admin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send email if password was generated (or even if not, maybe good practice to notify, but requirement emphasizes auto-generation)
    if not user.password:
        import email_service
        try:
            email_service.send_temporary_password(user.email, password_to_use)
        except Exception as e:
            print(f"Error sending email to {user.email}: {e}")
            # Don't fail the request if email fails, but log it.

    return new_user

@app.get("/users", response_model=List[schemas.UserResponse], tags=["Users"], summary="List Users", description="List all users in the current company.")
def list_users(
    pageNumber: int = Query(1, ge=1, description="Número da página"), 
    totalSize: int = Query(100, ge=1, le=100, description="Tamanho da página"), 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if not (current_user.admin or current_user.is_superadmin):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    skip = (pageNumber - 1) * totalSize
    limit = totalSize
    users = db.query(models.User).filter(models.User.Empresa_id == current_user.Empresa_id).offset(skip).limit(limit).all()
    return users

@app.delete("/users/{user_id}", tags=["Users"], summary="Delete User", description="Delete a user from the same company.")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not (current_user.admin or current_user.is_superadmin):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    user_to_delete = db.query(models.User).filter(models.User.id == user_id).first()
    
    if not user_to_delete:
        raise HTTPException(status_code=404, detail="User not found")
        
    if user_to_delete.Empresa_id != current_user.Empresa_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete user from another company")
        
    if user_to_delete.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    db.delete(user_to_delete)
    db.commit()
    return {"message": "User deleted successfully"}

@app.patch("/users/me/password", tags=["Users"], summary="Change Password", description="Change the current user's password.")
def change_password(
    password_update: schemas.UserPasswordUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    # Verify old password
    if not auth.verify_password(password_update.old_password, current_user.Senha_Criptografada):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    
    # Hash new password
    hashed_password = auth.get_password_hash(password_update.new_password)
    
    # Update user
    current_user.Senha_Criptografada = hashed_password
    db.commit()
    
    return {"message": "Senha alterada com sucesso"}

@app.patch("/admin/companies/{company_id}/status", response_model=schemas.Company, tags=["Admin"], summary="Update Company Status", description="Update company status (Active/Inactive) (Superadmin only).")
def update_company_status(company_id: int, status_update: bool = Query(..., description="New status (true=Active, false=Inactive)"), db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not current_user.is_superadmin:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    company = db.query(models.Empresa).filter(models.Empresa.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    company.Status = status_update
    db.commit()
    db.refresh(company)
    return company

@app.post("/refresh-cache", tags=["System"], summary="Refresh Cache", description="Force a refresh of the dashboard data cache for the authenticated company.")
async def refresh_cache(
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Force update the database cache for a specific company."""
    try:
        # Run update for specific company
        count = await asyncio.to_thread(cache_logic.fetch_and_cache_data, db, current_user.Empresa_id)
        return {"message": "Cache refreshed successfully", "items_cached": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh cache: {str(e)}")

@app.get("/filters", response_model=schemas.FilterOptions, tags=["Calls"], summary="Get Filter Options", description="Retrieve available options for filtering calls.")
async def get_filters(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Try getting from Redis first to filter by company (since filters are now dynamic based on what you can see)
    # The pure 'CACHE_KEY_FILTERS' is global, so it leaks other companies' data if used directly.
    # We must derive filters from the calls visible to the user.
    
    # Efficient way: Get all calls for the company from cache, then extract filters.
    # We call cache_logic.get_cached_calls with a massive limit or bypass pagination? 
    # Or we just trust the cache structure. 'get_cached_calls' filters by company already.
    # Note: Fetching ALL calls might be heavy if thousands. But for filters we need unique values.
    
    # Let's assume we can fetch all calls for the company from cache efficiently (in memory filtering).
    all_company_calls = cache_logic.get_cache(f"{cache_logic.CACHE_KEY_CALLS}:{current_user.Empresa_id}")
    
    if all_company_calls:
        # Filter by company
        company_calls = [c for c in all_company_calls if c.get('Empresa_id') == current_user.Empresa_id]
        return cache_logic.get_unique_filters(company_calls)

    # Fallback to DB if cache empty
    return {
        "temas": [r[0] for r in db.query(models.Theme.Temas).join(models.CogfyAll).filter(models.CogfyAll.Empresa_id == current_user.Empresa_id).distinct().all() if r[0]],
        "sentimento_inicial": [r[0] for r in db.query(models.InitialCustomerSentiment.Sentimento).join(models.CogfyAll).filter(models.CogfyAll.Empresa_id == current_user.Empresa_id).distinct().all() if r[0]],
        "sentimento_final": [r[0] for r in db.query(models.EndCustomerSentiment.Sentimento).join(models.CogfyAll).filter(models.CogfyAll.Empresa_id == current_user.Empresa_id).distinct().all() if r[0]],
        "sentimento_agente": [r[0] for r in db.query(models.AgentSentiment.Sentimento).join(models.CogfyAll).filter(models.CogfyAll.Empresa_id == current_user.Empresa_id).distinct().all() if r[0]],
        "criterios_rn623": [r[0] for r in db.query(models.CriterioAtendidoRN623.Criterio).join(models.CogfyAll).filter(models.CogfyAll.Empresa_id == current_user.Empresa_id).distinct().all() if r[0]],
        "sentimento_geral": [r[0] for r in db.query(models.CogfyAll.Overall_customer_sentiment).filter(models.CogfyAll.Empresa_id == current_user.Empresa_id).distinct().all() if r[0]],
        "resolucao": [r[0] for r in db.query(models.CogfyAll.Resolution_Status).filter(models.CogfyAll.Empresa_id == current_user.Empresa_id).distinct().all() if r[0]],
        "qualidade_servico": [r[0] for r in db.query(models.CogfyAll.Quality_of_service).filter(models.CogfyAll.Empresa_id == current_user.Empresa_id).distinct().all() if r[0]],
        "nivel_conformidade_rn": [r[0] for r in db.query(models.CogfyAll.Nivel_Conformidade_RN).filter(models.CogfyAll.Empresa_id == current_user.Empresa_id).distinct().all() if r[0]],
    }

@app.get("/calls", response_model=schemas.CallResponse, tags=["Calls"], summary="List Calls", description="Retrieve a list of calls with optional filtering, sorting, and pagination.")
async def get_calls(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    pageNumber: int = Query(1, ge=1, description="Número da página"),
    totalSize: int = Query(10, ge=1, le=100, description="Tamanho da página"),
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    order: Optional[str] = "asc",
    min_duration: Optional[float] = None,
    max_duration: Optional[float] = None,
    min_score: Optional[int] = None,
    max_score: Optional[int] = None,
    min_silence: Optional[float] = None,
    max_silence: Optional[float] = None,
    min_rn623_points: Optional[int] = None,
    max_rn623_points: Optional[int] = None,
    min_rn623_score: Optional[float] = None,
    max_rn623_score: Optional[float] = None,
    temas: Optional[List[str]] = Query(None),
    sentimento_inicial: Optional[List[str]] = Query(None),
    sentimento_final: Optional[List[str]] = Query(None),
    sentimento_agente: Optional[List[str]] = Query(None),
    criterios_rn623: Optional[List[str]] = Query(None),
    sentimento_geral: Optional[List[str]] = Query(None),
    resolucao: Optional[List[str]] = Query(None),
    qualidade_servico: Optional[List[str]] = Query(None),
    nivel_conformidade_rn: Optional[List[str]] = Query(None),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
):

    # Calculate skip and limit for internal logic
    skip = (pageNumber - 1) * totalSize
    limit = totalSize

    # Try fetching from Cache
    result = cache_logic.get_cached_calls(
        skip=skip, limit=limit, search=search, sort_by=sort_by, order=order,
        min_duration=min_duration, max_duration=max_duration,
        min_score=min_score, max_score=max_score,
        min_silence=min_silence, max_silence=max_silence,
        min_rn623_points=min_rn623_points, max_rn623_points=max_rn623_points,
        min_rn623_score=min_rn623_score, max_rn623_score=max_rn623_score,
        temas=temas, sentimento_inicial=sentimento_inicial,
        sentimento_final=sentimento_final, sentimento_agente=sentimento_agente,
        criterios_rn623=criterios_rn623, sentimento_geral=sentimento_geral,
        resolucao=resolucao, qualidade_servico=qualidade_servico,
        nivel_conformidade_rn=nivel_conformidade_rn,
        start_date=start_date, end_date=end_date,
        empresa_id=current_user.Empresa_id # Pass company ID for filtering
    )

    if result is not None:
        return result

    # Fallback to DB query if cache is missing (e.g. first run)
    
    query = db.query(models.CogfyAll).filter(models.CogfyAll.Empresa_id == current_user.Empresa_id)

    if search:
        search_filter = or_(
            models.CogfyAll.Agent_name.like(f"%{search}%"),
            models.CogfyAll.Customer_Name.like(f"%{search}%"),
            models.CogfyAll.Resolution_Status.like(f"%{search}%"),
             models.CogfyAll.Protocol_Number.like(f"%{search}%")
        )
        query = query.filter(search_filter)

    if start_date:
        query = query.filter(models.CogfyAll.Create_date >= start_date)
    if end_date:
        query = query.filter(models.CogfyAll.Create_date <= f"{end_date} 23:59:59")

    if min_duration is not None:
        query = query.filter(models.CogfyAll.Call_duration >= min_duration)
    if max_duration is not None:
        query = query.filter(models.CogfyAll.Call_duration <= max_duration)
    if min_score is not None:
        query = query.filter(models.CogfyAll.IRC_Score >= min_score)
    if max_score is not None:
        query = query.filter(models.CogfyAll.IRC_Score <= max_score)

    if min_silence is not None:
        query = query.filter(models.CogfyAll.Call_silence >= min_silence)
    if max_silence is not None:
        query = query.filter(models.CogfyAll.Call_silence <= max_silence)

    if min_rn623_points is not None:
        query = query.filter(models.CogfyAll.Pontos_Obtidos_RN623 >= min_rn623_points)
    if max_rn623_points is not None:
        query = query.filter(models.CogfyAll.Pontos_Obtidos_RN623 <= max_rn623_points)

    if min_rn623_score is not None:
        query = query.filter(models.CogfyAll.Score_Conformidade_RN623 >= min_rn623_score)
    if max_rn623_score is not None:
        query = query.filter(models.CogfyAll.Score_Conformidade_RN623 <= max_rn623_score)

    if temas:
        for tema in temas:
            query = query.filter(models.CogfyAll.themes.any(models.Theme.Temas == tema))
    if sentimento_inicial:
        for sentimento in sentimento_inicial:
            query = query.filter(models.CogfyAll.initial_customer_sentiments.any(models.InitialCustomerSentiment.Sentimento == sentimento))
    if sentimento_final:
        for sentimento in sentimento_final:
            query = query.filter(models.CogfyAll.end_customer_sentiments.any(models.EndCustomerSentiment.Sentimento == sentimento))
    if sentimento_agente:
        for sentimento in sentimento_agente:
            query = query.filter(models.CogfyAll.agent_sentiments.any(models.AgentSentiment.Sentimento == sentimento))
    if criterios_rn623:
        for criterio in criterios_rn623:
            query = query.filter(models.CogfyAll.criterios_rn623.any(models.CriterioAtendidoRN623.Criterio == criterio))
    
    if sentimento_geral:
        query = query.filter(models.CogfyAll.Overall_customer_sentiment.in_(sentimento_geral))
    if resolucao:
        query = query.filter(models.CogfyAll.Resolution_Status.in_(resolucao))
    if qualidade_servico:
        query = query.filter(models.CogfyAll.Quality_of_service.in_(qualidade_servico))
    if nivel_conformidade_rn:
        query = query.filter(models.CogfyAll.Nivel_Conformidade_RN.in_(nivel_conformidade_rn))

    if sort_by:
        field = getattr(models.CogfyAll, sort_by, None)
        if field:
            if order == "desc":
                query = query.order_by(desc(field))
            else:
                query = query.order_by(asc(field))
        else:
            query = query.order_by(desc(models.CogfyAll.Create_date))
    else:
        query = query.order_by(desc(models.CogfyAll.Create_date))

    total = query.count()
    calls = query.offset(skip).limit(limit).all()

    return {"total": total, "data": calls}

@app.get("/gatilhos", response_model=List[schemas.Gatilho], tags=["Triggers"], summary="List Triggers", description="List all triggers associated with the current user's company.")
def read_gatilhos(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Gatilho).filter(models.Gatilho.Empresa_id == current_user.Empresa_id).all()

@app.post("/gatilhos", response_model=schemas.Gatilho, tags=["Triggers"], summary="Create Trigger", description="Create a new trigger for the current user.")
def create_gatilho(gatilho: schemas.GatilhoCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_gatilho = models.Gatilho(
        Descricao=gatilho.Descricao,
        Empresa_id=current_user.Empresa_id,
        Usuario_id=current_user.id,
        Tipo=gatilho.Tipo or "WhatsApp",
        Destinatario=gatilho.Destinatario
    )
    db.add(db_gatilho)
    db.commit()
    db.refresh(db_gatilho)
    return db_gatilho

@app.delete("/gatilhos/{gatilho_id}", tags=["Triggers"], summary="Delete Trigger", description="Delete a specific trigger by ID.")
def delete_gatilho(gatilho_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_gatilho = db.query(models.Gatilho).filter(models.Gatilho.id == gatilho_id).first()
    if db_gatilho is None:
        raise HTTPException(status_code=404, detail="Gatilho not found")
    
    # Ownership Check: User who created it OR Admin/Superadmin of the SAME company
    is_owner = db_gatilho.Usuario_id == current_user.id
    is_company_admin = (current_user.admin or current_user.is_superadmin) and (db_gatilho.Empresa_id == current_user.Empresa_id)

    if not (is_owner or is_company_admin):
        raise HTTPException(status_code=403, detail="Not authorized to delete this trigger.")

    db.delete(db_gatilho)
    db.commit()
    return {"ok": True}

@app.patch("/gatilhos/{gatilho_id}", response_model=schemas.Gatilho, tags=["Triggers"], summary="Update Trigger", description="Update a specific trigger by ID.")
def update_gatilho(gatilho_id: int, gatilho_update: schemas.GatilhoUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_gatilho = db.query(models.Gatilho).filter(models.Gatilho.id == gatilho_id).first()
    if db_gatilho is None:
        raise HTTPException(status_code=404, detail="Gatilho not found")
    
    # Ownership Check: User who created it OR Admin/Superadmin of the SAME company
    is_owner = db_gatilho.Usuario_id == current_user.id
    is_company_admin = (current_user.admin or current_user.is_superadmin) and (db_gatilho.Empresa_id == current_user.Empresa_id)

    if not (is_owner or is_company_admin):
        raise HTTPException(status_code=403, detail="Not authorized to update this trigger.")

    if gatilho_update.Descricao is not None:
        db_gatilho.Descricao = gatilho_update.Descricao

    db.commit()
    db.refresh(db_gatilho)
    return db_gatilho

class AudioPayload(BaseModel):
    base64: str
    unique_id: str

@app.post("/call-analysis", status_code=status.HTTP_202_ACCEPTED, tags=["Analysis"], summary="Call Analysis", description="Process base64 audio datas.")
async def call_analysis(
    payload: AudioPayload,
    request: Request,
    x_api_key: str = Header(..., alias="x-api-key"),
    db: Session = Depends(get_db)
):
    # Verify API Key
    company = db.query(models.Empresa).filter(models.Empresa.api_key == x_api_key).first()
    if not company:
        raise HTTPException(status_code=403, detail="Invalid API Key")

    # Verify Unique ID
    existing_call = db.query(models.CogfyAll).filter(
        models.CogfyAll.unique_id == payload.unique_id,
        models.CogfyAll.Empresa_id == company.id
    ).first()

    if existing_call:
        raise HTTPException(status_code=409, detail="Unique ID already exists for this company")

    # Forward headers
    headers = dict(request.headers)
    # Remove hop-by-hop or problematic headers
    headers.pop("host", None)
    headers.pop("content-length", None)
    headers.pop("content-type", None) # Let httpx set it for JSON
    
    async with httpx.AsyncClient() as client:

        # Forward the JSON payload exactly as received with headers
        try:
            response = await client.post("https://webhulk.nagaragem.com/webhook/audgpfc", json=payload.dict(), headers=headers)
            return response.json()
        except httpx.RequestError as exc:
            raise HTTPException(status_code=500, detail=f"An error occurred while requesting {exc.request.url!r}.")
        except httpx.HTTPStatusError as exc:
             raise HTTPException(status_code=exc.response.status_code, detail=f"Error response {exc.response.status_code} while requesting {exc.request.url!r}.")

