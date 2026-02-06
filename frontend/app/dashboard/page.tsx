'use client'
import { useState, useEffect } from 'react'
import { PortfolioResponse } from '../lib/types'
import { getPortfolio, getMarketStats, MarketStats } from '../lib/api'
import Link from 'next/link'

const ENERGY_COLORS: Record<string, string> = {
  'Solar': 'bg-amber-400',
  'Wind': 'bg-blue-400',
  'Natural Gas': 'bg-red-400',
  'Nuclear': 'bg-purple-400',
  'Hydro': 'bg-cyan-400',
  'Coal': 'bg-gray-400',
}

export default function DashboardPage() {
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null)
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    Promise.all([getPortfolio(), getMarketStats()])
      .then(([p, m]) => {
        setPortfolio(p)
        setMarketStats(m)
      })
      .finally(() => setLoading(false))
  }, [])

  const formatCurrency = (value: number) =>
    value >= 1000 ? `$${(value / 1000).toFixed(0)}k` : `$${value.toFixed(0)}`

  const formatMWh = (value: number) =>
    value >= 1000 ? `${(value / 1000).toFixed(1)}k MWh` : `${value.toFixed(0)} MWh`

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card animate-pulse h-64"></div>
          <div className="card animate-pulse h-64"></div>
        </div>
      </div>
    )
  }

  const metrics = portfolio?.metrics
  const recentItems = portfolio?.items.slice(-3).reverse() || []

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Overview of your portfolio and marketplace insights</p>
        </div>
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['7d', '30d', '90d', '1y'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                timeRange === range ? 'bg-gray-900 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Portfolio Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Portfolio Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Contracts</p>
                <p className="text-3xl font-bold text-gray-900">{metrics?.total_contracts || 0}</p>
                <p className="text-xs text-primary-600">Active</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Capacity</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatMWh(parseFloat(metrics?.total_capacity_mwh || '0'))}
                </p>
                <p className="text-xs text-gray-400">MWh</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Investment</p>
                <p className="text-3xl font-bold text-gray-900">
                  {formatCurrency(parseFloat(metrics?.total_cost || '0'))}
                </p>
                <p className="text-xs text-gray-400">USD</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Price</p>
                <p className="text-3xl font-bold text-gray-900">
                  ${parseFloat(metrics?.weighted_avg_price_per_mwh || '0').toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">per MWh</p>
              </div>
            </div>
          </div>

          {/* Energy Mix Bar */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Energy Mix</h2>
            {metrics?.breakdown_by_energy_type.length ? (
              <div className="space-y-3">
                {metrics.breakdown_by_energy_type.map(item => {
                  const percentage = (parseFloat(item.total_mwh) / parseFloat(metrics.total_capacity_mwh)) * 100
                  return (
                    <div key={item.energy_type} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${ENERGY_COLORS[item.energy_type] || 'bg-gray-400'}`} />
                      <span className="text-sm text-gray-700 w-24">{item.energy_type}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${ENERGY_COLORS[item.energy_type] || 'bg-gray-400'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-24 text-right">
                        {parseFloat(item.total_mwh).toLocaleString()} MWh
                      </span>
                      <span className="text-sm text-gray-500 w-16 text-right">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No contracts in portfolio</p>
            )}
          </div>
        </div>

        {/* Marketplace Stats */}
        <div className="space-y-6">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Marketplace Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Available Contracts</span>
                <span className="font-semibold text-primary-600">{marketStats?.availableContracts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg Market Price</span>
                <span className="font-semibold">${marketStats?.avgMarketPrice.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Capacity</span>
                <span className="font-semibold">{formatMWh(marketStats?.totalCapacity || 0)}</span>
              </div>
              <div className="pt-2 border-t">
                <p className="text-sm text-gray-500 mb-2">By Energy Type</p>
                {marketStats?.byEnergyType.map(item => (
                  <div key={item.type} className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${ENERGY_COLORS[item.type] || 'bg-gray-400'}`} />
                      <span className="text-sm text-gray-700">{item.type}</span>
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Locations</span>
                <span className="font-semibold text-primary-600">{marketStats?.locations.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Portfolio Value</span>
                <span className="font-semibold">{formatCurrency(parseFloat(metrics?.total_cost || '0'))}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Contracts</span>
                <span className="font-semibold text-primary-600">{metrics?.total_contracts || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {recentItems.length ? (
          <div className="space-y-3">
            {recentItems.map(item => (
              <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                    +
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Added to Portfolio</p>
                    <p className="text-sm text-gray-500">
                      {item.contract.energy_type} • {parseFloat(item.contract.quantity_mwh).toLocaleString()} MWh
                    </p>
                  </div>
                </div>
                <span className="text-sm text-gray-400">
                  {new Date(item.added_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-3">No recent activity</p>
            <Link href="/contracts" className="btn-primary inline-block">
              Browse Contracts
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
