import { useEffect, useState } from 'react'
import api from '../api/client'
import PersonForm from '../components/PersonForm'
import { useToast } from '../contexts/ToastContext'

export default function Persons() {
  const [persons, setPersons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [selectedPerson, setSelectedPerson] = useState<any>(null)
  const { showToast } = useToast()

  useEffect(() => {
    fetchPersons()
  }, [roleFilter, statusFilter])

  const fetchPersons = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (roleFilter) params.role = roleFilter
      if (statusFilter) params.status = statusFilter
      
      const response = await api.get('/persons', { params })
      setPersons(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Personel yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const getRoleLabel = (role: string) => {
    const labels: any = {
      OPERATOR: 'Operatör',
      RIGGER: 'Rigger',
      DRIVER: 'Şoför',
      SUPERVISOR: 'Sorumlu',
      OTHER: 'Diğer'
    }
    return labels[role] || role
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu personeli silmek istediğinize emin misiniz?')) return
    
    try {
      await api.delete(`/persons/${id}`)
      showToast('Personel başarıyla silindi', 'success')
      fetchPersons()
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Personel silinemedi', 'error')
    }
  }

  if (loading && persons.length === 0) return <div className="container"><div className="loading">Yükleniyor...</div></div>
  if (error && persons.length === 0) return <div className="container"><div className="error">{error}</div></div>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Personel</h2>
        <button className="btn btn-primary" onClick={() => { setSelectedPerson(null); setShowForm(true) }}>
          Yeni Personel
        </button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '15px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">Tüm Roller</option>
              <option value="OPERATOR">Operatör</option>
              <option value="RIGGER">Rigger</option>
              <option value="DRIVER">Şoför</option>
              <option value="SUPERVISOR">Sorumlu</option>
              <option value="OTHER">Diğer</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tüm Durumlar</option>
              <option value="ACTIVE">Aktif</option>
              <option value="INACTIVE">İnaktif</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {persons.length === 0 ? (
          <p style={{ color: '#666' }}>Personel bulunamadı</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Ad</th>
                <th>Rol</th>
                <th>Telefon</th>
                <th>E-posta</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {persons.map((person) => (
                <tr key={person.id}>
                  <td><strong>{person.name}</strong></td>
                  <td>
                    <span className="badge badge-info">
                      {getRoleLabel(person.role)}
                    </span>
                  </td>
                  <td>{person.phone || '-'}</td>
                  <td>{person.email || '-'}</td>
                  <td>
                    <span className={`badge ${person.status === 'ACTIVE' ? 'badge-success' : 'badge-secondary'}`}>
                      {person.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => { setSelectedPerson(person); setShowForm(true) }}
                      >
                        Düzenle
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => handleDelete(person.id)}
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
        <PersonForm
          person={selectedPerson}
          onClose={() => { setShowForm(false); setSelectedPerson(null) }}
          onSuccess={() => {
            fetchPersons()
            showToast(selectedPerson ? 'Personel güncellendi' : 'Personel oluşturuldu', 'success')
          }}
        />
      )}
    </div>
  )
}

