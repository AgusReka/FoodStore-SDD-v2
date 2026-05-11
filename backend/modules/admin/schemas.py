from pydantic import BaseModel

from backend.core.enums import UserRole


class UserRoleUpdate(BaseModel):
    role: UserRole


class AdminStatsResponse(BaseModel):
    total_users: int
    total_orders: int
    total_revenue: float


class StockAlertItem(BaseModel):
    ingredient_id: str
    name: str
    unit: str
    stock_actual: float
    stock_minimo: float
    deficit: float
    severity: float  # (minimo - actual) / minimo, higher = more critical
    products_affected: list[str] = []


class StockAlertList(BaseModel):
    items: list[StockAlertItem]
    total: int
