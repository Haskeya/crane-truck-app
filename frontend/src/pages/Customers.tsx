import { useEffect, useState } from 'react'
import api from '../api/client'
import CustomerForm from '../components/CustomerForm'
import { useToast } from '../contexts/ToastContext'

export default function Customers() {
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { showToast } = useToast()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchTerm) params.search = searchTerm
      
      const response = await api.get('/customers', { params })
      setCustomers(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Müşteriler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCustomers()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu müşteriyi silmek istediğinize emin misiniz?')) return
    
    try {
      await api.delete(`/customers/${id}`)
      showToast('Müşteri başarıyla silindi', 'success')
      fetchCustomers()
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Müşteri silinemedi', 'error')
    }
  }

  if (loading) return <div className="container"><div className="loading">Yükleniyor...</div></div>
  if (error) return <div className="container"><div className="error">{error}</div></div>

  if (loading && customers.length === 0) return <div className="container"><div className="loading">Yükleniyor...</div></div>
  if (error && customers.length === 0) return <div className="container"><div className="error">{error}</div></div>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Müşteriler</h2>
        <button className="btn btn-primary" onClick={() => { setSelectedCustomer(null); setShowForm(true) }}>
          Yeni Müşteri
        </button>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <input
            type="text"
            placeholder="Müşteri adı ile ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {customers.length === 0 ? (
          <p style={{ color: '#666' }}>Henüz müşteri eklenmemiş</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Müşteri Adı</th>
                <th>Şehir</th>
                <th>Notlar</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td><strong>{customer.name}</strong></td>
                  <td>{customer.city || '-'}</td>
                  <td>{customer.notes || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => { setSelectedCustomer(customer); setShowForm(true) }}
                      >
                        Düzenle
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => handleDelete(customer.id)}
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
        <CustomerForm
          customer={selectedCustomer}
          onClose={() => { setShowForm(false); setSelectedCustomer(null) }}
          onSuccess={() => {
            fetchCustomers()
            showToast(selectedCustomer ? 'Müşteri güncellendi' : 'Müşteri oluşturuldu', 'success')
          }}
        />
      )}
    </div>
  )
}

