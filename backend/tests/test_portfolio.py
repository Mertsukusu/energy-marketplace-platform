from decimal import Decimal

import pytest


@pytest.mark.asyncio
async def test_add_to_portfolio(client):
    data = {
        "energy_type": "Solar",
        "quantity_mwh": "500",
        "price_per_mwh": "45.50",
        "delivery_start": "2026-03-01",
        "delivery_end": "2026-05-31",
        "location": "California",
    }
    create_resp = await client.post("/contracts", json=data)
    contract_id = create_resp.json()["id"]
    response = await client.post("/portfolio/items", json={"contract_id": contract_id})
    assert response.status_code == 201
    contract_resp = await client.get(f"/contracts/{contract_id}")
    assert contract_resp.json()["status"] == "Reserved"


@pytest.mark.asyncio
async def test_cannot_add_reserved_contract(client):
    data = {
        "energy_type": "Wind",
        "quantity_mwh": "300",
        "price_per_mwh": "38.00",
        "delivery_start": "2026-04-01",
        "delivery_end": "2026-09-30",
        "location": "Texas",
    }
    create_resp = await client.post("/contracts", json=data)
    contract_id = create_resp.json()["id"]
    await client.post("/portfolio/items", json={"contract_id": contract_id})
    response = await client.post("/portfolio/items", json={"contract_id": contract_id})
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_portfolio_metrics_weighted_avg(client):
    contracts = [
        {
            "energy_type": "Solar",
            "quantity_mwh": "100",
            "price_per_mwh": "50",
            "delivery_start": "2026-01-01",
            "delivery_end": "2026-06-30",
            "location": "CA",
        },
        {
            "energy_type": "Wind",
            "quantity_mwh": "200",
            "price_per_mwh": "40",
            "delivery_start": "2026-01-01",
            "delivery_end": "2026-06-30",
            "location": "TX",
        },
    ]
    contract_ids = []
    for c in contracts:
        resp = await client.post("/contracts", json=c)
        contract_ids.append(resp.json()["id"])
    for cid in contract_ids:
        await client.post("/portfolio/items", json={"contract_id": cid})
    response = await client.get("/portfolio")
    assert response.status_code == 200
    metrics = response.json()["metrics"]
    assert metrics["total_contracts"] == 2
    assert Decimal(metrics["total_capacity_mwh"]) == Decimal("300")
    assert Decimal(metrics["total_cost"]) == Decimal("13000")
    expected_weighted_avg = Decimal("13000") / Decimal("300")
    assert Decimal(metrics["weighted_avg_price_per_mwh"]) == expected_weighted_avg.quantize(
        Decimal("0.01")
    )


@pytest.mark.asyncio
async def test_remove_from_portfolio(client):
    data = {
        "energy_type": "Hydro",
        "quantity_mwh": "400",
        "price_per_mwh": "42.00",
        "delivery_start": "2026-05-01",
        "delivery_end": "2026-10-31",
        "location": "Washington",
    }
    create_resp = await client.post("/contracts", json=data)
    contract_id = create_resp.json()["id"]
    await client.post("/portfolio/items", json={"contract_id": contract_id})
    response = await client.delete(f"/portfolio/items/{contract_id}")
    assert response.status_code == 204
    contract_resp = await client.get(f"/contracts/{contract_id}")
    assert contract_resp.json()["status"] == "Available"


@pytest.mark.asyncio
async def test_cannot_delete_contract_in_portfolio(client):
    data = {
        "energy_type": "Nuclear",
        "quantity_mwh": "1000",
        "price_per_mwh": "35.00",
        "delivery_start": "2026-01-01",
        "delivery_end": "2026-12-31",
        "location": "Midwest",
    }
    create_resp = await client.post("/contracts", json=data)
    contract_id = create_resp.json()["id"]
    await client.post("/portfolio/items", json={"contract_id": contract_id})
    response = await client.delete(f"/contracts/{contract_id}")
    assert response.status_code == 409
