import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'
import ProjectForm from '../components/ProjectForm'
import Pagination from '../components/Pagination'
import AdvancedSearch from '../components/AdvancedSearch'
import { exportProjectsToExcel } from '../utils/export'
import { useToast } from '../contexts/ToastContext'

export default function Projects() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false)
  const [advancedFilters, setAdvancedFilters] = useState<any>({})
  const navigate = useNavigate()
  const { showToast } = useToast()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage,
        limit: pageSize
      }
      if (searchTerm) params.search = searchTerm
      if (statusFilter) params.status = statusFilter
      
      // Gelişmiş filtreler
      Object.keys(advancedFilters).forEach(key => {
        if (advancedFilters[key]) {
          params[key] = advancedFilters[key]
        }
      })
      
      const response = await api.get('/projects', { params })
      
      // Eğer backend pagination döndürüyorsa
      if (response.data.data) {
        setProjects(response.data.data)
        setTotalPages(Math.ceil(response.data.total / pageSize))
      } else {
        // Basit pagination (frontend'de)
        const allProjects = response.data
        const start = (currentPage - 1) * pageSize
        const end = start + pageSize
        setProjects(allProjects.slice(start, end))
        setTotalPages(Math.ceil(allProjects.length / pageSize))
      }
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Projeler yüklenirken hata oluştu')
      showToast('Projeler yüklenirken hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1) // Arama/filtre değiştiğinde ilk sayfaya dön
  }, [searchTerm, statusFilter])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProjects()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter, currentPage])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Bu projeyi silmek istediğinize emin misiniz?')) return
    
    try {
      await api.delete(`/projects/${id}`)
      showToast('Proje başarıyla silindi', 'success')
      fetchProjects()
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Proje silinemedi', 'error')
    }
  }

  const handleExport = () => {
    try {
      // Tüm projeleri export için tekrar çek
      api.get('/projects').then((response) => {
        exportProjectsToExcel(response.data)
        showToast('Excel dosyası indirildi', 'success')
      })
    } catch (err) {
      showToast('Export işlemi başarısız', 'error')
    }
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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PLANNED: 'Planlı',
      ACTIVE: 'Aktif',
      COMPLETED: 'Tamamlandı',
      CANCELLED: 'İptal'
    }
    return labels[status] || status
  }

  if (loading && projects.length === 0) return <div className="container"><div className="loading">Yükleniyor...</div></div>
  if (error && projects.length === 0) return <div className="container"><div className="error">{error}</div></div>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Projeler</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExport}>
            Excel Export
          </button>
          <button className="btn btn-primary" onClick={() => { setSelectedProject(null); setShowForm(true) }}>
            Proje Ekle
          </button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 150px', gap: '15px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <input
              type="text"
              placeholder="Proje adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tüm Durumlar</option>
              <option value="PLANNED">Planlı</option>
              <option value="ACTIVE">Aktif</option>
              <option value="COMPLETED">Tamamlandı</option>
              <option value="CANCELLED">İptal</option>
            </select>
          </div>
          <button 
            className="btn btn-secondary"
            onClick={() => setShowAdvancedSearch(true)}
          >
            🔍 Gelişmiş Arama
          </button>
        </div>
        {Object.keys(advancedFilters).some(key => advancedFilters[key]) && (
          <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}>
            <strong>Aktif Filtreler:</strong>
            {Object.entries(advancedFilters)
              .filter(([, value]) => Boolean(value))
              .map(([key, value]) => (
                <span key={key} style={{ marginLeft: '10px', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
                  {key}: {value as string}
                  <button 
                    onClick={() => {
                      const newFilters = { ...advancedFilters }
                      delete newFilters[key]
                      setAdvancedFilters(newFilters)
                    }}
                    style={{ marginLeft: '5px', background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </span>
              ))}
          </div>
        )}
      </div>

      <div className="card">
        {projects.length === 0 ? (
          <p style={{ color: '#666' }}>Henüz proje eklenmemiş</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Proje Adı</th>
                <th>Müşteri</th>
                <th>Konum</th>
                <th>Proje Mühendisi</th>
                <th>Proje Saha Sorumlusu</th>
                <th>Başlangıç</th>
                <th>Bitiş</th>
                <th>Durum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
                {projects.map((project) => (
                <tr key={project.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/projects/${project.id}`)}>
                  <td><strong>{project.name}</strong></td>
                  <td>{project.customer_name || '-'}</td>
                  <td>{project.location_name || '-'}</td>
                  <td>{project.project_engineer_name || '-'}</td>
                  <td>{project.project_site_manager_name || '-'}</td>
                  <td>{project.start_date ? new Date(project.start_date).toLocaleDateString('tr-TR') : '-'}</td>
                  <td>{project.end_date ? new Date(project.end_date).toLocaleDateString('tr-TR') : '-'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '5px' }} onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => { setSelectedProject(project); setShowForm(true) }}
                      >
                        Düzenle
                      </button>
                      <button
                        className="btn btn-danger"
                        style={{ padding: '5px 10px', fontSize: '12px' }}
                        onClick={() => handleDelete(project.id)}
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
        
        {projects.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {showForm && (
        <ProjectForm
          project={selectedProject}
          onClose={() => { setShowForm(false); setSelectedProject(null) }}
          onSuccess={() => {
            fetchProjects()
            showToast(selectedProject ? 'Proje güncellendi' : 'Proje oluşturuldu', 'success')
          }}
        />
      )}

      {showAdvancedSearch && (
        <AdvancedSearch
          searchFields={['customer_name', 'location_name', 'start_date', 'end_date']}
          onSearch={(filters) => {
            setAdvancedFilters(filters)
            setCurrentPage(1)
          }}
          onClose={() => setShowAdvancedSearch(false)}
        />
      )}
    </div>
  )
}

