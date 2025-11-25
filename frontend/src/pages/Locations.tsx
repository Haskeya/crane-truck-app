import { useEffect, useState } from 'react'
import api from '../api/client'
import LocationForm from '../components/LocationForm'

export default function Locations() {
  const [locations, setLocations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<any>(null)
  const [typeFilter, setTypeFilter] = useState('')

  useEffect(() => {
    fetchLocations()
  }, [typeFilter])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (typeFilter) params.type = typeFilter
      
      const response = await api.get('/locations', { params })
      setLocations(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Konumlar yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu konumu silmek istediğinize emin misiniz?')) return
    
    try {
      await api.delete(`/locations/${id}`)
      fetchLocations()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Konum silinemedi')
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: any = {
      GARAGE: 'Garaj',
      DEPOT: 'Depo',
      PROJECT: 'Proje',
      OTHER: 'Diğer'
    }
    return labels[type] || type
  }

  if (loading && locations.length === 0) return <div className="container"><div className="loading">Yükleniyor...</div></div>
  if (error && locations.length === 0) return <div className="container"><div className="error">{error}</div></div>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Konumlar</h2>
        <button className="btn btn-primary" onClick={() => { setSelectedLocation(null); setShowForm(true) }}>
          Yeni Konum
        </button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">Tüm Tipler</option>
            <option value="GARAGE">Garaj</option>
            <option value="DEPOT">Depo</option>
            <option value="PROJECT">Proje</option>
            <option value="OTHER">Diğer</option>
          </select>
        </div>
      </div>

      <div className="card">
        {locations.length === 0 ? (
          <p style={{ color: '#666' }}>Henüz konum eklenmemiş</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Konum Adı</th>
                <th>Tip</th>
                <th>Şehir</th>
                <th>Adres</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id}>
                  <td><strong>{location.name}</strong></td>
                  <td><span className="badge badge-info">{getTypeLabel(location.type)}</span></td>
                  <td>{location.city || '-'}</td>
                  <td>{location.address || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => { setSelectedLocation(location); setShowForm(true) }}
                      >
                        Düzenle
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => handleDelete(location.id)}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <LocationForm
          location={selectedLocation}
          onClose={() => { setShowForm(false); setSelectedLocation(null) }}
          onSuccess={fetchLocations}
        />
      )}
    </div>
  )
}

