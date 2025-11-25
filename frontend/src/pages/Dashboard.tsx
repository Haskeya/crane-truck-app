import { useEffect, useState } from 'react'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import api from '../api/client'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface DashboardStats {
  stats: {
    activeProjects: number
    totalCranes: number
    activeCranes: number
    maintenanceCranes: number
    totalTrucks: number
    activeTrucks: number
    todayMovements: number
  }
  recentMovements: any[]
  activeProjects: any[]
}

interface ChartData {
  movementsByDay: any[]
  projectsByStatus: any[]
  cranesByStatus: any[]
  projectsByMonth: any[]
  topEquipmentTypes: any[]
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardStats | null>(null)
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
    fetchChartData()
  }, [])

  const fetchDashboard = async () => {
    try {
      setLoading(true)
      const response = await api.get('/dashboard/overview')
      setData(response.data)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Veri yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const fetchChartData = async () => {
    try {
      const response = await api.get('/dashboard/charts')
      setChartData(response.data)
    } catch (err) {
      console.error('Grafik verileri yüklenemedi:', err)
    }
  }

  if (loading) return <div className="container"><div className="loading">Yükleniyor...</div></div>
  if (error) return <div className="container"><div className="error">{error}</div></div>
  if (!data) return null

  // Grafik verileri hazırlama
  const movementsChartData = chartData ? {
    labels: chartData.movementsByDay.map((item: any) => 
      new Date(item.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
    ),
    datasets: [{
      label: 'Hareket Sayısı',
      data: chartData.movementsByDay.map((item: any) => parseInt(item.count)),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      tension: 0.1
    }]
  } : null

  const projectsStatusData = chartData ? {
    labels: chartData.projectsByStatus.map((item: any) => item.status),
    datasets: [{
      data: chartData.projectsByStatus.map((item: any) => parseInt(item.count)),
      backgroundColor: [
        'rgba(54, 162, 235, 0.8)',
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(255, 99, 132, 0.8)'
      ]
    }]
  } : null

  const cranesStatusData = chartData ? {
    labels: chartData.cranesByStatus.map((item: any) => item.status),
    datasets: [{
      data: chartData.cranesByStatus.map((item: any) => parseInt(item.count)),
      backgroundColor: [
        'rgba(75, 192, 192, 0.8)',
        'rgba(255, 206, 86, 0.8)',
        'rgba(255, 99, 132, 0.8)'
      ]
    }]
  } : null

  const projectsByMonthData = chartData ? {
    labels: chartData.projectsByMonth.map((item: any) => {
      const [year, month] = item.month.split('-')
      return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' })
    }),
    datasets: [{
      label: 'Proje Sayısı',
      data: chartData.projectsByMonth.map((item: any) => parseInt(item.count)),
      backgroundColor: 'rgba(54, 162, 235, 0.8)'
    }]
  } : null

  const topEquipmentData = chartData ? {
    labels: chartData.topEquipmentTypes.map((item: any) => item.name),
    datasets: [{
      label: 'Kullanım Sayısı',
      data: chartData.topEquipmentTypes.map((item: any) => parseInt(item.usage_count)),
      backgroundColor: 'rgba(153, 102, 255, 0.8)'
    }]
  } : null

  return (
    <div className="container">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Aktif Projeler</h3>
          <div className="value">{data.stats.activeProjects}</div>
        </div>
        <div className="stat-card">
          <h3>Toplam Vinç</h3>
          <div className="value">{data.stats.totalCranes}</div>
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Aktif: {data.stats.activeCranes} | Bakımda: {data.stats.maintenanceCranes}
          </div>
        </div>
        <div className="stat-card">
          <h3>Toplam Kamyon</h3>
          <div className="value">{data.stats.totalTrucks}</div>
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            Aktif: {data.stats.activeTrucks}
          </div>
        </div>
        <div className="stat-card">
          <h3>Bugünkü Hareketler</h3>
          <div className="value">{data.stats.todayMovements}</div>
        </div>
      </div>

      {/* Grafikler */}
      {chartData && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
          {movementsChartData && (
            <div className="card">
              <h3>Son 7 Günlük Hareketler</h3>
              <Line data={movementsChartData} options={{
                responsive: true,
                plugins: {
                  legend: { display: true }
                }
              }} />
            </div>
          )}

          {projectsStatusData && (
            <div className="card">
              <h3>Proje Durumları</h3>
              <Doughnut data={projectsStatusData} options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }} />
            </div>
          )}

          {cranesStatusData && (
            <div className="card">
              <h3>Vinç Durumları</h3>
              <Doughnut data={cranesStatusData} options={{
                responsive: true,
                plugins: {
                  legend: { position: 'bottom' }
                }
              }} />
            </div>
          )}

          {projectsByMonthData && (
            <div className="card">
              <h3>Aylık Proje Sayıları (Son 6 Ay)</h3>
              <Bar data={projectsByMonthData} options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                }
              }} />
            </div>
          )}

          {topEquipmentData && topEquipmentData.labels.length > 0 && (
            <div className="card" style={{ gridColumn: '1 / -1' }}>
              <h3>En Çok Kullanılan Ekipmanlar</h3>
              <Bar data={topEquipmentData} options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                }
              }} />
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div className="card">
          <h3>Aktif Projeler</h3>
          {data.activeProjects.length === 0 ? (
            <p style={{ color: '#666', marginTop: '10px' }}>Aktif proje yok</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Proje Adı</th>
                  <th>Müşteri</th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {data.activeProjects.map((project: any) => (
                  <tr key={project.id}>
                    <td>{project.name}</td>
                    <td>{project.customer_name || '-'}</td>
                    <td>
                      <span className={`badge badge-${project.status === 'ACTIVE' ? 'success' : 'info'}`}>
                        {project.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h3>Son Hareketler</h3>
          {data.recentMovements.length === 0 ? (
            <p style={{ color: '#666', marginTop: '10px' }}>Hareket kaydı yok</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Nereden</th>
                  <th>Nereye</th>
                </tr>
              </thead>
              <tbody>
                {data.recentMovements.map((movement: any) => (
                  <tr key={movement.id}>
                    <td>{new Date(movement.moved_at).toLocaleDateString('tr-TR')}</td>
                    <td>{movement.from_location_name || '-'}</td>
                    <td>{movement.to_location_name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
