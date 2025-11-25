import { useState } from 'react'
import api from '../api/client'
import { useToast } from '../contexts/ToastContext'

interface UnassignModalProps {
  projectId: number
  assignment: any
  onClose: () => void
  onSuccess: () => void
}

export default function UnassignModal({ projectId, assignment, onClose, onSuccess }: UnassignModalProps) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const { showToast } = useToast()

  const getAssignmentLabel = () => {
    const typeLabel = assignment.resource_type === 'CRANE'
      ? 'Vinç'
      : assignment.resource_type === 'TRUCK'
        ? 'Çekici/Dorse'
        : assignment.resource_type === 'EQUIPMENT'
          ? 'Ekipman'
          : 'Personel'

    return `${typeLabel} - ${assignment.resource_name || `ID: ${assignment.resource_id}`}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post(`/projects/${projectId}/assignments/${assignment.id}/unassign`, {
        reason: reason || null
      })
      showToast('Kaynak projeden çıkarıldı', 'success')
      onSuccess()
      onClose()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Kaynak projeden çıkarılamadı'
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
        maxWidth: '520px',
        width: '90%'
      }}>
        <h2 style={{ marginBottom: '10px' }}>Kaynağı Projeden Çıkar</h2>
        <p style={{ marginBottom: '20px', color: '#555' }}>
          <strong>{getAssignmentLabel()}</strong> kaynağını projeden çıkarmak üzeresiniz.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Çıkarma Sebebi</label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Örn: Ahmet Yılmaz izne ayrıldığı için projeden çıkarıldı"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-danger" disabled={loading}>
              {loading ? 'Çıkarılıyor...' : 'Projeden Çıkar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}




