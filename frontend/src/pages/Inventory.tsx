import { useEffect, useMemo, useState } from 'react'
import api from '../api/client'
import { useToast } from '../contexts/ToastContext'
import InventoryForm from '../components/InventoryForm'
import InventoryLocationForm from '../components/InventoryLocationForm'

interface InventoryItem {
  id: number
  equipment_type_name: string
  equipment_type_category: string
  serial_no: string | null
  status: string
  location_name: string | null
  truck_plate_no: string | null
  owner_crane_name: string | null
  notes: string | null
  current_location_id?: number | null
  on_truck_id?: number | null
}

const STATUS_OPTIONS = [
  { value: '', label: 'Tüm Durumlar' },
  { value: 'AVAILABLE', label: 'Uygun' },
  { value: 'IN_USE', label: 'Kullanımda' },
  { value: 'MAINTENANCE', label: 'Bakımda' },
  { value: 'RETIRED', label: 'Emekli' }
]

export default function Inventory() {
  const { showToast } = useToast()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [craneFilter, setCraneFilter] = useState('')
  const [cranes, setCranes] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)

  useEffect(() => {
    fetchInventory()
  }, [statusFilter, craneFilter])

  useEffect(() => {
    fetchCranes()
  }, [])

  const fetchInventory = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (statusFilter) params.status = statusFilter
      if (craneFilter) params.owner_crane_id = craneFilter
      const response = await api.get('/equipment/items', { params })
      setItems(response.data)
      setError(null)
    } catch (err: any) {
      const message = err.response?.data?.error || 'Envanter yüklenirken hata oluştu'
      setError(message)
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.equipment_type_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serial_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.truck_plate_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.owner_crane_name?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesCategory =
        !categoryFilter || item.equipment_type_category === categoryFilter

      return matchesSearch && matchesCategory
    })
  }, [items, searchTerm, categoryFilter])

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      AVAILABLE: 'badge-success',
      IN_USE: 'badge-info',
      MAINTENANCE: 'badge-warning',
      RETIRED: 'badge-danger'
    }
    return badges[status] || 'badge-info'
  }

  const fetchCranes = async () => {
    try {
      const response = await api.get('/cranes')
      setCranes(response.data)
    } catch (err) {
      console.error('Vinç listesi yüklenemedi', err)
    }
  }

  if (loading && items.length === 0) {
    return <div className="container"><div className="loading">Yükleniyor...</div></div>
  }

  if (error && items.length === 0) {
    return <div className="container"><div className="error">{error}</div></div>
  }

  return (
    <div className="container">
      <div className="page-header">
        <div className="page-title-group">
          <h2 className="page-title">Makine Envanteri</h2>
          <p className="page-subtitle">Toplam {filteredItems.length} kayıt</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            Yeni Ekipman
          </button>
        </div>
      </div>

      <div className="filter-panel" style={{ marginBottom: '20px' }}>
        <div className="filters-grid columns-4">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Arama</label>
            <input
              type="text"
              placeholder="Ekipman adı, seri no veya çekici plakası..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Kategori</label>
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
            <label>Makine</label>
            <select
              value={craneFilter}
              onChange={(e) => setCraneFilter(e.target.value)}
            >
              <option value="">Tüm Vinçler</option>
              {cranes.map((crane) => (
                <option key={crane.id} value={crane.id}>
                  {crane.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {filteredItems.length === 0 ? (
          <div className="empty-state">Kriterlere uygun kayıt bulunamadı</div>
        ) : (
          <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Ekipman Tipi</th>
                <th>Kategori</th>
                <th>Seri No</th>
                <th>Bağlı Vinç</th>
                <th>Konum</th>
                <th>Durum</th>
                <th>Çekici / Dorse</th>
                <th>Notlar</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.equipment_type_name}</td>
                  <td>{item.equipment_type_category}</td>
                  <td>{item.serial_no || '-'}</td>
                  <td>{item.owner_crane_name || '-'}</td>
                  <td>
                    <div className="table-inline">
                      <span>{item.location_name || '-'}</span>
                      <button
                        className="btn-link"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingItem(item)
                        }}
                      >
                        Düzenle
                      </button>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadge(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>{item.truck_plate_no || '-'}</td>
                  <td>{item.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>

      {showForm && (
        <InventoryForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false)
            fetchInventory()
          }}
        />
      )}

      {editingItem && (
        <InventoryLocationForm
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            setEditingItem(null)
            fetchInventory()
          }}
        />
      )}
    </div>
  )
}

