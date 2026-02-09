from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os

# Configuração
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "RYqOsHx1H86Lm8DrbK7c")
DB_HOST = os.getenv("DB_HOST", "mysqlgaragem.zrhdsarhreh.shop") # Certifique-se que este domínio aponta para o IP do servidor
DB_NAME = os.getenv("DB_NAME", "voz_ativa")
DB_PORT = os.getenv("DB_PORT", "3306") # Conectaremos na porta exposta diretamente

# String de conexão limpa
SQLALCHEMY_DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Engine simplificada
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_recycle=3600,
    pool_pre_ping=True
    # connect_args removidos pois conexão direta não precisa de tunelamento SSL forçado
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

if __name__ == "__main__":
    try:
        # Teste de conexão
        with engine.connect() as conn:
            print("✅ Conexão estabelecida com sucesso na porta 3306!")
            rs = conn.execute("SELECT VERSION();")
            print(f"Versão: {rs.fetchone()[0]}")
    except Exception as e:
        print(f"❌ Erro: {e}")