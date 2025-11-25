import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import TruckForm from '../components/TruckForm'
import Pagination from '../components/Pagination'
import { useToast } from '../contexts/ToastContext'

export default function Trucks() {
  const [trucks, setTrucks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedTruck, setSelectedTruck] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    fetchTrucks()
  }, [])

  const fetchTrucks = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchTerm) params.search = searchTerm
      if (statusFilter) params.status = statusFilter
      
      const response = await api.get('/trucks', { params })
      
      // Basit pagination (frontend'de)
      const allTrucks = response.data
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      setTrucks(allTrucks.slice(start, end))
      setTotalPages(Math.ceil(allTrucks.length / pageSize))
      setTotalCount(allTrucks.length)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Çekici ve dorseler yüklenirken hata oluştu')
      showToast('Çekici ve dorseler yüklenirken hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchTrucks()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter, currentPage])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu çekici/dorse kaydını silmek istediğinize emin misiniz?')) return
    
    try {
      await api.delete(`/trucks/${id}`)
      showToast('Kayıt başarıyla silindi', 'success')
      fetchTrucks()
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Kayıt silinemedi', 'error')
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      ACTIVE: 'badge-success',
      MAINTENANCE: 'badge-warning',
      RETIRED: 'badge-danger'
    }
    return badges[status] || 'badge-info'
  }

  if (loading && trucks.length === 0) return <div className="container"><div className="loading">Yükleniyor...</div></div>
  if (error && trucks.length === 0) return <div className="container"><div className="error">{error}</div></div>

  return (
    <div className="container">
      <div className="page-header">
        <div className="page-title-group">
          <h2 className="page-title">Çekici ve Dorseler</h2>
          <p className="page-subtitle">Toplam {totalCount} kayıt</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => { setSelectedTruck(null); setShowForm(true) }}>
            Yeni Çekici/Dorse
          </button>
        </div>
      </div>

      <div className="filter-panel" style={{ marginBottom: '20px' }}>
        <div className="filters-grid columns-3">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Arama</label>
            <input
              type="text"
              placeholder="Plaka veya model ile ara..."
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
              <option value="">Tüm Durumlar</option>
              <option value="ACTIVE">Aktif</option>
              <option value="MAINTENANCE">Bakımda</option>
              <option value="RETIRED">Emekli</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Görüntüleme</label>
            <select value={pageSize} disabled>
              <option value={pageSize}>{pageSize} / sayfa</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {trucks.length === 0 ? (
          <div className="empty-state">Henüz çekici veya dorse eklenmemiş</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Plaka</th>
                  <th>Tip</th>
                  <th>Model</th>
                  <th>Durum</th>
                  <th>Mevcut Konum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {trucks.map((truck) => (
                  <tr key={truck.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/trucks/${truck.id}`)}>
                    <td><strong>{truck.plate_no}</strong></td>
                    <td>{truck.type}</td>
                    <td>{truck.model || '-'}</td>
                    <td>
                      <span className={`badge ${getStatusBadge(truck.status)}`}>
                        {truck.status}
                      </span>
                    </td>
                    <td>{truck.location_name || '-'}</td>
                    <td>
                      <div className="table-actions" onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setSelectedTruck(truck); setShowForm(true) }}
                        >
                          Düzenle
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(truck.id)}
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {trucks.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {showForm && (
        <TruckForm
          truck={selectedTruck}
          onClose={() => { setShowForm(false); setSelectedTruck(null) }}
          onSuccess={() => {
            fetchTrucks()
            showToast(selectedTruck ? 'Kayıt güncellendi' : 'Kayıt oluşturuldu', 'success')
          }}
        />
      )}
    </div>
  )
}

