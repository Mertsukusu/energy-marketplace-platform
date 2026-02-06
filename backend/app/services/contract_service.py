from datetime import date
from decimal import Decimal
from typing import Optional

from sqlalchemy import asc, desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.contract import Contract, ContractStatus


async def create_contract(db: AsyncSession, data: dict) -> Contract:
    contract = Contract(**data)
    db.add(contract)
    await db.flush()
    await db.refresh(contract)
    return contract


async def get_contract(db: AsyncSession, contract_id: int) -> Optional[Contract]:
    return await db.get(Contract, contract_id)


async def update_contract(db: AsyncSession, contract: Contract, data: dict) -> Contract:
    for key, value in data.items():
        if value is not None:
            if key == "status":
                value = ContractStatus(value)
            setattr(contract, key, value)
    await db.flush()
    await db.refresh(contract)
    return contract


async def delete_contract(db: AsyncSession, contract: Contract) -> None:
    await db.delete(contract)


async def list_contracts(
    db: AsyncSession,
    energy_types: Optional[list[str]] = None,
    price_min: Optional[Decimal] = None,
    price_max: Optional[Decimal] = None,
    qty_min: Optional[Decimal] = None,
    qty_max: Optional[Decimal] = None,
    location: Optional[str] = None,
    delivery_start_min: Optional[date] = None,
    delivery_end_max: Optional[date] = None,
    status: Optional[str] = "Available",
    limit: int = 20,
    offset: int = 0,
    sort_by: str = "id",
    sort_dir: str = "asc",
) -> tuple[list[Contract], int]:
    query = select(Contract)
    count_query = select(func.count(Contract.id))

    if energy_types:
        query = query.where(Contract.energy_type.in_(energy_types))
        count_query = count_query.where(Contract.energy_type.in_(energy_types))
    if price_min is not None:
        query = query.where(Contract.price_per_mwh >= price_min)
        count_query = count_query.where(Contract.price_per_mwh >= price_min)
    if price_max is not None:
        query = query.where(Contract.price_per_mwh <= price_max)
        count_query = count_query.where(Contract.price_per_mwh <= price_max)
    if qty_min is not None:
        query = query.where(Contract.quantity_mwh >= qty_min)
        count_query = count_query.where(Contract.quantity_mwh >= qty_min)
    if qty_max is not None:
        query = query.where(Contract.quantity_mwh <= qty_max)
        count_query = count_query.where(Contract.quantity_mwh <= qty_max)
    if location:
        query = query.where(Contract.location.ilike(f"%{location}%"))
        count_query = count_query.where(Contract.location.ilike(f"%{location}%"))
    if delivery_start_min:
        query = query.where(Contract.delivery_start >= delivery_start_min)
        count_query = count_query.where(Contract.delivery_start >= delivery_start_min)
    if delivery_end_max:
        query = query.where(Contract.delivery_end <= delivery_end_max)
        count_query = count_query.where(Contract.delivery_end <= delivery_end_max)
    if status:
        query = query.where(Contract.status == ContractStatus(status))
        count_query = count_query.where(Contract.status == ContractStatus(status))

    sort_column = getattr(Contract, sort_by, Contract.id)
    order_func = desc if sort_dir == "desc" else asc
    query = query.order_by(order_func(sort_column))
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    contracts = list(result.scalars().all())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    return contracts, total
