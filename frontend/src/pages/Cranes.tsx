import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal, Button as MantineButton, Group, Text, Tooltip, ActionIcon, Stack } from '@mantine/core'
import { IconEye, IconPencil, IconTrash } from '@tabler/icons-react'
import api from '../api/client'
import CraneForm from '../components/CraneForm'
import Pagination from '../components/Pagination'
import { exportCranesToExcel } from '../utils/export'
import { useToast } from '../contexts/ToastContext'

const TYPE_LABELS: Record<string, string> = {
  MOBILE: 'Mobil',
  PALETLI: 'Paletli',
  SEPET: 'Sepet',
  HIUP: 'Hi-up'
}

export default function Cranes() {
  const navigate = useNavigate()
  const [cranes, setCranes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [selectedCrane, setSelectedCrane] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetchCranes()
  }, [])

  const fetchCranes = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (searchTerm) params.search = searchTerm
      if (statusFilter) params.status = statusFilter
      if (typeFilter) params.type = typeFilter
      
      const response = await api.get('/cranes', { params })
      
      // Basit pagination (frontend'de)
      const allCranes = response.data
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      setCranes(allCranes.slice(start, end))
      setTotalPages(Math.ceil(allCranes.length / pageSize))
      setTotalCount(allCranes.length)
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Vinçler yüklenirken hata oluştu')
      showToast('Vinçler yüklenirken hata oluştu', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchCranes()
    }, 300)
    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter, typeFilter, currentPage])

  const deleteCrane = async (id: number) => {
    try {
      await api.delete(`/cranes/${id}`)
      showToast('Vinç başarıyla silindi', 'success')
      fetchCranes()
    } catch (err: any) {
      showToast(err.response?.data?.error || 'Vinç silinemedi', 'error')
      throw err
    }
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleteLoading(true)
      await deleteCrane(deleteTarget.id)
      setConfirmDeleteOpen(false)
      setDeleteTarget(null)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleExport = () => {
    try {
      api.get('/cranes').then((response) => {
        exportCranesToExcel(response.data)
        showToast('Excel dosyası indirildi', 'success')
      })
    } catch (err) {
      showToast('Export işlemi başarısız', 'error')
    }
  }

  if (loading && cranes.length === 0) return <div className="container"><div className="loading">Yükleniyor...</div></div>
  if (error && cranes.length === 0) return <div className="container"><div className="error">{error}</div></div>

  return (
    <div className="container">
      <div className="page-header">
        <div className="page-title-group">
          <h2 className="page-title">Vinçler</h2>
          <p className="page-subtitle">Toplam {totalCount} kayıt</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary btn-outline" onClick={handleExport}>
            Excel Export
          </button>
          <button className="btn btn-primary" onClick={() => { setSelectedCrane(null); setShowForm(true) }}>
            Yeni Vinç
          </button>
        </div>
      </div>

      <div className="filter-panel" style={{ marginBottom: '20px' }}>
        <div className="filters-grid columns-3">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Arama</label>
            <input
              type="text"
              placeholder="Vinç adı, model, plaka veya seri no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tüm Durumlar</option>
              <option value="ACTIVE">Aktif</option>
              <option value="MAINTENANCE">Bakımda</option>
              <option value="RETIRED">Emekli</option>
            </select>
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Vinç Tipi</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">Tüm Vinç Tipleri</option>
              <option value="MOBILE">Mobil</option>
              <option value="PALETLI">Paletli</option>
              <option value="SEPET">Sepet</option>
              <option value="HIUP">Hi-up</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {cranes.length === 0 ? (
          <div className="empty-state">Henüz vinç eklenmemiş</div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Vinç Adı</th>
                  <th>Vinç Tipi</th>
                  <th>Model</th>
                  <th>Model Yılı</th>
                  <th>Seri No</th>
                  <th>Plaka</th>
                  <th>Mevcut Konum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {cranes.map((crane) => (
                  <tr key={crane.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/cranes/${crane.id}`)}>
                    <td><strong>{crane.name}</strong></td>
                    <td>
                      <span className="chip">
                        {TYPE_LABELS[crane.type] || crane.type || '-'}
                      </span>
                    </td>
                    <td>{crane.model || '-'}</td>
                    <td>{crane.model_year || '-'}</td>
                    <td>{crane.serial_no || '-'}</td>
                    <td>{crane.plate_no || '-'}</td>
                    <td>{crane.location_name || '-'}</td>
                    <td>
                      <Group gap="xs" onClick={(e) => e.stopPropagation()}>
                        <Tooltip label="Düzenle" withArrow>
                          <ActionIcon
                            variant="light"
                            color="brand"
                            radius="md"
                            size="lg"
                            onClick={() => {
                              setSelectedCrane(crane)
                              setShowForm(true)
                            }}
                          >
                            <IconPencil size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Detayları gör" withArrow>
                          <ActionIcon
                            variant="light"
                            color="gray"
                            radius="md"
                            size="lg"
                            onClick={() => navigate(`/cranes/${crane.id}`)}
                          >
                            <IconEye size={18} />
                          </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Sil" withArrow>
                          <ActionIcon
                            variant="light"
                            color="red"
                            radius="md"
                            size="lg"
                            onClick={() => {
                              setDeleteTarget(crane)
                              setConfirmDeleteOpen(true)
                            }}
                          >
                            <IconTrash size={18} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {cranes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {showForm && (
        <CraneForm
          crane={selectedCrane}
          onClose={() => { setShowForm(false); setSelectedCrane(null) }}
          onSuccess={() => {
            fetchCranes()
            showToast(selectedCrane ? 'Vinç güncellendi' : 'Vinç oluşturuldu', 'success')
          }}
        />
      )}

      <Modal
        opened={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false)
          setDeleteTarget(null)
        }}
        title="Silme onayı"
        centered
        radius="lg"
      >
        <Stack gap="md">
          <Text size="sm">
            <strong>{deleteTarget?.name}</strong> vinç kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
          </Text>
          <Group justify="space-between">
            <MantineButton
              variant="default"
              onClick={() => {
                setConfirmDeleteOpen(false)
                setDeleteTarget(null)
              }}
            >
              Vazgeç
            </MantineButton>
            <MantineButton color="red" loading={deleteLoading} onClick={confirmDelete}>
              Evet, Sil
            </MantineButton>
          </Group>
        </Stack>
      </Modal>
    </div>
  )
}

