from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel

from app.schemas.contract import ContractResponse


class PortfolioItemCreate(BaseModel):
    contract_id: int


class PortfolioItemResponse(BaseModel):
    id: int
    contract_id: int
    added_at: datetime
    contract: ContractResponse

    class Config:
        from_attributes = True


class EnergyTypeBreakdown(BaseModel):
    energy_type: str
    count: int
    total_mwh: Decimal
    total_cost: Decimal


class PortfolioMetrics(BaseModel):
    total_contracts: int
    total_capacity_mwh: Decimal
    total_cost: Decimal
    weighted_avg_price_per_mwh: Decimal
    breakdown_by_energy_type: list[EnergyTypeBreakdown]


class PortfolioResponse(BaseModel):
    items: list[PortfolioItemResponse]
    metrics: PortfolioMetrics
