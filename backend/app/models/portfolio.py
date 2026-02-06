from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class PortfolioItem(Base):
    __tablename__ = "portfolio_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    contract_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("contracts.id", ondelete="RESTRICT"), unique=True
    )
    added_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    contract = relationship("Contract", lazy="joined")
