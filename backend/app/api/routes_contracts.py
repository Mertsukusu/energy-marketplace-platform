from datetime import date
from decimal import Decimal
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.schemas.contract import (
    ContractCreate,
    ContractListResponse,
    ContractResponse,
    ContractUpdate,
)
from app.services import contract_service
from app.services.portfolio_service import get_portfolio_item_by_contract

router = APIRouter()


@router.post("", response_model=ContractResponse, status_code=status.HTTP_201_CREATED)
async def create_contract(data: ContractCreate, db: AsyncSession = Depends(get_db)):
    contract = await contract_service.create_contract(db, data.model_dump())
    return contract


@router.get("", response_model=ContractListResponse)
async def list_contracts(
    energy_type: Optional[list[str]] = Query(None),
    price_min: Optional[Decimal] = None,
    price_max: Optional[Decimal] = None,
    qty_min: Optional[Decimal] = None,
    qty_max: Optional[Decimal] = None,
    location: Optional[str] = None,
    delivery_start_min: Optional[date] = None,
    delivery_end_max: Optional[date] = None,
    status_filter: Optional[str] = Query("Available", alias="status"),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    sort_by: str = Query("id", pattern="^(price_per_mwh|quantity_mwh|delivery_start|id)$"),
    sort_dir: str = Query("asc", pattern="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db),
):
    contracts, total = await contract_service.list_contracts(
        db,
        energy_types=energy_type,
        price_min=price_min,
        price_max=price_max,
        qty_min=qty_min,
        qty_max=qty_max,
        location=location,
        delivery_start_min=delivery_start_min,
        delivery_end_max=delivery_end_max,
        status=status_filter,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_dir=sort_dir,
    )
    return ContractListResponse(items=contracts, total=total, limit=limit, offset=offset)


@router.get("/{contract_id}", response_model=ContractResponse)
async def get_contract(contract_id: int, db: AsyncSession = Depends(get_db)):
    contract = await contract_service.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")
    return contract


@router.put("/{contract_id}", response_model=ContractResponse)
async def update_contract(
    contract_id: int, data: ContractUpdate, db: AsyncSession = Depends(get_db)
):
    contract = await contract_service.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")
    update_data = data.model_dump(exclude_unset=True)
    if "delivery_start" in update_data or "delivery_end" in update_data:
        start = update_data.get("delivery_start", contract.delivery_start)
        end = update_data.get("delivery_end", contract.delivery_end)
        if end < start:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="delivery_end must be >= delivery_start",
            )
    contract = await contract_service.update_contract(db, contract, update_data)
    return contract


@router.delete("/{contract_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_contract(contract_id: int, db: AsyncSession = Depends(get_db)):
    contract = await contract_service.get_contract(db, contract_id)
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")
    portfolio_item = await get_portfolio_item_by_contract(db, contract_id)
    if portfolio_item:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Cannot delete contract that is in portfolio",
        )
    await contract_service.delete_contract(db, contract)
