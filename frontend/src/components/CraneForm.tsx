import { useState, useEffect } from 'react'
import api from '../api/client'
import { useToast } from '../contexts/ToastContext'

interface CraneFormProps {
  crane?: any
  onClose: () => void
  onSuccess: () => void
}

export default function CraneForm({ crane, onClose, onSuccess }: CraneFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    type: 'MOBILE',
    serial_no: '',
    status: 'ACTIVE',
    current_location_id: '',
    plate_no: '',
    tonnage: '',
    machine_category: '',
    brand_model: '',
    model_year: '',
    km_reading: '',
    engine_hours: '',
    current_location_text: '',
    notes: ''
  })
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchLocations()
    if (crane) {
      setFormData({
        name: crane.name || '',
        model: crane.model || '',
        type: crane.type || 'MOBILE',
        serial_no: crane.serial_no || '',
        status: crane.status || 'ACTIVE',
        current_location_id: crane.current_location_id || '',
        plate_no: crane.plate_no || '',
        tonnage: crane.tonnage || '',
        machine_category: crane.machine_category || '',
        brand_model: crane.brand_model || '',
        model_year: crane.model_year || '',
        km_reading: crane.km_reading || '',
        engine_hours: crane.engine_hours || '',
        current_location_text: crane.current_location_text || '',
        notes: crane.notes || ''
      })
    }
  }, [crane])

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
      const payload = {
        ...formData,
        current_location_id: formData.current_location_id || null,
        plate_no: formData.plate_no || null,
        tonnage: formData.tonnage ? parseInt(formData.tonnage.toString()) : null,
        machine_category: formData.machine_category || null,
        brand_model: formData.brand_model || null,
        model_year: formData.model_year ? parseInt(formData.model_year.toString()) : null,
        km_reading: formData.km_reading ? parseInt(formData.km_reading.toString()) : null,
        engine_hours: formData.engine_hours || null,
        current_location_text: formData.current_location_text || null
      }

      if (crane) {
        await api.put(`/cranes/${crane.id}`, payload)
      } else {
        await api.post('/cranes', payload)
      }
      showToast(crane ? 'Vinç güncellendi' : 'Vinç oluşturuldu', 'success')
      onSuccess()
      onClose()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Vinç kaydedilemedi'
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
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px' }}>
          {crane ? 'Vinç Düzenle' : 'Yeni Vinç'}
        </h2>

        {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Vinç Adı *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="örn: LTM1500-001"
              required
            />
          </div>

          <div className="form-group">
            <label>Model *</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              placeholder="örn: LTM1500"
              required
            />
          </div>

          <div className="form-group">
            <label>Vinç Tipi *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              required
            >
              <option value="MOBILE">Mobil Vinç</option>
              <option value="PALETLI">Paletli Vinç</option>
              <option value="SEPET">Sepet Vinç</option>
              <option value="HIUP">Hi-up</option>
            </select>
          </div>

          <div className="form-group">
            <label>Seri No</label>
            <input
              type="text"
              value={formData.serial_no}
              onChange={(e) => setFormData({ ...formData, serial_no: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Plaka</label>
            <input
              type="text"
              value={formData.plate_no}
              onChange={(e) => setFormData({ ...formData, plate_no: e.target.value })}
              placeholder="örn: 34ABC123"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Tonaj</label>
              <input
                type="number"
                value={formData.tonnage}
                onChange={(e) => setFormData({ ...formData, tonnage: e.target.value })}
                placeholder="örn: 500"
              />
            </div>

            <div className="form-group">
              <label>Model Yılı</label>
              <input
                type="number"
                value={formData.model_year}
                onChange={(e) => setFormData({ ...formData, model_year: e.target.value })}
                placeholder="örn: 2020"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Makine Kategorisi</label>
            <input
              type="text"
              value={formData.machine_category}
              onChange={(e) => setFormData({ ...formData, machine_category: e.target.value })}
              placeholder="örn: Teleskop Vinç"
            />
          </div>

          <div className="form-group">
            <label>Marka - Model</label>
            <input
              type="text"
              value={formData.brand_model}
              onChange={(e) => setFormData({ ...formData, brand_model: e.target.value })}
              placeholder="örn: Liebherr LTM1500"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>KM</label>
              <input
                type="number"
                value={formData.km_reading}
                onChange={(e) => setFormData({ ...formData, km_reading: e.target.value })}
                placeholder="örn: 50000"
              />
            </div>

            <div className="form-group">
              <label>Motor Saati</label>
              <input
                type="text"
                value={formData.engine_hours}
                onChange={(e) => setFormData({ ...formData, engine_hours: e.target.value })}
                placeholder="örn: 176 / 323"
              />
            </div>
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
            <label>Konum Notu (Metin)</label>
            <input
              type="text"
              value={formData.current_location_text}
              onChange={(e) => setFormData({ ...formData, current_location_text: e.target.value })}
              placeholder="örn: Bursa Garajı"
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

