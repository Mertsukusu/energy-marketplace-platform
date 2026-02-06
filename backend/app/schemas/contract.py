from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class ContractBase(BaseModel):
    energy_type: str = Field(..., min_length=1, max_length=50)
    quantity_mwh: Decimal = Field(..., gt=0, decimal_places=2)
    price_per_mwh: Decimal = Field(..., gt=0, decimal_places=2)
    delivery_start: date
    delivery_end: date
    location: str = Field(..., min_length=1, max_length=100)

    @model_validator(mode="after")
    def validate_dates(self):
        if self.delivery_end < self.delivery_start:
            raise ValueError("delivery_end must be >= delivery_start")
        return self


class ContractCreate(ContractBase):
    pass


class ContractUpdate(BaseModel):
    energy_type: Optional[str] = Field(None, min_length=1, max_length=50)
    quantity_mwh: Optional[Decimal] = Field(None, gt=0)
    price_per_mwh: Optional[Decimal] = Field(None, gt=0)
    delivery_start: Optional[date] = None
    delivery_end: Optional[date] = None
    location: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[str] = None

    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        if v and v not in ["Available", "Reserved", "Sold"]:
            raise ValueError("status must be Available, Reserved, or Sold")
        return v


class ContractResponse(ContractBase):
    id: int
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ContractListResponse(BaseModel):
    items: list[ContractResponse]
    total: int
    limit: int
    offset: int


class ContractFilter(BaseModel):
    energy_type: Optional[list[str]] = None
    price_min: Optional[Decimal] = None
    price_max: Optional[Decimal] = None
    qty_min: Optional[Decimal] = None
    qty_max: Optional[Decimal] = None
    location: Optional[str] = None
    delivery_start_min: Optional[date] = None
    delivery_end_max: Optional[date] = None
    status: Optional[str] = "Available"
    limit: int = Field(20, ge=1, le=100)
    offset: int = Field(0, ge=0)
    sort_by: Optional[str] = Field("id", pattern="^(price_per_mwh|quantity_mwh|delivery_start|id)$")
    sort_dir: Optional[str] = Field("asc", pattern="^(asc|desc)$")
