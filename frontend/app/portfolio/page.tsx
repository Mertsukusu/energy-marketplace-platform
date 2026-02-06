'use client'
import { useState, useEffect, useCallback } from 'react'
import { PortfolioResponse } from '../lib/types'
import { getPortfolio, removeFromPortfolio } from '../lib/api'
import ContractCard from '../components/ContractCard'
import MetricsCard from '../components/MetricsCard'
import PieChart from '../components/PieChart'
import { showToast } from '../components/Toast'

export default function PortfolioPage() {
  const [data, setData] = useState<PortfolioResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<number | null>(null)

  const fetchPortfolio = useCallback(async () => {
    setError(null)
    try {
      const result = await getPortfolio()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load portfolio')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  const handleRemove = async (contractId: number, energyType: string) => {
    if (removingId) return
    setRemovingId(contractId)
    try {
      await removeFromPortfolio(contractId)
      showToast(`Removed ${energyType} contract from portfolio`, 'success')
      await fetchPortfolio()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove'
      if (message.includes('not in portfolio')) {
        showToast('Contract already removed', 'info')
        await fetchPortfolio()
      } else {
        showToast(message, 'error')
      }
    } finally {
      setRemovingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card animate-pulse h-48"></div>
          <div className="card animate-pulse h-48"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    )
  }

  const isEmpty = !data?.items.length

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Portfolio</h1>

      {isEmpty ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Your portfolio is empty</p>
          <a href="/contracts" className="btn-primary inline-block">
            Browse Contracts
          </a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <MetricsCard metrics={data!.metrics} />
            <PieChart data={data!.metrics.breakdown_by_energy_type} />
          </div>

          <div>
            <h2 className="font-semibold text-lg text-gray-900 mb-4">
              Contracts ({data!.items.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {data!.items.map(item => (
                <ContractCard
                  key={item.id}
                  contract={item.contract}
                  onRemoveFromPortfolio={() => handleRemove(item.contract_id, item.contract.energy_type)}
                  isInPortfolio
                  loading={removingId === item.contract_id}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
