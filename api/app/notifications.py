import smtplib
from email.mime.text import MIMEText
from .config import settings


def send_email(subject: str, body: str, to_addrs: list[str]):
    if not settings.SMTP_HOST or not settings.SMTP_USER or not settings.SMTP_PASS:
        # Placeholder: skip if not configured
        print(f"[EMAIL MOCK] To={to_addrs} Subj={subject}\n{body}")
        return
    msg = MIMEText(body)
    msg["Subject"] = subject
    msg["From"] = settings.SMTP_FROM
    msg["To"] = ", ".join(to_addrs)
    with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
        server.starttls()
        server.login(settings.SMTP_USER, settings.SMTP_PASS)
        server.sendmail(settings.SMTP_FROM, to_addrs, msg.as_string())


