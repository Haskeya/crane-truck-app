import { useState, useEffect } from 'react'
import api from '../api/client'
import { useToast } from '../contexts/ToastContext'

interface CustomerFormProps {
  customer?: any
  onClose: () => void
  onSuccess: () => void
}

export default function CustomerForm({ customer, onClose, onSuccess }: CustomerFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        city: customer.city || '',
        notes: customer.notes || ''
      })
    }
  }, [customer])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (customer) {
        await api.put(`/customers/${customer.id}`, formData)
      } else {
        await api.post('/customers', formData)
      }
      showToast(customer ? 'Müşteri güncellendi' : 'Müşteri oluşturuldu', 'success')
      onSuccess()
      onClose()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Müşteri kaydedilemedi'
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
          {customer ? 'Müşteri Düzenle' : 'Yeni Müşteri'}
        </h2>

        {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Müşteri Adı *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
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

