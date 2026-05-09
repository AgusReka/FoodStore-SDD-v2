"""Email sending service with development console fallback."""
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

from backend.core.config import settings


class MailService:
    """Service for sending transactional emails.

    In development (no SMTP configured), emails are printed to console.
    In production (SMTP configured), sends via the configured SMTP server.
    """

    def __init__(self, mail_settings: Any = None):
        self.settings = mail_settings or settings

    @property
    def configured(self) -> bool:
        """Check if SMTP is fully configured for sending real emails."""
        return self.settings.mail_configured

    async def send_reset_password(
        self,
        to_email: str,
        reset_url: str,
    ) -> None:
        """Send password reset email.

        Args:
            to_email: Recipient email address.
            reset_url: Full URL to reset password (frontend).
        """
        subject = "Restablecer tu contraseña - FoodStore"
        body = f"""\
Hola,

Recibiste este correo porque solicitaste restablecer tu contraseña en FoodStore.

Hacé clic en el siguiente enlace para crear una nueva contraseña:
{reset_url}

Este enlace expirará en 1 hora.

Si no solicitaste este cambio, ignorá este correo.

Saludos,
Equipo FoodStore
"""
        html_body = f"""\
<html>
  <body>
    <h2>Restablecer tu contraseña</h2>
    <p>Hola,</p>
    <p>Recibiste este correo porque solicitaste restablecer tu contraseña.</p>
    <p>
      <a href="{reset_url}" style="display:inline-block;padding:12px 24px;background-color:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">
        Restablecer Contraseña
      </a>
    </p>
    <p>O copiá este enlace: {reset_url}</p>
    <p><small>Este enlace expirará en 1 hora.</small></p>
    <p>Si no solicitaste este cambio, ignorá este correo.</p>
    <hr>
    <p>Equipo FoodStore</p>
  </body>
</html>
"""
        await self._send(to_email, subject, body, html_body)

    async def send_verification_email(
        self,
        to_email: str,
        verify_url: str,
    ) -> None:
        """Send email verification email.

        Args:
            to_email: Recipient email address.
            verify_url: Full URL to verify email (frontend).
        """
        subject = "Verifica tu email - FoodStore"
        body = f"""\
Hola,

Bienvenido a FoodStore. Verificá tu dirección de email para activar tu cuenta.

Hacé clic en el siguiente enlace:
{verify_url}

Este enlace expirará en 24 horas.

Saludos,
Equipo FoodStore
"""
        html_body = f"""\
<html>
  <body>
    <h2>Verifica tu email</h2>
    <p>Hola,</p>
    <p>Bienvenido a FoodStore. Verificá tu dirección de email para activar tu cuenta.</p>
    <p>
      <a href="{verify_url}" style="display:inline-block;padding:12px 24px;background-color:#16a34a;color:#fff;text-decoration:none;border-radius:6px;">
        Verificar Email
      </a>
    </p>
    <p>O copiá este enlace: {verify_url}</p>
    <p><small>Este enlace expirará en 24 horas.</small></p>
    <hr>
    <p>Equipo FoodStore</p>
  </body>
</html>
"""
        await self._send(to_email, subject, body, html_body)

    async def _send(
        self,
        to_email: str,
        subject: str,
        plain_body: str,
        html_body: str | None = None,
    ) -> None:
        """Internal send method — routes to console or SMTP."""
        if not self.configured:
            self._print_to_console(to_email, subject, plain_body)
            return

        try:
            self._send_smtp(to_email, subject, plain_body, html_body)
        except Exception as e:
            print(f"[MailService] Failed to send email to {to_email}: {e}")
            if self.settings.DEBUG:
                self._print_to_console(to_email, subject, plain_body)

    def _print_to_console(self, to_email: str, subject: str, body: str) -> None:
        """Development mode: print email to console."""
        print("=" * 70)
        print(f"[DEV MODE] Email NOT sent — SMTP not configured")
        print(f"To: {to_email}")
        print(f"Subject: {subject}")
        print("-" * 70)
        print(body)
        print("=" * 70)

    def _send_smtp(
        self,
        to_email: str,
        subject: str,
        plain_body: str,
        html_body: str | None = None,
    ) -> None:
        """Send email via SMTP (sync - ok for low volume transactional email)."""
        from_email = self.settings.MAIL_FROM

        msg = MIMEMultipart("alternative")
        msg["From"] = from_email
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(plain_body, "plain"))
        if html_body:
            msg.attach(MIMEText(html_body, "html"))

        host = self.settings.MAIL_HOST
        port = self.settings.MAIL_PORT
        username = self.settings.MAIL_USERNAME
        password = self.settings.MAIL_PASSWORD
        use_starttls = self.settings.MAIL_STARTTLS
        use_ssl = self.settings.MAIL_SSL_TLS

        if use_ssl:
            server = smtplib.SMTP_SSL(host, port)
        else:
            server = smtplib.SMTP(host, port)

        try:
            if use_starttls and not use_ssl:
                server.ehlo()
                server.starttls()
                server.ehlo()

            if username and password:
                server.login(username, password)

            server.sendmail(from_email, [to_email], msg.as_string())
        finally:
            server.quit()


# Global mail service instance
mail_service = MailService()
