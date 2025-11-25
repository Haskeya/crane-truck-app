import { useState } from 'react'

interface AdvancedSearchProps {
  onSearch: (filters: any) => void
  searchFields: string[]
  onClose: () => void
}

export default function AdvancedSearch({ onSearch, searchFields, onClose }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<Record<string, string>>({})

  const handleSearch = () => {
    onSearch(filters)
    onClose()
  }

  const handleReset = () => {
    setFilters({})
    onSearch({})
    onClose()
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Gelişmiş Arama</h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {searchFields.map((field) => (
            <div key={field} className="form-group">
              <label>{field.charAt(0).toUpperCase() + field.slice(1).replace(/_/g, ' ')}</label>
              <input
                type="text"
                value={filters[field] || ''}
                onChange={(e) => setFilters({ ...filters, [field]: e.target.value })}
                placeholder={`${field} ile ara...`}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="button" className="btn btn-secondary" onClick={handleReset}>
            Temizle
          </button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            İptal
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSearch}>
            Ara
          </button>
        </div>
      </div>
    </div>
  )
}





