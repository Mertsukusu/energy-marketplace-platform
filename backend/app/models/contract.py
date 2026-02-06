import enum
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Date, DateTime, Enum, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db import Base


class ContractStatus(str, enum.Enum):
    AVAILABLE = "Available"
    RESERVED = "Reserved"
    SOLD = "Sold"


class Contract(Base):
    __tablename__ = "contracts"

    id: Mapped[int] = mapped_column(primary_key=True)
    energy_type: Mapped[str] = mapped_column(String(50), index=True)
    quantity_mwh: Mapped[Decimal] = mapped_column(Numeric(12, 2))
    price_per_mwh: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    delivery_start: Mapped[date] = mapped_column(Date, index=True)
    delivery_end: Mapped[date] = mapped_column(Date)
    location: Mapped[str] = mapped_column(String(100), index=True)
    status: Mapped[ContractStatus] = mapped_column(
        Enum(ContractStatus), default=ContractStatus.AVAILABLE, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )
