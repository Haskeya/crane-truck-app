import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function ProjectTimeline() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchProject()
      fetchTimeline()
    }
  }, [id])

  const fetchProject = async () => {
    try {
      const response = await api.get(`/projects/${id}`)
      setProject(response.data)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Proje yüklenirken hata oluştu')
    }
  }

  const fetchTimeline = async () => {
    try {
      setLoading(true)
      
      // Proje atamalarını al
      const assignmentsResponse = await api.get(`/projects/${id}/assignments`)
      const assignments = assignmentsResponse.data

      // Projeye ait hareketleri al
      const movementsResponse = await api.get('/movements', {
        params: { date_from: project?.start_date || '2020-01-01' }
      })
      const movements = movementsResponse.data.filter((m: any) => {
        // Projeye atanmış kaynakların hareketlerini filtrele
        return assignments.some((a: any) => 
          a.resource_type === m.resource_type && a.resource_id === m.resource_id
        )
      })

      // Timeline oluştur
      const timelineItems: any[] = []

      // Proje oluşturulma
      if (project) {
        timelineItems.push({
          type: 'project_created',
          date: project.created_at,
          title: 'Proje Oluşturuldu',
          description: `Proje "${project.name}" oluşturuldu`,
          icon: '📋'
        })
      }

      // Proje başlangıç
      if (project?.start_date) {
        timelineItems.push({
          type: 'project_started',
          date: project.start_date,
          title: 'Proje Başladı',
          description: `Proje başlangıç tarihi: ${new Date(project.start_date).toLocaleDateString('tr-TR')}`,
          icon: '▶️'
        })
      }

      // Atamalar
      assignments.forEach((assignment: any) => {
        timelineItems.push({
          type: 'assignment',
          date: assignment.assigned_at,
          title: `${assignment.resource_type} Atandı`,
          description: `${assignment.resource_name} projeye atandı`,
          icon: assignment.resource_type === 'CRANE' ? '🏗️' : 
                assignment.resource_type === 'TRUCK' ? '🚛' :
                assignment.resource_type === 'EQUIPMENT' ? '⚙️' : '👤'
        })
      })

      // Hareketler
      movements.forEach((movement: any) => {
        timelineItems.push({
          type: 'movement',
          date: movement.moved_at,
          title: `${movement.resource_type} Hareket Etti`,
          description: `${movement.from_location_name || 'Bilinmeyen'} → ${movement.to_location_name}`,
          icon: '🚚'
        })
      })

      // Proje bitiş
      if (project?.end_date) {
        timelineItems.push({
          type: 'project_ended',
          date: project.end_date,
          title: 'Proje Bitti',
          description: `Proje bitiş tarihi: ${new Date(project.end_date).toLocaleDateString('tr-TR')}`,
          icon: '✅'
        })
      }

      // Tarihe göre sırala
      timelineItems.sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )

      setTimeline(timelineItems)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Timeline yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (project) {
      fetchTimeline()
    }
  }, [project])

  if (loading) return <div className="container"><div className="loading">Yükleniyor...</div></div>
  if (error) return <div className="container"><div className="error">{error}</div></div>
  if (!project) return null

  return (
    <div className="container">
      <div style={{ marginBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={() => navigate(`/projects/${id}`)}>
          ← Proje Detayına Dön
        </button>
      </div>

      <h2>{project.name} - Zaman Çizelgesi</h2>

      <div className="card" style={{ marginTop: '20px' }}>
        {timeline.length === 0 ? (
          <p style={{ color: '#666' }}>Timeline verisi bulunamadı</p>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '30px' }}>
            {timeline.map((item, index) => (
              <div
                key={index}
                style={{
                  position: 'relative',
                  paddingBottom: '30px',
                  borderLeft: index < timeline.length - 1 ? '2px solid #ddd' : 'none'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: '-35px',
                    top: '0',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: '#007bff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    border: '3px solid white',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  {item.icon}
                </div>
                <div style={{ marginLeft: '20px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                    {item.title}
                  </div>
                  <div style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>
                    {item.description}
                  </div>
                  <div style={{ color: '#999', fontSize: '12px' }}>
                    {new Date(item.date).toLocaleString('tr-TR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}





