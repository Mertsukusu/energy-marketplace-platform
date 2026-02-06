export interface Contract {
  id: number
  energy_type: string
  quantity_mwh: string
  price_per_mwh: string
  delivery_start: string
  delivery_end: string
  location: string
  status: 'Available' | 'Reserved' | 'Sold'
  created_at: string
  updated_at: string
}

export interface ContractListResponse {
  items: Contract[]
  total: number
  limit: number
  offset: number
}

export interface ContractFilters {
  energy_type?: string[]
  price_min?: number
  price_max?: number
  qty_min?: number
  qty_max?: number
  location?: string
  delivery_start_min?: string
  delivery_end_max?: string
  status?: string
  limit?: number
  offset?: number
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
}

export interface EnergyTypeBreakdown {
  energy_type: string
  count: number
  total_mwh: string
  total_cost: string
}

export interface PortfolioMetrics {
  total_contracts: number
  total_capacity_mwh: string
  total_cost: string
  weighted_avg_price_per_mwh: string
  breakdown_by_energy_type: EnergyTypeBreakdown[]
}

export interface PortfolioItem {
  id: number
  contract_id: number
  added_at: string
  contract: Contract
}

export interface PortfolioResponse {
  items: PortfolioItem[]
  metrics: PortfolioMetrics
}
