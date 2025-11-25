import { useState, useEffect } from 'react'
import api from '../api/client'
import { useToast } from '../contexts/ToastContext'

interface AssignmentModalProps {
  projectId: number
  resourceType: 'CRANE' | 'TRUCK' | 'EQUIPMENT' | 'PERSON'
  onClose: () => void
  onSuccess: () => void
}

export default function AssignmentModal({ projectId, resourceType, onClose, onSuccess }: AssignmentModalProps) {
  const [resources, setResources] = useState<any[]>([])
  const [selectedResource, setSelectedResource] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchResources()
  }, [resourceType])

  const fetchResources = async () => {
    try {
      let response
      if (resourceType === 'CRANE') {
        response = await api.get('/cranes', { params: { status: 'ACTIVE' } })
      } else if (resourceType === 'TRUCK') {
        response = await api.get('/trucks', { params: { status: 'ACTIVE' } })
      } else if (resourceType === 'EQUIPMENT') {
        response = await api.get('/equipment/items', { params: { status: 'AVAILABLE' } })
      } else if (resourceType === 'PERSON') {
        response = await api.get('/persons', { params: { status: 'ACTIVE' } })
      }
      setResources(response?.data || [])
    } catch (err) {
      console.error('Kaynaklar yüklenemedi:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedResource) return

    setLoading(true)
    setError(null)

    try {
      await api.post(`/projects/${projectId}/assign`, {
        resource_type: resourceType,
        resource_id: parseInt(selectedResource),
        notes
      })
      showToast('Kaynak başarıyla atandı', 'success')
      onSuccess()
      onClose()
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Atama yapılamadı'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const getResourceName = (resource: any) => {
    if (resourceType === 'CRANE') return `${resource.name} (${resource.model})`
    if (resourceType === 'TRUCK') return `${resource.plate_no} (${resource.type})`
    if (resourceType === 'EQUIPMENT') return `${resource.equipment_type_name || ''} - ${resource.serial_no || ''}`
    if (resourceType === 'PERSON') return `${resource.name} (${resource.role})`
    return ''
  }

  const getTitle = () => {
    const titles: any = {
      CRANE: 'Vinç Ata',
      TRUCK: 'Kamyon Ata',
      EQUIPMENT: 'Ekipman Ata',
      PERSON: 'Personel Ata'
    }
    return titles[resourceType] || 'Kaynak Ata'
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
        <h2 style={{ marginBottom: '20px' }}>{getTitle()}</h2>

        {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{resourceType === 'CRANE' ? 'Vinç' : resourceType === 'TRUCK' ? 'Kamyon' : resourceType === 'EQUIPMENT' ? 'Ekipman' : 'Personel'} Seçin *</label>
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
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
            <label>Notlar</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              İptal
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading || !selectedResource}>
              {loading ? 'Atanıyor...' : 'Ata'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

