import { useState, useEffect } from 'react'
import api from '../api/client'
import { useToast } from '../contexts/ToastContext'

interface TruckFormProps {
  truck?: any
  onClose: () => void
  onSuccess: () => void
}

export default function TruckForm({ truck, onClose, onSuccess }: TruckFormProps) {
  const [formData, setFormData] = useState({
    plate_no: '',
    type: 'LOWBED',
    model: '',
    status: 'ACTIVE',
    current_location_id: '',
    notes: ''
  })
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchLocations()
    if (truck) {
      setFormData({
        plate_no: truck.plate_no || '',
        type: truck.type || 'LOWBED',
        model: truck.model || '',
        status: truck.status || 'ACTIVE',
        current_location_id: truck.current_location_id || '',
        notes: truck.notes || ''
      })
    }
  }, [truck])

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations')
      setLocations(response.data)
    } catch (err) {
      console.error('Konumlar yüklenemedi:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (truck) {
        await api.put(`/trucks/${truck.id}`, formData)
      } else {
        await api.post('/trucks', formData)
      }
      showToast(truck ? 'Kayıt güncellendi' : 'Kayıt oluşturuldu', 'success')
      onSuccess()
      onClose()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Kayıt kaydedilemedi'
      setError(errorMsg)
      showToast(errorMsg, 'error')
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
          {truck ? 'Çekici/Dorse Düzenle' : 'Yeni Çekici veya Dorse'}
        </h2>

        {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Plaka No *</label>
            <input
              type="text"
              value={formData.plate_no}
              onChange={(e) => setFormData({ ...formData, plate_no: e.target.value.toUpperCase() })}
              placeholder="örn: 34ABC123"
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
              <option value="LOWBED">Lowbed</option>
              <option value="FLATBED">Flatbed</option>
              <option value="OTHER">Diğer</option>
            </select>
          </div>

          <div className="form-group">
            <label>Model</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="örn: Mercedes Actros"
            />
          </div>

          <div className="form-group">
            <label>Durum</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">Aktif</option>
              <option value="MAINTENANCE">Bakımda</option>
              <option value="RETIRED">Emekli</option>
            </select>
          </div>

          <div className="form-group">
            <label>Mevcut Konum</label>
            <select
              value={formData.current_location_id}
              onChange={(e) => setFormData({ ...formData, current_location_id: e.target.value })}
            >
              <option value="">Konum Seçin</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.type})
                </option>
              ))}
            </select>
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

