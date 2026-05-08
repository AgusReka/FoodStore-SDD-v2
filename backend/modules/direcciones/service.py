"""Address service."""
from uuid import UUID

from backend.core.service import BaseService
from backend.modules.direcciones.model import Address
from backend.modules.direcciones.repository import DireccionRepository


class DireccionService(BaseService[Address]):
    def __init__(self, repository: DireccionRepository):
        super().__init__(repository)

    async def create_address(self, user_id: UUID, **kwargs) -> Address:
        if kwargs.get("is_primary"):
            await self.repository.unset_primary(user_id)
        return await self.repository.create(user_id=user_id, **kwargs)

    async def update_address(self, address_id: UUID, user_id: UUID, **kwargs) -> Address | None:
        if kwargs.get("is_primary"):
            await self.repository.unset_primary(user_id)
        return await self.repository.update(address_id, **kwargs)

    async def list_by_user(self, user_id: UUID) -> list[Address]:
        return await self.repository.get_by_user(user_id)
