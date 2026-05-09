"""Shared enum types for Food Store domain."""
import enum


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    CLIENTE = "cliente"


class OrderStatus(str, enum.Enum):
    PENDIENTE = "pendiente"
    CONFIRMADO = "confirmado"
    PREPARANDO = "preparando"
    ENVIADO = "enviado"
    ENTREGADO = "entregado"
    CANCELADO = "cancelado"


class PaymentMethod(str, enum.Enum):
    EFECTIVO = "efectivo"
    TRANSFERENCIA = "transferencia"
    MERCADOPAGO = "mercadopago"


class PaymentStatus(str, enum.Enum):
    PENDIENTE = "pendiente"
    APROBADO = "aprobado"
    RECHAZADO = "rechazado"
    REEMBOLSADO = "reembolsado"


class AuthTokenPurpose(str, enum.Enum):
    PASSWORD_RESET = "password_reset"
    EMAIL_VERIFICATION = "email_verification"
