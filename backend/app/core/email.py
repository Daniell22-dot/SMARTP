import logging
from typing import Any, Optional
from app.config import settings

logger = logging.getLogger(__name__)

async def send_email(to_email: str, subject: str, body: str):
    """
    Mock email sending logic. In production, replace with aiosmtplib or similar.
    """
    logger.info(f"Sending email to {to_email} with subject: {subject}")
    # TODO: Implement real SMTP sending using settings.SMTP_SERVER, etc.

async def send_payment_reminder(to_email: str, unit_number: str):
    subject = f"Payment Reminder for {unit_number}"
    body = f"Hello, your payment for unit {unit_number} is due soon."
    await send_email(to_email, subject, body)

async def send_payment_receipt(to_email: str, amount: float):
    subject = f"Payment Receipt: {amount}"
    body = f"Thank you for your payment of {amount}."
    await send_email(to_email, subject, body)
