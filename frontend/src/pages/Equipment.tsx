import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Equipment() {
  const [equipmentItems, setEquipmentItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  useEffect(() => {
    fetchEquipmentItems()
  }, [categoryFilter, statusFilter])

  const fetchEquipmentItems = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (statusFilter) params.status = statusFilter
      
      const response = await api.get('/equipment/items', { params })
      let items = response.data

      // Kategori filtresi
      if (categoryFilter) {
        items = items.filter((item: any) => item.equipment_type_category === categoryFilter)
      }

      setEquipmentItems(items)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ekipmanlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      AVAILABLE: 'badge-success',
      IN_USE: 'badge-info',
      MAINTENANCE: 'badge-warning',
      RETIRED: 'badge-danger'
    }
    return badges[status] || 'badge-info'
  }

  const getCategoryLabel = (category: string) => {
    const labels: any = {
      BOOM: 'Bom',
      JIB: 'Jib',
      COUNTERWEIGHT: 'Karşı Ağırlık',
      OTHER: 'Diğer'
    }
    return labels[category] || category
  }

  if (loading && equipmentItems.length === 0) return <div className="container"><div className="loading">Yükleniyor...</div></div>
  if (error && equipmentItems.length === 0) return <div className="container"><div className="error">{error}</div></div>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Ekipmanlar</h2>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '15px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Tüm Kategoriler</option>
              <option value="BOOM">Bom</option>
              <option value="JIB">Jib</option>
              <option value="COUNTERWEIGHT">Karşı Ağırlık</option>
              <option value="OTHER">Diğer</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tüm Durumlar</option>
              <option value="AVAILABLE">Müsait</option>
              <option value="IN_USE">Kullanımda</option>
              <option value="MAINTENANCE">Bakımda</option>
              <option value="RETIRED">Emekli</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {equipmentItems.length === 0 ? (
          <p style={{ color: '#666' }}>Ekipman bulunamadı</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ekipman Tipi</th>
                <th>Kategori</th>
                <th>Seri No</th>
                <th>Durum</th>
                <th>Konum</th>
                <th>Kamyon</th>
              </tr>
            </thead>
            <tbody>
              {equipmentItems.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.equipment_type_name || '-'}</strong></td>
                  <td>
                    <span className="badge badge-info">
                      {getCategoryLabel(item.equipment_type_category || '')}
                    </span>
                  </td>
                  <td>{item.serial_no || '-'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.location_name || '-'}</td>
                  <td>{item.truck_plate_no || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}


