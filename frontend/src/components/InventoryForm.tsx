import { useEffect, useState } from 'react'
import api from '../api/client'
import { useToast } from '../contexts/ToastContext'

interface InventoryFormProps {
  onClose: () => void
  onSuccess: () => void
}

interface SelectOption {
  id: number
  name: string
}

export default function InventoryForm({ onClose, onSuccess }: InventoryFormProps) {
  const { showToast } = useToast()
  const [equipmentTypes, setEquipmentTypes] = useState<SelectOption[]>([])
  const [locations, setLocations] = useState<SelectOption[]>([])
  const [trucks, setTrucks] = useState<any[]>([])
  const [cranes, setCranes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [assignmentType, setAssignmentType] = useState<'LOCATION' | 'TRUCK' | 'NONE'>('LOCATION')
  const [formData, setFormData] = useState({
    equipment_type_id: '',
    serial_no: '',
    status: 'AVAILABLE',
    current_location_id: '',
    on_truck_id: '',
    owner_crane_id: '',
    notes: ''
  })

  useEffect(() => {
    fetchLookups()
  }, [])

  const fetchLookups = async () => {
    try {
      const [typesRes, locationsRes, trucksRes, cranesRes] = await Promise.all([
        api.get('/equipment/types'),
        api.get('/locations'),
        api.get('/trucks'),
        api.get('/cranes')
      ])
      setEquipmentTypes(typesRes.data)
      setLocations(locationsRes.data)
      setTrucks(trucksRes.data)
      setCranes(cranesRes.data)
    } catch (err) {
      console.error('Lookup verileri yüklenemedi', err)
    }
  }

  const handleAssignmentChange = (value: 'LOCATION' | 'TRUCK' | 'NONE') => {
    setAssignmentType(value)
    setFormData((prev) => ({
      ...prev,
      current_location_id: value === 'LOCATION' ? prev.current_location_id : '',
      on_truck_id: value === 'TRUCK' ? prev.on_truck_id : ''
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      equipment_type_id: formData.equipment_type_id ? Number(formData.equipment_type_id) : undefined,
      serial_no: formData.serial_no || undefined,
      status: formData.status,
      current_location_id:
        assignmentType === 'LOCATION' && formData.current_location_id
          ? Number(formData.current_location_id)
          : undefined,
      on_truck_id:
        assignmentType === 'TRUCK' && formData.on_truck_id
          ? Number(formData.on_truck_id)
          : undefined,
      owner_crane_id: formData.owner_crane_id ? Number(formData.owner_crane_id) : undefined,
      notes: formData.notes || undefined
    }

    try {
      await api.post('/equipment/items', payload)
      showToast('Ekipman kaydedildi', 'success')
      onSuccess()
      onClose()
    } catch (err: any) {
      const message = err.response?.data?.error || 'Ekipman kaydedilemedi'
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
        maxWidth: '600px',
        width: '90%'
      }}>
        <h2 style={{ marginBottom: '20px' }}>Yeni Ekipman</h2>

        {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Ekipman Tipi *</label>
            <select
              value={formData.equipment_type_id}
              onChange={(e) => setFormData({ ...formData, equipment_type_id: e.target.value })}
              required
            >
              <option value="">Tip seçin</option>
              {equipmentTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Seri No</label>
            <input
              type="text"
              value={formData.serial_no}
              onChange={(e) => setFormData({ ...formData, serial_no: e.target.value })}
              placeholder="örn: BOOM-001"
            />
          </div>

          <div className="form-group">
            <label>Durum</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="AVAILABLE">Uygun</option>
              <option value="IN_USE">Kullanımda</option>
              <option value="MAINTENANCE">Bakımda</option>
              <option value="RETIRED">Emekli</option>
            </select>
          </div>

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

          <div className="form-group">
            <label>Bağlı Olduğu Vinç</label>
            <select
              value={formData.owner_crane_id}
              onChange={(e) => setFormData({ ...formData, owner_crane_id: e.target.value })}
            >
              <option value="">Vinç seçin (opsiyonel)</option>
              {cranes.map((crane) => (
                <option key={crane.id} value={crane.id}>
                  {crane.name} ({crane.type})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Notlar</label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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

