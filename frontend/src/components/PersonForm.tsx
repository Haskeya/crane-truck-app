import { useState, useEffect } from 'react'
import api from '../api/client'

interface PersonFormProps {
  person?: any
  onClose: () => void
  onSuccess: () => void
}

export default function PersonForm({ person, onClose, onSuccess }: PersonFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    role: 'OPERATOR',
    status: 'ACTIVE',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (person) {
      setFormData({
        name: person.name || '',
        phone: person.phone || '',
        email: person.email || '',
        role: person.role || 'OPERATOR',
        status: person.status || 'ACTIVE',
        notes: person.notes || ''
      })
    }
  }, [person])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (person) {
        await api.put(`/persons/${person.id}`, formData)
      } else {
        await api.post('/persons', formData)
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.error || 'Personel kaydedilemedi')
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
          {person ? 'Personel Düzenle' : 'Yeni Personel'}
        </h2>

        {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ad Soyad *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Telefon</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="05321234567"
            />
          </div>

          <div className="form-group">
            <label>E-posta</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="ornek@email.com"
            />
          </div>

          <div className="form-group">
            <label>Rol *</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="OPERATOR">Operatör</option>
              <option value="RIGGER">Rigger</option>
              <option value="DRIVER">Şoför</option>
              <option value="SUPERVISOR">Sorumlu</option>
              <option value="OTHER">Diğer</option>
            </select>
          </div>

          <div className="form-group">
            <label>Durum</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">İnaktif</option>
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





