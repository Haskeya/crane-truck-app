import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function TruckDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [truck, setTruck] = useState<any>(null)
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (id) {
      fetchTruck()
      fetchMovements()
    }
  }, [id])

  const fetchTruck = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/trucks/${id}`)
      setTruck(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Kayıt yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchMovements = async () => {
    try {
      const response = await api.get(`/movements/resource/TRUCK/${id}`)
      setMovements(response.data)
    } catch (err) {
      console.error('Hareketler yüklenemedi:', err)
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

  if (loading) return <div className="container"><div className="loading">Yükleniyor...</div></div>
  if (error) return <div className="container"><div className="error">{error}</div></div>
  if (!truck) return null

  return (
    <div className="container">
      <div className="page-actions" style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/trucks')}>
          ← Listeye Dön
        </button>
      </div>

      <div className="detail-header">
        <div className="detail-header-top">
          <div>
            <h2 className="page-title" style={{ fontSize: '32px', marginBottom: '8px' }}>{truck.plate_no}</h2>
            <div className="detail-meta">
              <span className="chip">Tip: {truck.type}</span>
              <span className="chip">Model: {truck.model || '-'}</span>
            </div>
          </div>
          <span className={`badge ${getStatusBadge(truck.status)}`}>
            {truck.status}
          </span>
        </div>
        <div className="detail-meta">
          <span className="chip">Konum: {truck.location_name || '-'}</span>
        </div>
      </div>

      <div className="tab-group">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Genel Bilgiler
        </button>
        <button
          className={`tab-button ${activeTab === 'equipment' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipment')}
        >
          Üzerindeki Ekipmanlar
        </button>
        <button
          className={`tab-button ${activeTab === 'movements' ? 'active' : ''}`}
          onClick={() => setActiveTab('movements')}
        >
          Hareket Geçmişi
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="detail-card-grid">
          <div className="card">
            <h3>Genel Bilgiler</h3>
            <ul className="info-list" style={{ marginTop: '16px' }}>
              <li>
                <span className="info-label">Plaka</span>
                <span className="info-value">{truck.plate_no}</span>
              </li>
              <li>
                <span className="info-label">Tip</span>
                <span className="info-value">{truck.type}</span>
              </li>
              <li>
                <span className="info-label">Model</span>
                <span className="info-value">{truck.model || '-'}</span>
              </li>
              <li>
                <span className="info-label">Durum</span>
                <span className="info-value">
                  <span className={`badge ${getStatusBadge(truck.status)}`}>
                    {truck.status}
                  </span>
                </span>
              </li>
              <li>
                <span className="info-label">Mevcut Konum</span>
                <span className="info-value">{truck.location_name || '-'}</span>
              </li>
            </ul>
          </div>

          <div className="card">
            <h3>Notlar</h3>
            <p style={{ color: '#666', whiteSpace: 'pre-wrap', marginTop: '16px' }}>
              {truck.notes || 'Not bulunmuyor.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="card">
          <h3>Üzerindeki Ekipmanlar</h3>
          {truck.equipment && truck.equipment.length > 0 ? (
            <div className="table-wrapper" style={{ marginTop: '16px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Ekipman Tipi</th>
                    <th>Seri No</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {truck.equipment.map((eq: any) => (
                    <tr key={eq.id}>
                      <td>{eq.equipment_type_name}</td>
                      <td>{eq.serial_no || '-'}</td>
                      <td>
                        <span className={`badge ${eq.status === 'IN_USE' ? 'badge-info' : 'badge-success'}`}>
                          {eq.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">Bu araç üzerinde ekipman bulunmuyor</div>
          )}
        </div>
      )}

      {activeTab === 'movements' && (
        <div className="card">
          <h3>Hareket Geçmişi</h3>
          {movements.length === 0 ? (
            <div className="empty-state">Hareket kaydı bulunmuyor</div>
          ) : (
            <div className="table-wrapper" style={{ marginTop: '16px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Tarih/Saat</th>
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
                      <td>{movement.from_location_name || '-'}</td>
                      <td>{movement.to_location_name}</td>
                      <td>{movement.moved_by_name || '-'}</td>
                      <td>{movement.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


