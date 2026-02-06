'use client'
import { Contract } from '../lib/types'

const ENERGY_COLORS: Record<string, string> = {
  'Solar': 'bg-amber-100 text-amber-800',
  'Wind': 'bg-blue-100 text-blue-800',
  'Natural Gas': 'bg-red-100 text-red-800',
  'Nuclear': 'bg-purple-100 text-purple-800',
  'Hydro': 'bg-cyan-100 text-cyan-800',
  'Coal': 'bg-gray-200 text-gray-800',
}

interface ContractCardProps {
  contract: Contract
  onAddToPortfolio?: () => void
  onRemoveFromPortfolio?: () => void
  isInPortfolio?: boolean
  isAdded?: boolean
  loading?: boolean
}

export default function ContractCard({
  contract,
  onAddToPortfolio,
  onRemoveFromPortfolio,
  isInPortfolio,
  isAdded,
  loading,
}: ContractCardProps) {
  const totalCost = (parseFloat(contract.quantity_mwh) * parseFloat(contract.price_per_mwh)).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

  return (
    <div className={`card hover:shadow-md transition-all ${isAdded ? 'ring-2 ring-primary-500 bg-primary-50' : ''}`}>
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${ENERGY_COLORS[contract.energy_type] || 'bg-gray-100 text-gray-800'}`}>
          {contract.energy_type}
        </span>
        <div className="flex items-center gap-2">
          {isAdded && (
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary-100 text-primary-700">
              ✓ Added
            </span>
          )}
          <span className={`text-xs font-medium px-2 py-0.5 rounded ${
            contract.status === 'Available' ? 'bg-green-100 text-green-700' :
            contract.status === 'Reserved' ? 'bg-yellow-100 text-yellow-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {contract.status}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span className="text-gray-500 text-sm">Quantity</span>
          <span className="font-semibold">{parseFloat(contract.quantity_mwh).toLocaleString()} MWh</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 text-sm">Price</span>
          <span className="font-semibold">${parseFloat(contract.price_per_mwh).toFixed(2)}/MWh</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 text-sm">Total Value</span>
          <span className="font-bold text-primary-600">{totalCost}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 text-sm">Location</span>
          <span className="font-medium">{contract.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500 text-sm">Delivery</span>
          <span className="text-sm">{contract.delivery_start} → {contract.delivery_end}</span>
        </div>
      </div>

      {onAddToPortfolio && contract.status === 'Available' && !isAdded && (
        <button
          onClick={onAddToPortfolio}
          disabled={loading}
          className="btn-primary w-full"
        >
          {loading ? 'Adding...' : 'Add to Portfolio'}
        </button>
      )}
      {onAddToPortfolio && isAdded && (
        <button disabled className="w-full px-4 py-2 rounded-lg font-medium bg-primary-100 text-primary-700 cursor-default">
          ✓ In Portfolio
        </button>
      )}
      {onRemoveFromPortfolio && isInPortfolio && (
        <button
          onClick={onRemoveFromPortfolio}
          disabled={loading}
          className="btn-danger w-full"
        >
          {loading ? 'Removing...' : 'Remove from Portfolio'}
        </button>
      )}
    </div>
  )
}
