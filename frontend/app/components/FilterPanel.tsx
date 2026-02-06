'use client'
import { ContractFilters } from '../lib/types'

const ENERGY_TYPES = ['Solar', 'Wind', 'Natural Gas', 'Nuclear', 'Hydro', 'Coal']
const LOCATIONS = ['California', 'Texas', 'Northeast', 'Midwest', 'Pacific Northwest', 'Arizona', 'Oklahoma', 'Wyoming', 'Gulf Coast', 'Nevada', 'Iowa', 'Washington', 'Southeast', 'New Mexico', 'Kansas']

interface FilterPanelProps {
  filters: ContractFilters
  onChange: (filters: ContractFilters) => void
  onClear: () => void
  resultCount: number
}

export default function FilterPanel({ filters, onChange, onClear, resultCount }: FilterPanelProps) {
  const handleEnergyTypeChange = (type: string) => {
    const current = filters.energy_type || []
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type]
    onChange({ ...filters, energy_type: updated.length ? updated : undefined })
  }

  return (
    <div className="card space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-lg text-gray-900">Filters</h2>
        <button onClick={onClear} className="text-sm text-primary-600 hover:text-primary-700">
          Clear all
        </button>
      </div>

      <div>
        <label className="label">Energy Type</label>
        <div className="flex flex-wrap gap-2">
          {ENERGY_TYPES.map(type => (
            <button
              key={type}
              onClick={() => handleEnergyTypeChange(type)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filters.energy_type?.includes(type)
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Min Price ($/MWh)</label>
          <input
            type="number"
            className="input"
            placeholder="0"
            value={filters.price_min ?? ''}
            onChange={e => onChange({ ...filters, price_min: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div>
          <label className="label">Max Price ($/MWh)</label>
          <input
            type="number"
            className="input"
            placeholder="100"
            value={filters.price_max ?? ''}
            onChange={e => onChange({ ...filters, price_max: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Min Quantity (MWh)</label>
          <input
            type="number"
            className="input"
            placeholder="0"
            value={filters.qty_min ?? ''}
            onChange={e => onChange({ ...filters, qty_min: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
        <div>
          <label className="label">Max Quantity (MWh)</label>
          <input
            type="number"
            className="input"
            placeholder="5000"
            value={filters.qty_max ?? ''}
            onChange={e => onChange({ ...filters, qty_max: e.target.value ? Number(e.target.value) : undefined })}
          />
        </div>
      </div>

      <div>
        <label className="label">Location</label>
        <select
          className="input"
          value={filters.location || ''}
          onChange={e => onChange({ ...filters, location: e.target.value || undefined })}
        >
          <option value="">All locations</option>
          {LOCATIONS.map(loc => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Delivery Start (from)</label>
          <input
            type="date"
            className="input"
            value={filters.delivery_start_min || ''}
            onChange={e => onChange({ ...filters, delivery_start_min: e.target.value || undefined })}
          />
        </div>
        <div>
          <label className="label">Delivery End (to)</label>
          <input
            type="date"
            className="input"
            value={filters.delivery_end_max || ''}
            onChange={e => onChange({ ...filters, delivery_end_max: e.target.value || undefined })}
          />
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100">
        <p className="text-sm text-gray-600">
          <span className="font-semibold text-primary-600">{resultCount}</span> contracts found
        </p>
      </div>
    </div>
  )
}
