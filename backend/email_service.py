import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import logging

import os

# Configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "email-smtp.us-east-1.amazonaws.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "465"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
FROM_EMAIL = os.getenv("FROM_EMAIL", "notificacao@facilinformatica.com.br")

logger = logging.getLogger(__name__)

def send_email(to_email: str, subject: str, body: str):
    try:
        msg = MIMEMultipart()
        msg['From'] = FROM_EMAIL
        msg['To'] = to_email
        msg['Subject'] = subject

        msg.attach(MIMEText(body, 'plain'))

        # Connect to server using SSL
        server = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT)
        server.login(SMTP_USERNAME, SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        print(f"Failed to send email: {e}") # Printing to console for debugging visibility
        return False

def send_temporary_password(to_email: str, temp_password: str):
    subject = "Recuperação de Senha - Voz Ativa"
    body = f"""Olá,

Recebemos uma solicitação de recuperação de senha para sua conta no Voz Ativa.

Sua nova senha temporária é: {temp_password}

Por favor, faça login e altere sua senha imediatamente.

Atenciosamente,
Equipe Voz Ativa
"""
    return send_email(to_email, subject, body)

def send_password_reset_link(to_email: str, token: str):
    subject = "Redefinição de Senha - Voz Ativa"
    frontend_url = os.getenv("FRONTEND_URL")
    reset_link = f"{frontend_url}/reset-password?token={token}"
    
    body = f"""Olá,

Recebemos uma solicitação de redefinição de senha para sua conta no Voz Ativa.

Para definir uma nova senha, clique no link abaixo (válido por 15 minutos):
{reset_link}

Se você não solicitou isso, pode ignorar este email.

Atenciosamente,
Equipe Voz Ativa
"""
    return send_email(to_email, subject, body)
