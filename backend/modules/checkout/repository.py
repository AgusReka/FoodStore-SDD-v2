"""Checkout session repository."""
import logging
from uuid import UUID
from datetime import datetime, timezone

from sqlalchemy import select, update

from backend.core.repository import BaseRepository
from backend.modules.checkout.model import CheckoutSession, CheckoutSessionStatus

logger = logging.getLogger(__name__)


class CheckoutSessionRepository(BaseRepository[CheckoutSession]):
    def __init__(self, session):
        super().__init__(CheckoutSession, session)

    async def create_session(self, **kwargs) -> CheckoutSession:
        """Create a new checkout session."""
        sess = CheckoutSession(**kwargs)
        self.session.add(sess)
        await self.session.flush()
        await self.session.refresh(sess)
        return sess

    async def update_status(
        self, session_id: UUID, status: CheckoutSessionStatus, **extra
    ) -> CheckoutSession | None:
        """Update session status and optionally extra fields."""
        stmt = (
            update(CheckoutSession)
            .where(CheckoutSession.id == session_id)
            .values(status=status, **extra)
            .returning(CheckoutSession)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.scalars().first()

    async def update_mp_ref(
        self, session_id: UUID, mp_preference_id: str
    ) -> CheckoutSession | None:
        """Store MP preference ID on the session."""
        stmt = (
            update(CheckoutSession)
            .where(CheckoutSession.id == session_id)
            .values(mp_preference_id=mp_preference_id)
            .returning(CheckoutSession)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        return result.scalars().first()

    async def get_by_mp_preference(
        self, mp_preference_id: str
    ) -> CheckoutSession | None:
        """Find session by MP preference ID."""
        stmt = select(CheckoutSession).where(
            CheckoutSession.mp_preference_id == mp_preference_id
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def expire_old_sessions(self) -> int:
        """Mark all pending sessions past their expiry as expired."""
        now = datetime.now(timezone.utc)
        stmt = (
            update(CheckoutSession)
            .where(
                CheckoutSession.status == CheckoutSessionStatus.PENDING,
                CheckoutSession.expires_at <= now,
            )
            .values(
                status=CheckoutSessionStatus.EXPIRED,
                completed_at=now,
            )
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        count = result.rowcount
        if count:
            logger.info("Expired %d stale checkout sessions", count)
        return count
