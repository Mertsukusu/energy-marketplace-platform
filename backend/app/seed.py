import asyncio
from datetime import date
from decimal import Decimal

from sqlalchemy import text

from app.core.db import async_session
from app.models.contract import Contract, ContractStatus

SEED_CONTRACTS = [
    {
        "energy_type": "Solar",
        "quantity_mwh": Decimal("500"),
        "price_per_mwh": Decimal("45.50"),
        "delivery_start": date(2026, 3, 1),
        "delivery_end": date(2026, 5, 31),
        "location": "California",
    },
    {
        "energy_type": "Wind",
        "quantity_mwh": Decimal("1200"),
        "price_per_mwh": Decimal("38.75"),
        "delivery_start": date(2026, 4, 1),
        "delivery_end": date(2026, 9, 30),
        "location": "Texas",
    },
    {
        "energy_type": "Natural Gas",
        "quantity_mwh": Decimal("800"),
        "price_per_mwh": Decimal("52.00"),
        "delivery_start": date(2026, 2, 15),
        "delivery_end": date(2026, 8, 15),
        "location": "Northeast",
    },
    {
        "energy_type": "Nuclear",
        "quantity_mwh": Decimal("2000"),
        "price_per_mwh": Decimal("35.00"),
        "delivery_start": date(2026, 1, 1),
        "delivery_end": date(2026, 12, 31),
        "location": "Midwest",
    },
    {
        "energy_type": "Hydro",
        "quantity_mwh": Decimal("750"),
        "price_per_mwh": Decimal("42.25"),
        "delivery_start": date(2026, 5, 1),
        "delivery_end": date(2026, 10, 31),
        "location": "Pacific Northwest",
    },
    {
        "energy_type": "Solar",
        "quantity_mwh": Decimal("300"),
        "price_per_mwh": Decimal("48.00"),
        "delivery_start": date(2026, 6, 1),
        "delivery_end": date(2026, 8, 31),
        "location": "Arizona",
    },
    {
        "energy_type": "Wind",
        "quantity_mwh": Decimal("900"),
        "price_per_mwh": Decimal("36.50"),
        "delivery_start": date(2026, 3, 15),
        "delivery_end": date(2026, 6, 15),
        "location": "Oklahoma",
    },
    {
        "energy_type": "Coal",
        "quantity_mwh": Decimal("1500"),
        "price_per_mwh": Decimal("28.00"),
        "delivery_start": date(2026, 2, 1),
        "delivery_end": date(2026, 7, 31),
        "location": "Wyoming",
    },
    {
        "energy_type": "Natural Gas",
        "quantity_mwh": Decimal("600"),
        "price_per_mwh": Decimal("55.75"),
        "delivery_start": date(2026, 4, 15),
        "delivery_end": date(2026, 10, 15),
        "location": "Gulf Coast",
    },
    {
        "energy_type": "Solar",
        "quantity_mwh": Decimal("400"),
        "price_per_mwh": Decimal("47.00"),
        "delivery_start": date(2026, 7, 1),
        "delivery_end": date(2026, 9, 30),
        "location": "Nevada",
    },
    {
        "energy_type": "Wind",
        "quantity_mwh": Decimal("1100"),
        "price_per_mwh": Decimal("37.25"),
        "delivery_start": date(2026, 5, 1),
        "delivery_end": date(2026, 11, 30),
        "location": "Iowa",
    },
    {
        "energy_type": "Hydro",
        "quantity_mwh": Decimal("850"),
        "price_per_mwh": Decimal("40.00"),
        "delivery_start": date(2026, 4, 1),
        "delivery_end": date(2026, 9, 30),
        "location": "Washington",
    },
    {
        "energy_type": "Nuclear",
        "quantity_mwh": Decimal("1800"),
        "price_per_mwh": Decimal("33.50"),
        "delivery_start": date(2026, 3, 1),
        "delivery_end": date(2026, 12, 31),
        "location": "Southeast",
    },
    {
        "energy_type": "Natural Gas",
        "quantity_mwh": Decimal("700"),
        "price_per_mwh": Decimal("54.00"),
        "delivery_start": date(2026, 6, 1),
        "delivery_end": date(2026, 12, 31),
        "location": "Northeast",
    },
    {
        "energy_type": "Solar",
        "quantity_mwh": Decimal("650"),
        "price_per_mwh": Decimal("44.00"),
        "delivery_start": date(2026, 8, 1),
        "delivery_end": date(2026, 10, 31),
        "location": "New Mexico",
    },
    {
        "energy_type": "Wind",
        "quantity_mwh": Decimal("1000"),
        "price_per_mwh": Decimal("39.00"),
        "delivery_start": date(2026, 2, 1),
        "delivery_end": date(2026, 5, 31),
        "location": "Kansas",
    },
]


async def seed_database():
    async with async_session() as session:
        result = await session.execute(text("SELECT COUNT(*) FROM contracts"))
        count = result.scalar()
        if count > 0:
            print(f"Database already has {count} contracts, skipping seed")
            return
        for data in SEED_CONTRACTS:
            contract = Contract(**data, status=ContractStatus.AVAILABLE)
            session.add(contract)
        await session.commit()
        print(f"Seeded {len(SEED_CONTRACTS)} contracts")


if __name__ == "__main__":
    asyncio.run(seed_database())
