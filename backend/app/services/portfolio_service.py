from collections import defaultdict
from decimal import Decimal
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.models.contract import Contract, ContractStatus
from app.models.portfolio import PortfolioItem
from app.schemas.portfolio import EnergyTypeBreakdown, PortfolioMetrics


async def get_portfolio_item_by_contract(
    db: AsyncSession, contract_id: int
) -> Optional[PortfolioItem]:
    query = select(PortfolioItem).where(PortfolioItem.contract_id == contract_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def add_to_portfolio(db: AsyncSession, contract: Contract) -> PortfolioItem:
    contract.status = ContractStatus.RESERVED
    item = PortfolioItem(contract_id=contract.id)
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return item


async def remove_from_portfolio(db: AsyncSession, item: PortfolioItem) -> None:
    contract = await db.get(Contract, item.contract_id)
    if contract:
        contract.status = ContractStatus.AVAILABLE
    await db.delete(item)


async def get_portfolio(db: AsyncSession) -> tuple[list[PortfolioItem], PortfolioMetrics]:
    query = select(PortfolioItem).options(joinedload(PortfolioItem.contract))
    result = await db.execute(query)
    items = list(result.scalars().all())

    if not items:
        return items, PortfolioMetrics(
            total_contracts=0,
            total_capacity_mwh=Decimal("0"),
            total_cost=Decimal("0"),
            weighted_avg_price_per_mwh=Decimal("0"),
            breakdown_by_energy_type=[],
        )

    total_capacity = Decimal("0")
    total_cost = Decimal("0")
    breakdown: dict[str, dict] = defaultdict(
        lambda: {"count": 0, "mwh": Decimal("0"), "cost": Decimal("0")}
    )

    for item in items:
        c = item.contract
        qty = c.quantity_mwh
        cost = qty * c.price_per_mwh
        total_capacity += qty
        total_cost += cost
        breakdown[c.energy_type]["count"] += 1
        breakdown[c.energy_type]["mwh"] += qty
        breakdown[c.energy_type]["cost"] += cost

    weighted_avg = total_cost / total_capacity if total_capacity > 0 else Decimal("0")
    breakdown_list = [
        EnergyTypeBreakdown(
            energy_type=et,
            count=data["count"],
            total_mwh=data["mwh"],
            total_cost=data["cost"],
        )
        for et, data in breakdown.items()
    ]

    metrics = PortfolioMetrics(
        total_contracts=len(items),
        total_capacity_mwh=total_capacity,
        total_cost=total_cost,
        weighted_avg_price_per_mwh=weighted_avg.quantize(Decimal("0.01")),
        breakdown_by_energy_type=breakdown_list,
    )
    return items, metrics
