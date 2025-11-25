import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'
import AssignmentModal from '../components/AssignmentModal'
import UnassignModal from '../components/UnassignModal'
import { useToast } from '../contexts/ToastContext'
import { exportProjectSummaryPdf } from '../utils/projectSummaryPdf'

type HistoryEvent = {
  id: string
  resource_name: string
  resource_type: string
  action: string
  date: string
  description: string
  eventType: 'ASSIGN' | 'UNASSIGN'
}

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [project, setProject] = useState<any>(null)
  const [assignments, setAssignments] = useState<any[]>([])
  const [assignmentHistory, setAssignmentHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [assignmentType, setAssignmentType] = useState<'CRANE' | 'TRUCK' | 'EQUIPMENT' | 'PERSON' | null>(null)
  const [showUnassignModal, setShowUnassignModal] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [historyFilter, setHistoryFilter] = useState<'ALL' | 'ASSIGN' | 'UNASSIGN'>('ALL')

  useEffect(() => {
    if (id) {
      fetchProject()
      fetchAssignments()
      fetchAssignmentHistory()
    }
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/projects/${id}`)
      setProject(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Proje yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchAssignments = async () => {
    try {
      const response = await api.get(`/projects/${id}/assignments`)
      setAssignments(response.data)
    } catch (err) {
      console.error('Atamalar yüklenemedi:', err)
    }
  }

  const fetchAssignmentHistory = async () => {
    try {
      const response = await api.get(`/projects/${id}/assignment-history`)
      setAssignmentHistory(response.data)
    } catch (err) {
      console.error('Atama geçmişi yüklenemedi:', err)
    }
  }

  const handleUnassignClick = (assignment: any) => {
    setSelectedAssignment(assignment)
    setShowUnassignModal(true)
  }

  const handleAssignmentChange = () => {
    fetchAssignments()
    fetchAssignmentHistory()
  }

  const handleCompleteProject = async () => {
    if (!project || !id) return
    
    if (!window.confirm('Bu projeyi tamamlandı olarak işaretlemek istediğinize emin misiniz?')) {
      return
    }

    try {
      const today = new Date().toISOString().split('T')[0]
      await api.put(`/projects/${id}`, {
        ...project,
        status: 'COMPLETED',
        actual_end_date: today
      })
      
      // Projeyi yeniden yükle
      await fetchProject()
      
      showToast('Proje başarıyla tamamlandı olarak işaretlendi', 'success')
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Proje tamamlanırken hata oluştu'
      showToast(errorMsg, 'error')
    }
  }

  const handleExportPdf = () => {
    if (!project) {
      showToast('Proje bilgileri yüklenemedi', 'error')
      return
    }

    try {
      // Assignment history'yi formatla
      const formattedHistory = assignmentHistory
        .flatMap((record) => {
          const rows: HistoryEvent[] = [
            {
              id: `${record.id}-assign`,
              resource_name: record.resource_name || `ID: ${record.resource_id}`,
              resource_type: record.resource_type,
              action: 'Projeye Atandı',
              date: record.assigned_at,
              description: record.notes || '-',
              eventType: 'ASSIGN'
            }
          ]

          if (record.unassigned_at) {
            rows.push({
              id: `${record.id}-unassign`,
              resource_name: record.resource_name || `ID: ${record.resource_id}`,
              resource_type: record.resource_type,
              action: 'Projeden Ayrıldı',
              date: record.unassigned_at,
              description: record.unassignment_reason || '-',
              eventType: 'UNASSIGN'
            })
          }

          return rows
        })
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      exportProjectSummaryPdf({
        project,
        assignments,
        assignmentHistory: formattedHistory
      })
      
      showToast('Proje özet raporu PDF olarak indirildi', 'success')
    } catch (err) {
      console.error('PDF export failed', err)
      showToast('PDF oluşturulurken hata oluştu', 'error')
    }
  }

  const openAssignmentModal = (type: 'CRANE' | 'TRUCK' | 'EQUIPMENT' | 'PERSON') => {
    setAssignmentType(type)
    setShowAssignmentModal(true)
  }

  const getStatusBadge = (status: string) => {
    const badges: any = {
      PLANNED: 'badge-info',
      ACTIVE: 'badge-success',
      COMPLETED: 'badge-secondary',
      CANCELLED: 'badge-danger'
    }
    return badges[status] || 'badge-info'
  }

  const getResourceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      CRANE: 'Vinç',
      TRUCK: 'Çekici/Dorse',
      EQUIPMENT: 'Ekipman',
      PERSON: 'Personel'
    }
    return labels[type] || type
  }

  if (loading) return <div className="container"><div className="loading">Yükleniyor...</div></div>
  if (error) return <div className="container"><div className="error">{error}</div></div>
  if (!project) return null

  return (
    <div className="container">
      <div className="page-actions" style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
        <button className="btn btn-secondary" onClick={() => navigate('/projects')}>
          ← Listeye Dön
        </button>
        {project && (
          <button className="btn btn-primary" onClick={handleExportPdf}>
            📄 PDF Özet İndir
          </button>
        )}
      </div>

      <div className="detail-header">
        <div className="detail-header-top">
          <div>
            <h2 className="page-title" style={{ fontSize: '32px', marginBottom: '8px' }}>{project.name}</h2>
            <div className="detail-meta">
              <span className="chip">Müşteri: {project.customer_name || '-'}</span>
              <span className="chip">Konum: {project.location_name || '-'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {project.status !== 'COMPLETED' && (
              <button 
                className="btn btn-primary" 
                onClick={handleCompleteProject}
                style={{ whiteSpace: 'nowrap' }}
              >
                Proje Tamamlandı
              </button>
            )}
            <span className={`badge ${getStatusBadge(project.status)}`}>
              {project.status}
            </span>
          </div>
        </div>
      </div>

      <div style={{ borderBottom: '2px solid var(--color-border)', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="chip"
            style={{
              background: activeTab === 'overview' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'overview' ? 'white' : 'var(--color-text-secondary)',
              border: activeTab === 'overview' ? 'none' : '1px solid var(--color-border)',
              cursor: 'pointer',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: activeTab === 'overview' ? '600' : '400',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab('overview')}
          >
            Genel Bakış
          </button>
          <button
            className="chip"
            style={{
              background: activeTab === 'assignments' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'assignments' ? 'white' : 'var(--color-text-secondary)',
              border: activeTab === 'assignments' ? 'none' : '1px solid var(--color-border)',
              cursor: 'pointer',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: activeTab === 'assignments' ? '600' : '400',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab('assignments')}
          >
            Atamalar
          </button>
          <button
            className="chip"
            style={{
              background: activeTab === 'history' ? 'var(--color-primary)' : 'transparent',
              color: activeTab === 'history' ? 'white' : 'var(--color-text-secondary)',
              border: activeTab === 'history' ? 'none' : '1px solid var(--color-border)',
              cursor: 'pointer',
              padding: '10px 20px',
              borderRadius: 'var(--radius-md)',
              fontWeight: activeTab === 'history' ? '600' : '400',
              transition: 'all 0.2s ease'
            }}
            onClick={() => setActiveTab('history')}
          >
            Proje Hareketleri
          </button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="detail-card-grid">
          <div className="card">
            <h3>Genel Bilgiler</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Müşteri:</span>
                <span className="info-value">{project.customer_name || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Konum:</span>
                <span className="info-value">{project.location_name || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Proje Mühendisi:</span>
                <span className="info-value">{project.project_engineer_name || '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Proje Saha Sorumlusu:</span>
                <span className="info-value">{project.project_site_manager_name || '-'}</span>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Tarih Bilgileri</h3>
            <div className="info-list">
              <div className="info-item">
                <span className="info-label">Başlangıç Tarihi:</span>
                <span className="info-value">{project.start_date ? new Date(project.start_date).toLocaleDateString('tr-TR') : '-'}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Bitiş Tarihi:</span>
                <span className="info-value">{project.end_date ? new Date(project.end_date).toLocaleDateString('tr-TR') : '-'}</span>
              </div>
              {project.actual_start_date && (
                <div className="info-item">
                  <span className="info-label">Gerçek Başlangıç:</span>
                  <span className="info-value">{new Date(project.actual_start_date).toLocaleDateString('tr-TR')}</span>
                </div>
              )}
              {project.actual_end_date && (
                <div className="info-item">
                  <span className="info-label">Gerçek Bitiş:</span>
                  <span className="info-value">{new Date(project.actual_end_date).toLocaleDateString('tr-TR')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3>Proje Ekip - Ekipman Takip</h3>
            {assignments.length === 0 ? (
              <p style={{ color: '#666', margin: 0 }}>Bu projeye henüz kaynak atanmadı.</p>
            ) : (
              <div className="detail-card-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                {['CRANE', 'TRUCK', 'EQUIPMENT', 'PERSON'].map((type) => {
                  const typeAssignments = assignments.filter((a: any) => a.resource_type === type)
                  if (typeAssignments.length === 0) return null
                  const typeLabel = type === 'CRANE'
                    ? 'Vinçler'
                    : type === 'TRUCK'
                      ? 'Çekici Dorseler'
                      : type === 'EQUIPMENT'
                        ? 'Ekipmanlar'
                        : 'Personel'

                  return (
                    <div key={type} className="info-list" style={{ background: '#f9fafb', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                      <div className="info-item" style={{ justifyContent: 'space-between' }}>
                        <span className="info-label" style={{ margin: 0 }}>{typeLabel}</span>
                        <span className="chip" style={{ margin: 0 }}>{typeAssignments.length}</span>
                      </div>
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {typeAssignments.slice(0, 4).map((assignment) => (
                          <span key={assignment.id} className="chip" style={{ justifyContent: 'flex-start' }}>
                            {assignment.resource_name || `ID: ${assignment.resource_id}`}
                          </span>
                        ))}
                        {typeAssignments.length > 4 && (
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            +{typeAssignments.length - 4} diğer {typeLabel.toLowerCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <h3>Notlar</h3>
            <p style={{ color: '#666', whiteSpace: 'pre-wrap', margin: 0 }}>
              {project.notes || 'Not bulunmuyor.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => openAssignmentModal('CRANE')}>
              + Vinç Ekle
            </button>
            <button className="btn btn-primary" onClick={() => openAssignmentModal('TRUCK')}>
              + Çekici/Dorse Ekle
            </button>
            <button className="btn btn-primary" onClick={() => openAssignmentModal('EQUIPMENT')}>
              + Ekipman Ekle
            </button>
            <button className="btn btn-primary" onClick={() => openAssignmentModal('PERSON')}>
              + Personel Ekle
            </button>
          </div>

          <div className="card">
            <h3>Atanan Kaynaklar</h3>
            {assignments.length === 0 ? (
              <p style={{ color: '#666' }}>Henüz kaynak atanmamış</p>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {['CRANE', 'TRUCK', 'EQUIPMENT', 'PERSON'].map((type) => {
                  const typeAssignments = assignments.filter((a: any) => a.resource_type === type)
                  if (typeAssignments.length === 0) return null

                  return (
                    <div key={type}>
                      <h4 style={{ marginBottom: '10px' }}>
                        {type === 'CRANE' ? 'Vinçler' : type === 'TRUCK' ? 'Çekici Dorseler' : type === 'EQUIPMENT' ? 'Ekipmanlar' : 'Personel'}
                      </h4>
                      <table>
                        <thead>
                          <tr>
                            <th>Kaynak</th>
                            <th>Atama Tarihi</th>
                            <th>Notlar</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {typeAssignments.map((assignment: any) => (
                            <tr key={assignment.id}>
                              <td>{assignment.resource_name || `ID: ${assignment.resource_id}`}</td>
                              <td>{new Date(assignment.assigned_at).toLocaleDateString('tr-TR')}</td>
                              <td>{assignment.notes || '-'}</td>
                              <td>
                                <button
                                  className="btn btn-danger"
                                  style={{ padding: '5px 10px', fontSize: '12px' }}
                                  onClick={() => handleUnassignClick(assignment)}
                                >
                                  Çıkar
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="card">
          <div className="history-header">
            <h3>Proje Hareketleri</h3>
            <div className="history-filter-group">
              {[
                { key: 'ALL', label: 'Tümü' },
                { key: 'ASSIGN', label: 'Atamalar' },
                { key: 'UNASSIGN', label: 'Çıkarmalar' }
              ].map((filter) => (
                <button
                  key={filter.key}
                  className={`filter-chip ${historyFilter === filter.key ? 'active' : ''}`}
                  onClick={() => setHistoryFilter(filter.key as 'ALL' | 'ASSIGN' | 'UNASSIGN')}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          {assignmentHistory.length === 0 ? (
            <p style={{ color: '#666' }}>Henüz hareket kaydı bulunmuyor.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Kaynak</th>
                  <th>Tür</th>
                  <th>İşlem</th>
                  <th>Tarih</th>
                  <th>Açıklama</th>
                </tr>
              </thead>
              <tbody>
                {assignmentHistory
                  .flatMap((record) => {
                    const rows: HistoryEvent[] = [
                      {
                        id: `${record.id}-assign`,
                        resource_name: record.resource_name || `ID: ${record.resource_id}`,
                        resource_type: record.resource_type,
                        action: 'Projeye Atandı',
                        date: record.assigned_at,
                        description: record.notes || '-',
                        eventType: 'ASSIGN'
                      }
                    ]

                    if (record.unassigned_at) {
                      rows.push({
                        id: `${record.id}-unassign`,
                        resource_name: record.resource_name || `ID: ${record.resource_id}`,
                        resource_type: record.resource_type,
                        action: 'Projeden Çıkarıldı',
                        date: record.unassigned_at,
                        description: record.unassignment_reason || '-',
                        eventType: 'UNASSIGN' as const
                      })
                    }

                    return rows
                  })
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .filter((event) => {
                    if (historyFilter === 'ALL') return true
                    return historyFilter === 'ASSIGN' ? event.eventType === 'ASSIGN' : event.eventType === 'UNASSIGN'
                  })
                  .map((event) => (
                    <tr key={event.id}>
                      <td>{event.resource_name}</td>
                      <td>{getResourceTypeLabel(event.resource_type)}</td>
                      <td>
                        <span
                          className={`history-action-badge ${
                            event.eventType === 'ASSIGN' ? 'success' : 'danger'
                          }`}
                        >
                          {event.action}
                        </span>
                      </td>
                      <td>{new Date(event.date).toLocaleString('tr-TR')}</td>
                      <td>
                        {event.eventType === 'UNASSIGN' ? (
                          <div className="history-reason">
                            <span className="history-reason-label">Çıkarma Nedeni</span>
                            <p>{event.description || '-'}</p>
                          </div>
                        ) : (
                          event.description || '-'
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {showAssignmentModal && assignmentType && (
        <AssignmentModal
          projectId={parseInt(id!)}
          resourceType={assignmentType}
          onClose={() => { setShowAssignmentModal(false); setAssignmentType(null) }}
          onSuccess={handleAssignmentChange}
        />
      )}

      {showUnassignModal && selectedAssignment && (
        <UnassignModal
          projectId={parseInt(id!)}
          assignment={selectedAssignment}
          onClose={() => { setShowUnassignModal(false); setSelectedAssignment(null) }}
          onSuccess={handleAssignmentChange}
        />
      )}
    </div>
  )
}

