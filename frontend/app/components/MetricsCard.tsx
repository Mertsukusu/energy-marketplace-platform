import { PortfolioMetrics } from '../lib/types'

interface MetricsCardProps {
  metrics: PortfolioMetrics
}

export default function MetricsCard({ metrics }: MetricsCardProps) {
  const formatCurrency = (value: string) =>
    parseFloat(value).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  return (
    <div className="card">
      <h2 className="font-semibold text-lg text-gray-900 mb-4">Portfolio Summary</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-primary-50 rounded-lg p-4">
          <p className="text-sm text-primary-700">Total Contracts</p>
          <p className="text-2xl font-bold text-primary-900">{metrics.total_contracts}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-700">Total Capacity</p>
          <p className="text-2xl font-bold text-blue-900">{parseFloat(metrics.total_capacity_mwh).toLocaleString()} MWh</p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <p className="text-sm text-amber-700">Total Cost</p>
          <p className="text-2xl font-bold text-amber-900">{formatCurrency(metrics.total_cost)}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-700">Weighted Avg Price</p>
          <p className="text-2xl font-bold text-purple-900">${parseFloat(metrics.weighted_avg_price_per_mwh).toFixed(2)}/MWh</p>
        </div>
      </div>
    </div>
  )
}
