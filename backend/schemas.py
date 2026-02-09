from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str
    
class UserCreate(BaseModel):
    email: str
    password: Optional[str] = None
    is_admin: bool = False

class ResetPasswordSchema(BaseModel):
    token: str
    new_password: str

class UserPasswordUpdate(BaseModel):
    old_password: str
    new_password: str


    
class Company(BaseModel):
    id: int
    Nome: str
    Status: Optional[bool] = True
    class Config:
        from_attributes = True

class CompanyCreate(BaseModel):
    Nome: str
    email_usuario: str

class UserMe(BaseModel):
    id: int
    Empresa_id: int
    empresa: Optional[Company] = None
    is_superadmin: bool = False
    empresa: Optional[Company] = None
    is_superadmin: bool = False
    admin: bool = False

class UserResponse(BaseModel):
    id: int
    email: str
    admin: bool
    is_superadmin: bool
    Create_date: Optional[datetime] = None 
    
    class Config:
        from_attributes = True

    
class GatilhoBase(BaseModel):
    Descricao: str = Field(..., description="Descrição do gatilho", example="Gatilho de vendas")
    Empresa_id: Optional[int] = Field(None, description="ID da empresa associada")
    Usuario_id: Optional[int] = Field(None, description="ID do usuário criador")
    Tipo: Optional[str] = Field("WhatsApp", description="Canal de envio", example="WhatsApp")
    Destinatario: Optional[str] = None

from typing import Literal

class GatilhoCreate(BaseModel):
    Descricao: str = Field(..., description="Descrição do novo gatilho")
    Destinatario: str = Field(..., description="Número ou email do destinatário", example="+5511999999999")
    Tipo: Literal["Email", "WhatsApp"] = Field("WhatsApp", description="Tipo do gatilho")

class GatilhoUpdate(BaseModel):
    Descricao: Optional[str] = Field(None, description="Nova descrição")

class Gatilho(GatilhoBase):
    id: int
    class Config:
        from_attributes = True

class AgentSentimentBase(BaseModel):
    Sentimento: str
    class Config:
        from_attributes = True

class EndCustomerSentimentBase(BaseModel):
    Sentimento: str
    class Config:
        from_attributes = True

class InitialCustomerSentimentBase(BaseModel):
    Sentimento: str
    class Config:
        from_attributes = True

class ThemeBase(BaseModel):
    Temas: str
    class Config:
        from_attributes = True

class CriterioAplicavelRNBase(BaseModel):
    Criterio: str
    class Config:
        from_attributes = True

class CriterioAtendidoRN623Base(BaseModel):
    Criterio: str
    class Config:
        from_attributes = True

class CallData(BaseModel):
    id: int
    Create_date: Optional[datetime]
    Agent_name: Optional[str]
    Customer_Name: Optional[str]
    Resolution_Status: Optional[str]
    Quality_of_service: Optional[str]
    Call_duration: Optional[float]
    Overall_customer_sentiment: Optional[str]
    Resumo: Optional[str]
    unique_id: Optional[str] = Field(None, alias="unique_id")
    
    # New Fields
    Dialogue: Optional[str]
    Variacao_de_sentimento_do_cliente: Optional[str] # Mapped from "Variação de sentimento do cliente"
    Protocol_Number: Optional[str]
    Customer_CPF: Optional[str]
    IRC_Score: Optional[int]
    IRC_Score_Pilar_1: Optional[str]
    IRC_Score_Pilar_2: Optional[str]
    IRC_Score_Pilar_3: Optional[str]
    IRC_Score_Pilar_4: Optional[str]
    IRC_Classification: Optional[str]
    Pilar_1_IRC_Snippets: Optional[str]
    Pilar_2_IRC_Snippets: Optional[str]
    Pilar_3_IRC_Snippets: Optional[str]
    Pilar_4_IRC_Snippets: Optional[str]
    Pilar_1_Justificativa: Optional[str]
    Pilar_2_Justificativa: Optional[str]
    Pilar_3_Justificativa: Optional[str]
    Pilar_4_Justificativa: Optional[str]
    Call_silence: Optional[float]
    Pontos_Obtidos_RN623: Optional[int]
    Score_Conformidade_RN623: Optional[float]
    Nivel_Conformidade_RN: Optional[str] # Mapped from "Nível Conformidade RN"
    Empresa_id: Optional[int]

    # Relations
    themes: List[ThemeBase] = []
    initial_customer_sentiments: List[InitialCustomerSentimentBase] = []
    end_customer_sentiments: List[EndCustomerSentimentBase] = []
    agent_sentiments: List[AgentSentimentBase] = []
    criterios_rn: List[CriterioAplicavelRNBase] = []
    criterios_rn623: List[CriterioAtendidoRN623Base] = []

    class Config:
        from_attributes = True

class CallResponse(BaseModel):
    total: int
    data: List[CallData]

class FilterOptions(BaseModel):
    temas: List[str] = Field([], description="Lista de temas disponíveis")
    sentimento_inicial: List[str] = Field([], description="Tipos de sentimento inicial")
    sentimento_final: List[str] = Field([], description="Tipos de sentimento final")
    sentimento_agente: List[str] = Field([], description="Sentimentos do agente")
    criterios_rn623: List[str] = Field([], description="Critérios RN623")
    sentimento_geral: List[str] = Field([], description="Sentimento geral do cliente")
    resolucao: List[str] = Field([], description="Status de resolução")
    qualidade_servico: List[str] = Field([], description="Qualidade do serviço")
    nivel_conformidade_rn: List[str] = Field([], description="Níveis de conformidade RN")
