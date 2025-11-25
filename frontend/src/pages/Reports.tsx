import { useEffect, useState } from 'react'
import api from '../api/client'
import { exportProjectsToExcel, exportMovementsToExcel } from '../utils/export'
import { useToast } from '../contexts/ToastContext'

export default function Reports() {
  const [reportType, setReportType] = useState<'projects' | 'movements' | 'equipment' | 'personnel'>('projects')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(false)
  const [reportData, setReportData] = useState<any[]>([])
  const { showToast } = useToast()

  useEffect(() => {
    generateReport()
  }, [reportType, dateFrom, dateTo, statusFilter])

  const generateReport = async () => {
    try {
      setLoading(true)
      let response

      switch (reportType) {
        case 'projects':
          const params: any = {}
          if (dateFrom) params.start_date_from = dateFrom
          if (dateTo) params.start_date_to = dateTo
          if (statusFilter) params.status = statusFilter
          response = await api.get('/projects', { params })
          setReportData(response.data)
          break

        case 'movements':
          const movementParams: any = {}
          if (dateFrom) movementParams.date_from = dateFrom
          if (dateTo) movementParams.date_to = dateTo
          response = await api.get('/movements', { params: movementParams })
          setReportData(response.data)
          break

        case 'equipment':
          response = await api.get('/equipment')
          setReportData(response.data)
          break

        case 'personnel':
          const personParams: any = {}
          if (statusFilter) personParams.status = statusFilter
          response = await api.get('/persons', { params: personParams })
          setReportData(response.data)
          break
      }
    } catch (err: any) {
      showToast('Rapor oluşturulurken hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    try {
      switch (reportType) {
        case 'projects':
          exportProjectsToExcel(reportData)
          break
        case 'movements':
          exportMovementsToExcel(reportData)
          break
        case 'equipment':
          // Equipment export fonksiyonu eklenebilir
          showToast('Ekipman export özelliği yakında eklenecek', 'info')
          break
        case 'personnel':
          // Personnel export fonksiyonu eklenebilir
          showToast('Personel export özelliği yakında eklenecek', 'info')
          break
      }
      showToast('Rapor Excel olarak indirildi', 'success')
    } catch (err) {
      showToast('Export işlemi başarısız', 'error')
    }
  }

  return (
    <div className="container">
      <h2>Raporlar</h2>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Rapor Filtreleri</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Rapor Tipi</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
            >
              <option value="projects">Projeler</option>
              <option value="movements">Hareketler</option>
              <option value="equipment">Ekipmanlar</option>
              <option value="personnel">Personel</option>
            </select>
          </div>

          <div className="form-group">
            <label>Başlangıç Tarihi</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Bitiş Tarihi</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>

          {(reportType === 'projects' || reportType === 'personnel') && (
            <div className="form-group">
              <label>Durum</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Tümü</option>
                {reportType === 'projects' ? (
                  <>
                    <option value="PLANNED">Planlı</option>
                    <option value="ACTIVE">Aktif</option>
                    <option value="COMPLETED">Tamamlanmış</option>
                    <option value="CANCELLED">İptal</option>
                  </>
                ) : (
                  <>
                    <option value="ACTIVE">Aktif</option>
                    <option value="INACTIVE">İnaktif</option>
                  </>
                )}
              </select>
            </div>
          )}
        </div>

        <div style={{ marginTop: '15px' }}>
          <button className="btn btn-primary" onClick={handleExport}>
            📊 Excel'e Aktar
          </button>
        </div>
      </div>

      <div className="card">
        <h3>Rapor Özeti</h3>
        {loading ? (
          <div className="loading">Yükleniyor...</div>
        ) : (
          <>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              Toplam kayıt sayısı: <strong>{reportData.length}</strong>
            </p>
            {reportData.length > 0 ? (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      {reportType === 'projects' && (
                        <>
                          <th>Proje Adı</th>
                          <th>Müşteri</th>
                          <th>Başlangıç</th>
                          <th>Bitiş</th>
                          <th>Durum</th>
                        </>
                      )}
                      {reportType === 'movements' && (
                        <>
                          <th>Tarih</th>
                          <th>Kaynak Tipi</th>
                          <th>Nereden</th>
                          <th>Nereye</th>
                        </>
                      )}
                      {reportType === 'equipment' && (
                        <>
                          <th>Ekipman Tipi</th>
                          <th>Seri No</th>
                          <th>Durum</th>
                          <th>Konum</th>
                        </>
                      )}
                      {reportType === 'personnel' && (
                        <>
                          <th>Ad</th>
                          <th>Rol</th>
                          <th>Telefon</th>
                          <th>Durum</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.slice(0, 50).map((item: any) => (
                      <tr key={item.id}>
                        {reportType === 'projects' && (
                          <>
                            <td>{item.name}</td>
                            <td>{item.customer_name || '-'}</td>
                            <td>{item.start_date ? new Date(item.start_date).toLocaleDateString('tr-TR') : '-'}</td>
                            <td>{item.end_date ? new Date(item.end_date).toLocaleDateString('tr-TR') : '-'}</td>
                            <td>
                              <span className={`badge badge-${item.status === 'ACTIVE' ? 'success' : 'info'}`}>
                                {item.status}
                              </span>
                            </td>
                          </>
                        )}
                        {reportType === 'movements' && (
                          <>
                            <td>{new Date(item.moved_at).toLocaleDateString('tr-TR')}</td>
                            <td>{item.resource_type}</td>
                            <td>{item.from_location_name || '-'}</td>
                            <td>{item.to_location_name}</td>
                          </>
                        )}
                        {reportType === 'equipment' && (
                          <>
                            <td>{item.equipment_type_name}</td>
                            <td>{item.serial_no || '-'}</td>
                            <td>{item.status}</td>
                            <td>{item.location_name || '-'}</td>
                          </>
                        )}
                        {reportType === 'personnel' && (
                          <>
                            <td>{item.name}</td>
                            <td>{item.role}</td>
                            <td>{item.phone || '-'}</td>
                            <td>
                              <span className={`badge badge-${item.status === 'ACTIVE' ? 'success' : 'secondary'}`}>
                                {item.status}
                              </span>
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {reportData.length > 50 && (
                  <p style={{ marginTop: '15px', color: '#666', textAlign: 'center' }}>
                    ... ve {reportData.length - 50} kayıt daha (Excel export'ta tümü görünecek)
                  </p>
                )}
              </div>
            ) : (
              <p style={{ color: '#666' }}>Rapor verisi bulunamadı</p>
            )}
          </>
        )}
      </div>
    </div>
  )
}


