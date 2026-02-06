'use client'
import { useState, useEffect, useCallback } from 'react'
import { Contract, ContractFilters, ContractListResponse } from '../lib/types'
import { getContracts, addToPortfolio } from '../lib/api'
import FilterPanel from '../components/FilterPanel'
import ContractCard from '../components/ContractCard'
import { showToast } from '../components/Toast'

export default function ContractsPage() {
  const [data, setData] = useState<ContractListResponse | null>(null)
  const [filters, setFilters] = useState<ContractFilters>({ status: 'Available' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addingId, setAddingId] = useState<number | null>(null)
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set())

  const fetchContracts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await getContracts(filters)
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contracts')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  const handleAddToPortfolio = async (contract: Contract) => {
    if (addedIds.has(contract.id)) {
      showToast('Contract already added to portfolio', 'info')
      return
    }
    setAddingId(contract.id)
    try {
      await addToPortfolio(contract.id)
      setAddedIds(prev => new Set(prev).add(contract.id))
      showToast(`Added ${contract.energy_type} contract to portfolio`, 'success')
      await fetchContracts()
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to add to portfolio', 'error')
    } finally {
      setAddingId(null)
    }
  }

  const clearFilters = () => {
    setFilters({ status: 'Available' })
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="lg:w-80 flex-shrink-0">
        <FilterPanel
          filters={filters}
          onChange={setFilters}
          onClear={clearFilters}
          resultCount={data?.total ?? 0}
        />
      </aside>

      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Available Contracts</h1>
          <select
            className="input w-auto"
            value={`${filters.sort_by || 'id'}-${filters.sort_dir || 'asc'}`}
            onChange={e => {
              const [sort_by, sort_dir] = e.target.value.split('-')
              setFilters({ ...filters, sort_by, sort_dir: sort_dir as 'asc' | 'desc' })
            }}
          >
            <option value="id-asc">Default</option>
            <option value="price_per_mwh-asc">Price: Low to High</option>
            <option value="price_per_mwh-desc">Price: High to Low</option>
            <option value="quantity_mwh-desc">Quantity: High to Low</option>
            <option value="quantity_mwh-asc">Quantity: Low to High</option>
            <option value="delivery_start-asc">Delivery: Earliest</option>
            <option value="delivery_start-desc">Delivery: Latest</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-20 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : data?.items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No contracts match your filters</p>
            <button onClick={clearFilters} className="btn-secondary mt-4">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.items.map(contract => (
              <ContractCard
                key={contract.id}
                contract={contract}
                onAddToPortfolio={() => handleAddToPortfolio(contract)}
                loading={addingId === contract.id}
                isAdded={addedIds.has(contract.id)}
              />
            ))}
          </div>
        )}

        {data && data.total > data.limit && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              onClick={() => setFilters({ ...filters, offset: Math.max(0, (filters.offset || 0) - filters.limit!) })}
              disabled={!filters.offset}
              className="btn-secondary"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {Math.floor((filters.offset || 0) / (filters.limit || 20)) + 1} of {Math.ceil(data.total / (filters.limit || 20))}
            </span>
            <button
              onClick={() => setFilters({ ...filters, offset: (filters.offset || 0) + (filters.limit || 20) })}
              disabled={(filters.offset || 0) + (filters.limit || 20) >= data.total}
              className="btn-secondary"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
