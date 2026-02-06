import { Contract, ContractListResponse, ContractFilters, PortfolioResponse } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(error.detail || `HTTP ${res.status}`)
  }
  if (res.status === 204) return {} as T
  return res.json()
}

export async function getContracts(filters: ContractFilters = {}): Promise<ContractListResponse> {
  const params = new URLSearchParams()
  if (filters.energy_type?.length) {
    filters.energy_type.forEach(t => params.append('energy_type', t))
  }
  if (filters.price_min !== undefined) params.set('price_min', String(filters.price_min))
  if (filters.price_max !== undefined) params.set('price_max', String(filters.price_max))
  if (filters.qty_min !== undefined) params.set('qty_min', String(filters.qty_min))
  if (filters.qty_max !== undefined) params.set('qty_max', String(filters.qty_max))
  if (filters.location) params.set('location', filters.location)
  if (filters.delivery_start_min) params.set('delivery_start_min', filters.delivery_start_min)
  if (filters.delivery_end_max) params.set('delivery_end_max', filters.delivery_end_max)
  if (filters.status) params.set('status', filters.status)
  if (filters.limit) params.set('limit', String(filters.limit))
  if (filters.offset) params.set('offset', String(filters.offset))
  if (filters.sort_by) params.set('sort_by', filters.sort_by)
  if (filters.sort_dir) params.set('sort_dir', filters.sort_dir)
  const query = params.toString()
  return fetchApi<ContractListResponse>(`/contracts${query ? `?${query}` : ''}`)
}

export async function getContract(id: number): Promise<Contract> {
  return fetchApi<Contract>(`/contracts/${id}`)
}

export async function getPortfolio(): Promise<PortfolioResponse> {
  return fetchApi<PortfolioResponse>('/portfolio')
}

export async function addToPortfolio(contractId: number): Promise<void> {
  await fetchApi('/portfolio/items', {
    method: 'POST',
    body: JSON.stringify({ contract_id: contractId }),
  })
}

export async function removeFromPortfolio(contractId: number): Promise<void> {
  await fetchApi(`/portfolio/items/${contractId}`, { method: 'DELETE' })
}

export interface MarketStats {
  availableContracts: number
  totalCapacity: number
  avgMarketPrice: number
  byEnergyType: { type: string; count: number }[]
  locations: string[]
}

export async function getMarketStats(): Promise<MarketStats> {
  const data = await getContracts({ status: 'Available', limit: 100 })
  const contracts = data.items
  
  const totalCapacity = contracts.reduce((sum, c) => sum + parseFloat(c.quantity_mwh), 0)
  const totalValue = contracts.reduce((sum, c) => sum + parseFloat(c.quantity_mwh) * parseFloat(c.price_per_mwh), 0)
  const avgPrice = totalCapacity > 0 ? totalValue / totalCapacity : 0
  
  const byType: Record<string, number> = {}
  const locationSet = new Set<string>()
  contracts.forEach(c => {
    byType[c.energy_type] = (byType[c.energy_type] || 0) + 1
    locationSet.add(c.location)
  })
  
  return {
    availableContracts: data.total,
    totalCapacity,
    avgMarketPrice: avgPrice,
    byEnergyType: Object.entries(byType).map(([type, count]) => ({ type, count })),
    locations: Array.from(locationSet),
  }
}
