import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'

const TYPE_LABELS: Record<string, string> = {
  MOBILE: 'Mobil',
  PALETLI: 'Paletli',
  SEPET: 'Sepet',
  HIUP: 'Hi-up'
}

export default function CraneDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [crane, setCrane] = useState<any>(null)
  const [movements, setMovements] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (id) {
      fetchCrane()
      fetchMovements()
    }
  }, [id])

  const fetchCrane = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/cranes/${id}`)
      setCrane(response.data)
      setInventory(response.data.inventory || [])
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Vinç yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchMovements = async () => {
    try {
      const response = await api.get(`/movements/resource/CRANE/${id}`)
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
  if (!crane) return null

  return (
    <div className="container">
      <div className="page-actions" style={{ marginBottom: '16px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/cranes')}>
          ← Listeye Dön
        </button>
      </div>

      <div className="detail-header">
        <div className="detail-header-top">
          <div>
            <h2 className="page-title" style={{ fontSize: '32px', marginBottom: '8px' }}>{crane.name}</h2>
            <div className="detail-meta">
              <span className="chip">{TYPE_LABELS[crane.type] || crane.type || 'Tip Yok'}</span>
              <span className="chip">Model: {crane.model || '-'}</span>
              <span className="chip">Tonaj: {crane.tonnage || '-'}</span>
            </div>
          </div>
          <span className={`badge ${getStatusBadge(crane.status)}`}>
            {crane.status}
          </span>
        </div>
        <div className="detail-meta">
          <span className="chip">Seri No: {crane.serial_no || '-'}</span>
          <span className="chip">Plaka: {crane.plate_no || '-'}</span>
          <span className="chip">Konum: {crane.location_name || '-'}</span>
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
          className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Makine Envanteri
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
                <span className="info-label">Vinç Tipi</span>
                <span className="info-value">{TYPE_LABELS[crane.type] || crane.type || '-'}</span>
              </li>
              <li>
                <span className="info-label">Model</span>
                <span className="info-value">{crane.model || '-'}</span>
              </li>
              <li>
                <span className="info-label">Model Yılı</span>
                <span className="info-value">{crane.model_year || '-'}</span>
              </li>
              <li>
                <span className="info-label">Makine Kategorisi</span>
                <span className="info-value">{crane.machine_category || '-'}</span>
              </li>
              <li>
                <span className="info-label">Mevcut Konum</span>
                <span className="info-value">{crane.location_name || '-'}</span>
              </li>
              <li>
                <span className="info-label">Konum Notu</span>
                <span className="info-value">{crane.current_location_text || '-'}</span>
              </li>
            </ul>
          </div>

          <div className="card">
            <h3>Kimlik Bilgileri</h3>
            <ul className="info-list" style={{ marginTop: '16px' }}>
              <li>
                <span className="info-label">Plaka</span>
                <span className="info-value">{crane.plate_no || '-'}</span>
              </li>
              <li>
                <span className="info-label">Seri No</span>
                <span className="info-value">{crane.serial_no || '-'}</span>
              </li>
              <li>
                <span className="info-label">Tonaj</span>
                <span className="info-value">{crane.tonnage || '-'}</span>
              </li>
              <li>
                <span className="info-label">KM</span>
                <span className="info-value">{crane.km_reading || '-'}</span>
              </li>
              <li>
                <span className="info-label">Motor Saati</span>
                <span className="info-value">{crane.engine_hours || '-'}</span>
              </li>
            </ul>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3>Notlar</h3>
            <p style={{ color: '#666', whiteSpace: 'pre-wrap', marginTop: '12px' }}>
              {crane.notes || 'Not bulunmuyor.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'inventory' && (
        <div className="card">
          <h3>Makine Envanteri</h3>
          {inventory.length === 0 ? (
            <div className="empty-state">Bu vinç için kayıtlı ekipman bulunmuyor</div>
          ) : (
            <div className="table-wrapper" style={{ marginTop: '16px' }}>
              <table>
                <thead>
                  <tr>
                    <th>Ekipman Tipi</th>
                    <th>Kategori</th>
                    <th>Seri No</th>
                    <th>Durum</th>
                    <th>Konum / Çekici</th>
                    <th>Notlar</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item: any) => (
                    <tr key={item.id}>
                      <td>{item.equipment_type_name}</td>
                      <td>{item.equipment_type_category}</td>
                      <td>{item.serial_no || '-'}</td>
                      <td>
                        <span className={`badge ${
                          item.status === 'MAINTENANCE'
                            ? 'badge-warning'
                            : item.status === 'RETIRED'
                              ? 'badge-danger'
                              : item.status === 'IN_USE'
                                ? 'badge-info'
                                : 'badge-success'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td>{item.location_name || (item.truck_plate_no ? `Çekici: ${item.truck_plate_no}` : '-')}</td>
                      <td>{item.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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


