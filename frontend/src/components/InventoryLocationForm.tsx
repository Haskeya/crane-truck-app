import { useEffect, useState } from 'react'
import api from '../api/client'
import { useToast } from '../contexts/ToastContext'

interface InventoryLocationFormProps {
  item: any
  onClose: () => void
  onSuccess: () => void
}

type AssignmentType = 'LOCATION' | 'TRUCK' | 'NONE'

export default function InventoryLocationForm({ item, onClose, onSuccess }: InventoryLocationFormProps) {
  const { showToast } = useToast()
  const [locations, setLocations] = useState<any[]>([])
  const [trucks, setTrucks] = useState<any[]>([])
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('NONE')
  const [formData, setFormData] = useState({
    current_location_id: '',
    on_truck_id: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLookups()
    const initialAssignment: AssignmentType = item.current_location_id
      ? 'LOCATION'
      : item.on_truck_id
        ? 'TRUCK'
        : 'NONE'

    setAssignmentType(initialAssignment)
    setFormData({
      current_location_id: item.current_location_id ? String(item.current_location_id) : '',
      on_truck_id: item.on_truck_id ? String(item.on_truck_id) : ''
    })
  }, [item])

  const fetchLookups = async () => {
    try {
      const [locationsRes, trucksRes] = await Promise.all([
        api.get('/locations'),
        api.get('/trucks')
      ])
      setLocations(locationsRes.data)
      setTrucks(trucksRes.data)
    } catch (err) {
      console.error('Konum/çekici listesi yüklenemedi', err)
    }
  }

  const handleAssignmentChange = (value: AssignmentType) => {
    setAssignmentType(value)
    setFormData({
      current_location_id: value === 'LOCATION' ? formData.current_location_id : '',
      on_truck_id: value === 'TRUCK' ? formData.on_truck_id : ''
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      current_location_id:
        assignmentType === 'LOCATION' && formData.current_location_id
          ? Number(formData.current_location_id)
          : undefined,
      on_truck_id:
        assignmentType === 'TRUCK' && formData.on_truck_id
          ? Number(formData.on_truck_id)
          : undefined
    }

    try {
      await api.put(`/equipment/items/${item.id}/location`, payload)
      showToast('Konum güncellendi', 'success')
      onSuccess()
      onClose()
    } catch (err: any) {
      const message = err.response?.data?.error || 'Konum güncellenemedi'
      setError(message)
      showToast(message, 'error')
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
        <h2 style={{ marginBottom: '20px' }}>Konum Güncelle ({item.equipment_type_name})</h2>

        {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ait Olduğu Yer</label>
            <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
              <label>
                <input
                  type="radio"
                  name="assignment"
                  checked={assignmentType === 'LOCATION'}
                  onChange={() => handleAssignmentChange('LOCATION')}
                />
                <span style={{ marginLeft: '5px' }}>Konum</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="assignment"
                  checked={assignmentType === 'TRUCK'}
                  onChange={() => handleAssignmentChange('TRUCK')}
                />
                <span style={{ marginLeft: '5px' }}>Çekici/Dorse</span>
              </label>
              <label>
                <input
                  type="radio"
                  name="assignment"
                  checked={assignmentType === 'NONE'}
                  onChange={() => handleAssignmentChange('NONE')}
                />
                <span style={{ marginLeft: '5px' }}>Belirsiz</span>
              </label>
            </div>

            {assignmentType === 'LOCATION' && (
              <select
                value={formData.current_location_id}
                onChange={(e) => setFormData({ ...formData, current_location_id: e.target.value })}
              >
                <option value="">Konum seçin</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}
                  </option>
                ))}
              </select>
            )}

            {assignmentType === 'TRUCK' && (
              <select
                value={formData.on_truck_id}
                onChange={(e) => setFormData({ ...formData, on_truck_id: e.target.value })}
              >
                <option value="">Çekici/Dorse seçin</option>
                {trucks.map((truck) => (
                  <option key={truck.id} value={truck.id}>
                    {truck.plate_no} - {truck.type}
                  </option>
                ))}
              </select>
            )}
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




