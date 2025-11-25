import { useState, useEffect } from 'react'
import api from '../api/client'
import { useToast } from '../contexts/ToastContext'

interface ProjectFormProps {
  project?: any
  onClose: () => void
  onSuccess: () => void
}

export default function ProjectForm({ project, onClose, onSuccess }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    customer_id: '',
    location_id: '',
    start_date: '',
    end_date: '',
    status: 'PLANNED',
    notes: '',
    project_engineer_id: '',
    project_site_manager_id: ''
  })
  const [customers, setCustomers] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [persons, setPersons] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchCustomers()
    fetchLocations()
    fetchPersons()
    if (project) {
      setFormData({
        name: project.name || '',
        customer_id: project.customer_id || '',
        location_id: project.location_id || '',
        start_date: project.start_date || '',
        end_date: project.end_date || '',
        status: project.status || 'PLANNED',
        notes: project.notes || '',
        project_engineer_id: project.project_engineer_id || '',
        project_site_manager_id: project.project_site_manager_id || ''
      })
    }
  }, [project])

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/customers')
      setCustomers(response.data)
    } catch (err) {
      console.error('Müşteriler yüklenemedi:', err)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (project) {
        await api.put(`/projects/${project.id}`, formData)
      } else {
        await api.post('/projects', formData)
      }
      showToast(project ? 'Proje güncellendi' : 'Proje oluşturuldu', 'success')
      onSuccess()
      onClose()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Proje kaydedilemedi'
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
        maxWidth: '600px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px' }}>
          {project ? 'Proje Düzenle' : 'Yeni Proje'}
        </h2>

        {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Proje Adı *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Müşteri</label>
            <select
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
            >
              <option value="">Müşteri Seçin</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Konum</label>
            <select
              value={formData.location_id}
              onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
            >
              <option value="">Konum Seçin</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name} ({location.type})
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Proje Mühendisi</label>
              <select
                value={formData.project_engineer_id}
                onChange={(e) => setFormData({ ...formData, project_engineer_id: e.target.value })}
              >
                <option value="">Proje Mühendisi Seçin</option>
                {persons.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Proje Saha Sorumlusu</label>
              <select
                value={formData.project_site_manager_id}
                onChange={(e) => setFormData({ ...formData, project_site_manager_id: e.target.value })}
              >
                <option value="">Proje Saha Sorumlusu Seçin</option>
                {persons.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Başlangıç Tarihi</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Bitiş Tarihi</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Durum</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="PLANNED">Planlı</option>
              <option value="ACTIVE">Aktif</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="CANCELLED">İptal</option>
            </select>
          </div>

          <div className="form-group">
            <label>Notlar</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
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

