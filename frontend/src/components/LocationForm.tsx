import { useState, useEffect } from 'react'
import api from '../api/client'

interface LocationFormProps {
  location?: any
  onClose: () => void
  onSuccess: () => void
}

export default function LocationForm({ location, onClose, onSuccess }: LocationFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    type: 'GARAGE',
    address: '',
    city: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        type: location.type || 'GARAGE',
        address: location.address || '',
        city: location.city || '',
        notes: location.notes || ''
      })
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (location) {
        await api.put(`/locations/${location.id}`, formData)
      } else {
        await api.post('/locations', formData)
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Konum kaydedilemedi')
    } finally {
      setLoading(false)
    }
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
        maxWidth: '500px',
        width: '90%'
      }}>
        <h2 style={{ marginBottom: '20px' }}>
          {location ? 'Konum Düzenle' : 'Yeni Konum'}
        </h2>

        {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Konum Adı *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Tip *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="GARAGE">Garaj</option>
              <option value="DEPOT">Depo</option>
              <option value="PROJECT">Proje</option>
              <option value="OTHER">Diğer</option>
            </select>
          </div>

          <div className="form-group">
            <label>Şehir</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Adres</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}





