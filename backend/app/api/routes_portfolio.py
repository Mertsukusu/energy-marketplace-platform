from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.models.contract import ContractStatus
from app.schemas.portfolio import PortfolioItemCreate, PortfolioItemResponse, PortfolioResponse
from app.services import contract_service, portfolio_service

router = APIRouter()


@router.post("/items", response_model=PortfolioItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_portfolio(data: PortfolioItemCreate, db: AsyncSession = Depends(get_db)):
    contract = await contract_service.get_contract(db, data.contract_id)
    if not contract:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Contract not found")
    if contract.status != ContractStatus.AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Contract is {contract.status.value}, only Available contracts can be added",
        )
    existing = await portfolio_service.get_portfolio_item_by_contract(db, data.contract_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Contract already in portfolio"
        )
    item = await portfolio_service.add_to_portfolio(db, contract)
    await db.refresh(item, ["contract"])
    return item


@router.delete("/items/{contract_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_portfolio(contract_id: int, db: AsyncSession = Depends(get_db)):
    item = await portfolio_service.get_portfolio_item_by_contract(db, contract_id)
    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Contract not in portfolio"
        )
    await portfolio_service.remove_from_portfolio(db, item)


@router.get("", response_model=PortfolioResponse)
async def get_portfolio(db: AsyncSession = Depends(get_db)):
    items, metrics = await portfolio_service.get_portfolio(db)
    return PortfolioResponse(items=items, metrics=metrics)
