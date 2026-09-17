import logging
from typing import Any, Optional
import asyncio
from app.config import settings

logger = logging.getLogger(__name__)

async def send_email(to_email: str, subject: str, body: str, html: Optional[str] = None) -> bool:
    """
    Send an email using SMTP. Falls back to logging if SMTP is not configured.
    """
    if not settings.SMTP_SERVER or not settings.SMTP_PORT:
        logger.info(f"[MOCK EMAIL] To: {to_email} | Subject: {subject}")
        logger.info(f"[MOCK EMAIL] Body: {body[:200]}")
        return True

    try:
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = settings.MAIL_FROM or settings.SMTP_USER or "no-reply@tuiyabelong.com"
        msg["To"] = to_email

        msg.attach(MIMEText(body, "plain"))
        if html:
            msg.attach(MIMEText(html, "html"))

        def _send():
            with smtplib.SMTP(settings.SMTP_SERVER, int(settings.SMTP_PORT), timeout=15) as server:
                server.ehlo()
                if settings.SMTP_PORT in (587, 465):
                    server.starttls()
                    server.ehlo()
                if settings.SMTP_USER and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)

        await asyncio.to_thread(_send)
        logger.info(f"Email sent to {to_email} with subject: {subject}")
        return True
    except Exception as e:
        logger.error(f"Email sending failed for {to_email}: {e}")
        return False

async def send_payment_reminder(to_email: str, unit_number: str):
    subject = f"Payment Reminder for {unit_number}"
    body = f"Hello, your payment for unit {unit_number} is due soon."
    await send_email(to_email, subject, body)

async def send_payment_receipt(to_email: str, amount: float):
    subject = f"Payment Receipt: {amount}"
    body = f"Thank you for your payment of {amount}."
    await send_email(to_email, subject, body)