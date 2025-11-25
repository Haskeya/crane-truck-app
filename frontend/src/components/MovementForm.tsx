import { useState, useEffect } from 'react'
import api from '../api/client'
import { useToast } from '../contexts/ToastContext'

interface MovementFormProps {
  onClose: () => void
  onSuccess: () => void
}

export default function MovementForm({ onClose, onSuccess }: MovementFormProps) {
  const [formData, setFormData] = useState({
    resource_type: 'CRANE',
    resource_id: '',
    from_location_id: '',
    to_location_id: '',
    moved_at: new Date().toISOString().slice(0, 16),
    moved_by: '',
    notes: ''
  })
  const [resources, setResources] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [persons, setPersons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchLocations()
    fetchPersons()
  }, [])

  useEffect(() => {
    fetchResources()
  }, [formData.resource_type])

  const fetchResources = async () => {
    try {
      let response
      if (formData.resource_type === 'CRANE') {
        response = await api.get('/cranes')
      } else if (formData.resource_type === 'TRUCK') {
        response = await api.get('/trucks')
      } else if (formData.resource_type === 'EQUIPMENT') {
        response = await api.get('/equipment/items')
      }
      setResources(response?.data || [])
      
      // Seçili kaynağın mevcut konumunu otomatik doldur
      if (formData.resource_id) {
        const selected = response?.data.find((r: any) => r.id === parseInt(formData.resource_id))
        if (selected) {
          setFormData({ ...formData, from_location_id: selected.current_location_id || '' })
        }
      }
    } catch (err) {
      console.error('Kaynaklar yüklenemedi:', err)
    }
  }

  const fetchLocations = async () => {
    try {
      const response = await api.get('/locations')
      setLocations(response.data)
    } catch (err) {
      console.error('Konumlar yüklenemedi:', err)
    }
  }

  const fetchPersons = async () => {
    try {
      const response = await api.get('/persons')
      setPersons(response.data)
    } catch (err) {
      console.error('Personel yüklenemedi:', err)
    }
  }

  const handleResourceChange = (resourceId: string) => {
    const selected = resources.find((r: any) => r.id === parseInt(resourceId))
    setFormData({
      ...formData,
      resource_id: resourceId,
      from_location_id: selected?.current_location_id || ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.resource_id || !formData.to_location_id) {
      setError('Kaynak ve hedef konum seçilmelidir')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await api.post('/movements', {
        ...formData,
        resource_id: parseInt(formData.resource_id),
        from_location_id: formData.from_location_id || null,
        to_location_id: parseInt(formData.to_location_id),
        moved_by: formData.moved_by || null,
        moved_at: new Date(formData.moved_at).toISOString()
      })
      showToast('Hareket kaydı oluşturuldu', 'success')
      onSuccess()
      onClose()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Hareket kaydedilemedi'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const getResourceName = (resource: any) => {
    if (formData.resource_type === 'CRANE') return `${resource.name} (${resource.model})`
    if (formData.resource_type === 'TRUCK') return `${resource.plate_no} (${resource.type})`
    if (formData.resource_type === 'EQUIPMENT') return `${resource.serial_no || resource.id}`
    return ''
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
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Yeni Hareket Kaydı</h2>

        {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Kaynak Tipi *</label>
            <select
              value={formData.resource_type}
              onChange={(e) => setFormData({ ...formData, resource_type: e.target.value as any, resource_id: '' })}
              required
            >
              <option value="CRANE">Vinç</option>
              <option value="TRUCK">Kamyon</option>
              <option value="EQUIPMENT">Ekipman</option>
            </select>
          </div>

          <div className="form-group">
            <label>Kaynak *</label>
            <select
              value={formData.resource_id}
              onChange={(e) => handleResourceChange(e.target.value)}
              required
            >
              <option value="">Seçin...</option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {getResourceName(resource)}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Nereden</label>
            <select
              value={formData.from_location_id}
              onChange={(e) => setFormData({ ...formData, from_location_id: e.target.value })}
            >
              <option value="">Mevcut Konum</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.type})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Nereye *</label>
            <select
              value={formData.to_location_id}
              onChange={(e) => setFormData({ ...formData, to_location_id: e.target.value })}
              required
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
            <label>Tarih/Saat</label>
            <input
              type="datetime-local"
              value={formData.moved_at}
              onChange={(e) => setFormData({ ...formData, moved_at: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Yapan Kişi</label>
            <select
              value={formData.moved_by}
              onChange={(e) => setFormData({ ...formData, moved_by: e.target.value })}
            >
              <option value="">Seçin...</option>
              {persons.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name} ({person.role})
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

