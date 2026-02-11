from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, Float, ForeignKey, Boolean, Enum
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Empresa(Base):
    __tablename__ = "Empresas"
    id = Column(Integer, primary_key=True, index=True)
    Nome = Column(String(100), nullable=False)
    api_key = Column(String(100), nullable=True)
    Status = Column(Boolean, default=True) # True = Ativa, False = Inativa
    
    usuarios = relationship("User", back_populates="empresa")

class User(Base):
    __tablename__ = "Usuários"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(100), nullable=False)
    Senha_Criptografada = Column("Senha Criptografada", String(100), nullable=False)
    Empresa_id = Column("Empresa id", Integer, ForeignKey("Empresas.id"), nullable=False)
    is_superadmin = Column(Boolean, default=False)
    admin = Column(Boolean, default=False)
    
    empresa = relationship("Empresa", back_populates="usuarios")

class Gatilho(Base):
    __tablename__ = "Gatilhos"
    id = Column(Integer, primary_key=True, index=True)
    Descricao = Column("Descrição", Text, nullable=False)
    Empresa_id = Column("Empresa id", Integer, ForeignKey("Empresas.id"), nullable=False)
    Usuario_id = Column("Usuário id", Integer, ForeignKey("Usuários.id"), nullable=False)
    Tipo = Column("Tipo", String(50), nullable=False) # Saving as string for simplicity, could be Enum
    Destinatario = Column("Destinatário", String(100), nullable=False)

    # Optional relationships if needed
    empresa = relationship("Empresa")
    usuario = relationship("User")

class CogfyAll(Base):
    __tablename__ = "cogfy-all"
    id = Column(Integer, primary_key=True, index=True)
    Lemon_Fox_Transcribe_audio = Column("Lemon Fox: Transcribe audio", JSON)
    Chat_From_Transcription = Column("Chat From Transcription", JSON)
    Create_date = Column("Create date", DateTime, default=datetime.datetime.utcnow)
    Dialogue = Column(Text)
    Dialogue_Analysis_Result = Column("Dialogue Analysis Result", JSON)
    IRC_Analysis_Result = Column("IRC Analysis Result", JSON)
    Wait_Time_Analysis_Result = Column("Wait Time Analysis Result", JSON)
    RN623_analysis_result = Column("RN623 analysis result", JSON)
    Theme_analysis_result = Column("Theme analysis result", JSON)
    Consolidated_JSON = Column("Consolidated JSON", JSON)
    Resumo = Column(Text)
    Variacao_de_sentimento_do_cliente = Column("Variação de sentimento do cliente", String(255))
    Agent_name = Column("Agent name", String(255))
    Protocol_Number = Column("Protocol Number", String(255))
    Customer_Name = Column("Customer Name", String(255))
    Customer_CPF = Column("Customer CPF", String(14))
    Resolution_Status = Column("Resolution Status", String(50)) # Enum in DB
    Quality_of_service = Column("Quality of service", String(50)) # Enum in DB
    IRC_Score = Column("IRC Score", Integer)
    IRC_Score_Pilar_1 = Column("IRC Score Pilar 1", String(255))
    IRC_Score_Pilar_2 = Column("IRC Score Pilar 2", String(255))
    IRC_Score_Pilar_3 = Column("IRC Score Pilar 3", String(255))
    IRC_Score_Pilar_4 = Column("IRC Score Pilar 4", String(255))
    IRC_Classification = Column("IRC Classification", String(50)) # Enum in DB
    Pilar_1_IRC_Snippets = Column("Pilar 1 IRC Snippets", String(255))
    Pilar_2_IRC_Snippets = Column("Pilar 2 IRC Snippets", String(255))
    Pilar_3_IRC_Snippets = Column("Pilar 3 IRC Snippets", String(255))
    Pilar_4_IRC_Snippets = Column("Pilar 4 IRC Snippets", String(255))
    Pilar_1_Justificativa = Column("Pilar 1 Justificativa", Text)
    Pilar_2_Justificativa = Column("Pilar 2 Justificativa", Text)
    Pilar_3_Justificativa = Column("Pilar 3 Justificativa", Text)
    Pilar_4_Justificativa = Column("Pilar 4 Justificativa", Text)
    Call_duration = Column("Call duration", Float)
    Call_silence = Column("Call silence", Float)
    Pontos_Obtidos_RN623 = Column("Pontos Obtidos RN623", Integer)
    Score_Conformidade_RN623 = Column("Score Conformidade RN623", Float)
    Nivel_Conformidade_RN = Column("Nível Conformidade RN", String(255))
    UUID = Column("UUID", String(36), nullable=False)
    Overall_customer_sentiment = Column("Overall customer sentiment", String(100), nullable=False)
    Empresa_id = Column("Empresa id", Integer, nullable=False)
    unique_id = Column("Identificador Único", String(255), nullable=True)

    agent_sentiments = relationship("AgentSentiment", back_populates="call")
    end_customer_sentiments = relationship("EndCustomerSentiment", back_populates="call")
    initial_customer_sentiments = relationship("InitialCustomerSentiment", back_populates="call")
    themes = relationship("Theme", back_populates="call")
    criterios_rn = relationship("CriterioAplicavelRN", back_populates="call")
    criterios_rn623 = relationship("CriterioAtendidoRN623", back_populates="call")

class AgentSentiment(Base):
    __tablename__ = "Agent sentiments"
    id = Column(Integer, primary_key=True, index=True)
    Sentimento = Column(String(100), nullable=False)
    Ligacao_id = Column("Ligação id", Integer, ForeignKey("cogfy-all.id"), nullable=False)
    
    call = relationship("CogfyAll", back_populates="agent_sentiments")

class EndCustomerSentiment(Base):
    __tablename__ = "End customer sentiment"
    id = Column(Integer, primary_key=True, index=True)
    Sentimento = Column(String(100), nullable=False)
    Ligacao_id = Column("Ligação id", Integer, ForeignKey("cogfy-all.id"), nullable=False)
    
    call = relationship("CogfyAll", back_populates="end_customer_sentiments")

class InitialCustomerSentiment(Base):
    __tablename__ = "Initial customer sentiment"
    id = Column(Integer, primary_key=True, index=True)
    Sentimento = Column(String(100), nullable=False)
    Ligacao_id = Column("Ligação id", Integer, ForeignKey("cogfy-all.id"), nullable=False)
    
    call = relationship("CogfyAll", back_populates="initial_customer_sentiments")

class Theme(Base):
    __tablename__ = "Themes"
    id = Column(Integer, primary_key=True, index=True)
    Temas = Column(String(100), nullable=False)
    Ligacao_id = Column("Ligação id", Integer, ForeignKey("cogfy-all.id"), nullable=False)
    
    call = relationship("CogfyAll", back_populates="themes")

class CriterioAplicavelRN(Base):
    __tablename__ = "Critérios Aplicáveis RN"
    id = Column(Integer, primary_key=True, index=True)
    Criterio = Column("Critério", String(255), nullable=False)
    Ligacao_id = Column("Ligação id", Integer, ForeignKey("cogfy-all.id"), nullable=False)
    
    call = relationship("CogfyAll", back_populates="criterios_rn")

class CriterioAtendidoRN623(Base):
    __tablename__ = "Critérios Atendidos RN623"
    id = Column(Integer, primary_key=True, index=True)
    Criterio = Column("Critério", String(255), nullable=False)
    Ligacao_id = Column("Ligação id", Integer, ForeignKey("cogfy-all.id"), nullable=False)
    
    call = relationship("CogfyAll", back_populates="criterios_rn623")
