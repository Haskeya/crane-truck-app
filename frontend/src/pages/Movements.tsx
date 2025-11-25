import { useEffect, useState } from 'react'
import { movementsApi } from '../api/movements'
import MovementForm from '../components/MovementForm'
import Pagination from '../components/Pagination'
import { exportMovementsToExcel } from '../utils/export'
import { useToast } from '../contexts/ToastContext'

export default function Movements() {
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resourceTypeFilter, setResourceTypeFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(20)
  const { showToast } = useToast()

  useEffect(() => {
    fetchMovements()
  }, [resourceTypeFilter, dateFrom, dateTo])

  const fetchMovements = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit: pageSize
      }
      if (resourceTypeFilter) params.resource_type = resourceTypeFilter
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      
      const response = await movementsApi.getAll(params)
      
      // Basit pagination (frontend'de)
      const allMovements = response.data
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      setMovements(allMovements.slice(start, end))
      setTotalPages(Math.ceil(allMovements.length / pageSize))
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Hareket kayıtları yüklenirken hata oluştu')
      showToast('Hareket kayıtları yüklenirken hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [resourceTypeFilter, dateFrom, dateTo])

  useEffect(() => {
    fetchMovements()
  }, [currentPage])

  if (loading && movements.length === 0) return <div className="container"><div className="loading">Yükleniyor...</div></div>
  if (error && movements.length === 0) return <div className="container"><div className="error">{error}</div></div>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Hareket Kayıtları</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => {
              movementsApi.getAll().then((response) => {
                exportMovementsToExcel(response.data)
                showToast('Excel dosyası indirildi', 'success')
              }).catch(() => {
                showToast('Export işlemi başarısız', 'error')
              })
            }}
          >
            Excel Export
          </button>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>Yeni Hareket</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr 1fr', gap: '15px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              value={resourceTypeFilter}
              onChange={(e) => setResourceTypeFilter(e.target.value)}
            >
              <option value="">Tüm Kaynaklar</option>
              <option value="CRANE">Vinç</option>
              <option value="TRUCK">Kamyon</option>
              <option value="EQUIPMENT">Ekipman</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              type="date"
              placeholder="Başlangıç Tarihi"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              type="date"
              placeholder="Bitiş Tarihi"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="card">
        {movements.length === 0 ? (
          <p style={{ color: '#666' }}>Hareket kaydı bulunamadı</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tarih/Saat</th>
                <th>Kaynak Tipi</th>
                <th>Kaynak ID</th>
                <th>Nereden</th>
                <th>Nereye</th>
                <th>Yapan Kişi</th>
                <th>Notlar</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((movement) => (
                <tr key={movement.id}>
                  <td>{new Date(movement.moved_at).toLocaleString('tr-TR')}</td>
                  <td>
                    <span className="badge badge-info">{movement.resource_type}</span>
                  </td>
                  <td>{movement.resource_id}</td>
                  <td>{movement.from_location_name || '-'}</td>
                  <td>{movement.to_location_name}</td>
                  <td>{movement.moved_by_name || '-'}</td>
                  <td>{movement.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {movements.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {showForm && (
        <MovementForm
          onClose={() => setShowForm(false)}
          onSuccess={() => { 
            setShowForm(false)
            showToast('Hareket kaydı oluşturuldu', 'success')
            fetchMovements() 
          }}
        />
      )}
    </div>
  )
}

