from pydantic import BaseModel

from backend.core.enums import UserRole


class UserRoleUpdate(BaseModel):
    role: UserRole


class AdminStatsResponse(BaseModel):
    total_users: int
    total_orders: int
    total_revenue: float
