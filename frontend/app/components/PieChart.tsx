'use client'
import { EnergyTypeBreakdown } from '../lib/types'

const COLORS = ['#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4', '#6b7280', '#22c55e', '#ec4899']

interface PieChartProps {
  data: EnergyTypeBreakdown[]
}

export default function PieChart({ data }: PieChartProps) {
  if (!data.length) return null

  const total = data.reduce((sum, d) => sum + parseFloat(d.total_mwh), 0)
  let currentAngle = 0

  const slices = data.map((item, i) => {
    const percentage = parseFloat(item.total_mwh) / total
    const startAngle = currentAngle
    const endAngle = currentAngle + percentage * 360
    currentAngle = endAngle

    const startRad = (startAngle - 90) * (Math.PI / 180)
    const endRad = (endAngle - 90) * (Math.PI / 180)
    const largeArc = percentage > 0.5 ? 1 : 0

    const x1 = 50 + 40 * Math.cos(startRad)
    const y1 = 50 + 40 * Math.sin(startRad)
    const x2 = 50 + 40 * Math.cos(endRad)
    const y2 = 50 + 40 * Math.sin(endRad)

    const pathData = percentage === 1
      ? `M 50 10 A 40 40 0 1 1 49.99 10 Z`
      : `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`

    return { ...item, pathData, color: COLORS[i % COLORS.length], percentage }
  })

  return (
    <div className="card">
      <h2 className="font-semibold text-lg text-gray-900 mb-4">Energy Mix</h2>
      <div className="flex items-center gap-6">
        <svg viewBox="0 0 100 100" className="w-40 h-40">
          {slices.map((slice, i) => (
            <path key={i} d={slice.pathData} fill={slice.color} className="hover:opacity-80 transition-opacity" />
          ))}
        </svg>
        <div className="flex-1 space-y-2">
          {slices.map((slice, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: slice.color }} />
              <span className="text-sm text-gray-700 flex-1">{slice.energy_type}</span>
              <span className="text-sm font-medium">{(slice.percentage * 100).toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
