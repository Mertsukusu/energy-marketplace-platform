from decimal import Decimal

import pytest


@pytest.mark.asyncio
async def test_create_contract_valid(client):
    data = {
        "energy_type": "Solar",
        "quantity_mwh": "500.00",
        "price_per_mwh": "45.50",
        "delivery_start": "2026-03-01",
        "delivery_end": "2026-05-31",
        "location": "California",
    }
    response = await client.post("/contracts", json=data)
    assert response.status_code == 201
    result = response.json()
    assert result["energy_type"] == "Solar"
    assert result["status"] == "Available"
    assert Decimal(result["quantity_mwh"]) == Decimal("500.00")


@pytest.mark.asyncio
async def test_create_contract_invalid_dates(client):
    data = {
        "energy_type": "Wind",
        "quantity_mwh": "100.00",
        "price_per_mwh": "30.00",
        "delivery_start": "2026-06-01",
        "delivery_end": "2026-03-01",
        "location": "Texas",
    }
    response = await client.post("/contracts", json=data)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_filter_by_energy_type_and_price(client):
    contracts = [
        {
            "energy_type": "Solar",
            "quantity_mwh": "100",
            "price_per_mwh": "40",
            "delivery_start": "2026-01-01",
            "delivery_end": "2026-06-30",
            "location": "CA",
        },
        {
            "energy_type": "Wind",
            "quantity_mwh": "200",
            "price_per_mwh": "35",
            "delivery_start": "2026-01-01",
            "delivery_end": "2026-06-30",
            "location": "TX",
        },
        {
            "energy_type": "Solar",
            "quantity_mwh": "150",
            "price_per_mwh": "50",
            "delivery_start": "2026-01-01",
            "delivery_end": "2026-06-30",
            "location": "AZ",
        },
    ]
    for c in contracts:
        await client.post("/contracts", json=c)
    response = await client.get("/contracts", params={"energy_type": "Solar", "price_max": "45"})
    assert response.status_code == 200
    result = response.json()
    assert result["total"] == 1
    assert result["items"][0]["energy_type"] == "Solar"
    assert Decimal(result["items"][0]["price_per_mwh"]) == Decimal("40")


@pytest.mark.asyncio
async def test_filter_multiple_energy_types(client):
    contracts = [
        {
            "energy_type": "Solar",
            "quantity_mwh": "100",
            "price_per_mwh": "40",
            "delivery_start": "2026-01-01",
            "delivery_end": "2026-06-30",
            "location": "CA",
        },
        {
            "energy_type": "Wind",
            "quantity_mwh": "200",
            "price_per_mwh": "35",
            "delivery_start": "2026-01-01",
            "delivery_end": "2026-06-30",
            "location": "TX",
        },
        {
            "energy_type": "Nuclear",
            "quantity_mwh": "300",
            "price_per_mwh": "30",
            "delivery_start": "2026-01-01",
            "delivery_end": "2026-06-30",
            "location": "MW",
        },
    ]
    for c in contracts:
        await client.post("/contracts", json=c)
    response = await client.get("/contracts", params={"energy_type": ["Solar", "Wind"]})
    assert response.status_code == 200
    result = response.json()
    assert result["total"] == 2


@pytest.mark.asyncio
async def test_contract_not_found(client):
    response = await client.get("/contracts/9999")
    assert response.status_code == 404
