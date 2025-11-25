import { useEffect, useState } from 'react'
import api from '../api/client'
import { useToast } from '../contexts/ToastContext'
import { exportPlanningPdf } from '../utils/planningPdf'

const CRANE_TYPES = [
  { value: 'MOBILE', label: 'Mobil Vinç' },
  { value: 'PALETLI', label: 'Paletli Vinç' },
  { value: 'SEPET', label: 'Sepet Vinç' },
  { value: 'HIUP', label: 'Hi-up' }
]

const STEPS = [
  { id: 1, title: 'Vinç Tipi', desc: '' },
  { id: 2, title: 'Vinç', desc: '' },
  { id: 3, title: 'Konfigürasyon', desc: '' }
]

export default function CraneConfigs() {
  const { showToast } = useToast()
  const [step, setStep] = useState<1 | 2 | 3>(1) // 1: Tip seçimi, 2: Vinç seçimi, 3: Konfigürasyon seçimi
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedCrane, setSelectedCrane] = useState<any>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  
  const [cranes, setCranes] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [availability, setAvailability] = useState<any>(null)
  const [craneSearch, setCraneSearch] = useState('')
  const [availabilityTab, setAvailabilityTab] = useState<'results' | 'planning'>('results')
  const [planningSelection, setPlanningSelection] = useState<Record<string, any[]>>({})
  const [planningItems, setPlanningItems] = useState<any[]>([])
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Adım 1: Vinç tipi seçildiğinde vinçleri getir
  useEffect(() => {
    if (selectedType) {
      fetchCranesByType()
    } else {
      setCranes([])
      setStep(1)
    }
  }, [selectedType])

  // Adım 2: Vinç seçildiğinde konfigürasyonları getir
  useEffect(() => {
    if (selectedCrane) {
      fetchTemplatesByCrane()
    } else {
      setTemplates([])
    }
  }, [selectedCrane])

  const fetchCranesByType = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/cranes', { params: { type: selectedType } })
      setCranes(response.data)
      if (response.data.length > 0) {
        setStep(2)
      } else {
        showToast('Seçilen tipte vinç bulunamadı', 'warning')
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Vinçler yüklenirken hata oluştu'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchTemplatesByCrane = async () => {
    if (!selectedCrane?.model) return
    
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/crane-configs/templates', { 
        params: { crane_model: selectedCrane.model } 
      })
      setTemplates(response.data)
      if (response.data.length > 0) {
        setStep(3)
      } else {
        showToast('Bu vinç için konfigürasyon bulunamadı', 'warning')
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Konfigürasyonlar yüklenirken hata oluştu'
      setError(errorMsg)
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleTypeSelect = (type: string) => {
    setSelectedType(type)
    setSelectedCrane(null)
    setSelectedTemplate(null)
    setTemplates([])
    setAvailability(null)
    setPlanningSelection({})
    setPlanningItems([])
    setAvailabilityTab('results')
  }

  const handleCraneSelect = (crane: any) => {
    setSelectedCrane(crane)
    setSelectedTemplate(null)
    setAvailability(null)
    setPlanningSelection({})
    setPlanningItems([])
    setAvailabilityTab('results')
  }

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template)
    checkAvailability(template.id)
    setPlanningSelection({})
    setPlanningItems([])
    setAvailabilityTab('results')
  }

  const checkAvailability = async (templateId: number) => {
    try {
      setLoading(true)
      const response = await api.get(`/crane-configs/templates/${templateId}/check-availability`)
      setAvailability(response.data)
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Uygunluk kontrolü yapılamadı'
      showToast(errorMsg, 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setStep(1)
    setSelectedType('')
    setSelectedCrane(null)
    setSelectedTemplate(null)
    setCranes([])
    setTemplates([])
    setAvailability(null)
    setPlanningSelection({})
    setPlanningItems([])
    setAvailabilityTab('results')
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      ACTIVE: 'badge-success',
      MAINTENANCE: 'badge-warning',
      RETIRED: 'badge-danger'
    }
    return badges[status] || 'badge-info'
  }

  const selectedTypeLabel = selectedType
    ? (CRANE_TYPES.find((t) => t.value === selectedType)?.label || selectedType)
    : 'Seçilmedi'

  const togglePlanningSelection = (typeKey: string, equipment: any, typeName: string) => {
    setPlanningSelection((prev) => {
      const current = prev[typeKey] || []
      const exists = current.find((item) => item.id === equipment.id)
      let updated = exists
        ? current.filter((item) => item.id !== equipment.id)
        : [...current, { ...equipment, equipment_type_name: typeName }]
      const next = { ...prev }
      if (updated.length === 0) {
        delete next[typeKey]
      } else {
        next[typeKey] = updated
      }
      return next
    })
  }

  const selectedPlanningCount = Object.values(planningSelection).reduce(
    (sum, list) => sum + list.length,
    0
  )

  const addPlanningItems = () => {
    const selectedItems = Object.values(planningSelection).flat()
    if (!selectedItems.length) return
    setPlanningItems((prev) => {
      const newOnes = selectedItems.filter(
        (item) => !prev.some((existing) => existing.id === item.id)
      )
      if (!newOnes.length) {
        showToast('Seçilen ekipmanlar zaten planlamada', 'info')
        return prev
      }
      showToast(`${newOnes.length} ekipman planlamaya eklendi`, 'success')
      return [...prev, ...newOnes]
    })
    setPlanningSelection({})
    setAvailabilityTab('planning')
  }

  const removePlanningItem = (id: number) => {
    setPlanningItems((prev) => prev.filter((item) => item.id !== id))
  }

  useEffect(() => {
    if (!availability) {
      setPlanningSelection({})
      setPlanningItems([])
      setAvailabilityTab('results')
    }
  }, [availability])

  const handleExportPlanningPdf = () => {
    if (!planningItems.length) {
      showToast('Planlamada ekipman bulunmuyor', 'warning')
      return
    }
    if (!selectedCrane || !selectedTemplate) {
      showToast('Vinç ve konfigürasyon seçilmeden PDF oluşturulamaz', 'warning')
      return
    }

    try {
      exportPlanningPdf({
        crane: selectedCrane,
        template: selectedTemplate,
        planningItems,
        craneTypeLabel: selectedTypeLabel
      })
      showToast('Planlama PDF olarak indirildi', 'success')
    } catch (err) {
      console.error('PDF export failed', err)
      showToast('PDF oluşturulurken hata oluştu', 'error')
    }
  }

  return (
    <div className="container">
      <div className="page-header">
        <div className="page-title-group">
          <h2 className="page-title">Vinç Konfigüratör</h2>
          <p className="page-subtitle">3 adımda vinç için ekipman kombinasyonunu oluştur</p>
        </div>
        {(selectedType || selectedCrane || selectedTemplate) && (
          <div className="page-actions">
            <button className="btn btn-secondary" onClick={handleReset}>
              Baştan Başla
            </button>
          </div>
        )}
      </div>

      <div className="stepper">
        {STEPS.map((stepItem) => (
          <div
            key={stepItem.id}
            className={`stepper-item ${step >= stepItem.id ? 'active' : ''}`}
          >
            <div className="stepper-index">{stepItem.id}</div>
            <div className="stepper-text">
              <span className="stepper-title">{stepItem.title}</span>
              <span className="stepper-desc">{stepItem.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: availability ? '1fr 1fr' : '1fr', gap: '20px' }}>
        {/* Adım 1: Vinç Tipi Seçimi */}
        {step === 1 && (
          <div className="card">
            <h3>1. Vinç Tipi Seçin</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '20px' }}>
              {CRANE_TYPES.map((type) => (
                <button
                  key={type.value}
                  className="btn btn-primary"
                  style={{ 
                    padding: '20px',
                    fontSize: '16px',
                    backgroundColor: selectedType === type.value ? '#0056b3' : '#007bff'
                  }}
                  onClick={() => handleTypeSelect(type.value)}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Adım 2: Vinç Seçimi */}
        {step === 2 && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>2. Vinç Seçin</h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '5px 10px', fontSize: '12px' }}
                onClick={() => {
                  setSelectedType('')
                  setStep(1)
                }}
              >
                ← Geri
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', gap: '15px' }}>
              <p style={{ color: '#666', margin: 0 }}>
                Seçilen Tip: <strong>{CRANE_TYPES.find(t => t.value === selectedType)?.label}</strong>
              </p>
              <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                <input
                  type="text"
                  placeholder="Vinç adı, plaka veya seri no ile ara..."
                  value={craneSearch}
                  onChange={(e) => setCraneSearch(e.target.value)}
                />
              </div>
            </div>
            
            {loading && cranes.length === 0 ? (
              <div className="loading">Yükleniyor...</div>
            ) : cranes.length === 0 ? (
              <div className="empty-state">Bu tipte vinç bulunamadı</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Vinç Adı</th>
                      <th>Model</th>
                      <th>Seri No</th>
                      <th>Plaka</th>
                      <th>Durum</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cranes
                      .filter((crane) => {
                        if (!craneSearch) return true
                        const term = craneSearch.toLowerCase()
                        return (
                          crane.name?.toLowerCase().includes(term) ||
                          crane.plate_no?.toLowerCase().includes(term) ||
                          crane.serial_no?.toLowerCase().includes(term)
                        )
                      })
                      .map((crane) => (
                      <tr 
                        key={crane.id}
                        style={{ 
                          backgroundColor: selectedCrane?.id === crane.id ? 'rgba(231, 156, 0, 0.15)' : 'transparent',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleCraneSelect(crane)}
                      >
                        <td><strong>{crane.name}</strong></td>
                        <td>{crane.model || '-'}</td>
                        <td>{crane.serial_no || '-'}</td>
                        <td>{crane.plate_no || '-'}</td>
                        <td>
                          <span className={`badge ${getStatusBadge(crane.status)}`}>
                            {crane.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleCraneSelect(crane)
                            }}
                          >
                            Seç
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Adım 3: Konfigürasyon Seçimi */}
        {step === 3 && (
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3>3. Konfigürasyon Seçin</h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '5px 10px', fontSize: '12px' }}
                onClick={() => {
                  setSelectedCrane(null)
                  setStep(2)
                }}
              >
                ← Geri
              </button>
            </div>
            <p style={{ color: '#666', marginBottom: '15px' }}>
              Seçilen Vinç: <strong>{selectedCrane?.name}</strong> ({selectedCrane?.model})
            </p>
            
            {loading && templates.length === 0 ? (
              <div className="loading">Yükleniyor...</div>
            ) : templates.length === 0 ? (
              <div className="empty-state">Bu vinç için konfigürasyon bulunamadı</div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Konfigürasyon Adı</th>
                      <th>Açıklama</th>
                      <th>İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map((template) => (
                      <tr 
                        key={template.id}
                        style={{ 
                          backgroundColor: selectedTemplate?.id === template.id ? 'rgba(231, 156, 0, 0.15)' : 'transparent',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <td><strong>{template.config_name}</strong></td>
                        <td>{template.description || '-'}</td>
                        <td>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleTemplateSelect(template)
                            }}
                          >
                            Uygunluk Kontrolü
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Uygunluk Kontrolü Sonuçları */}
        {availability && selectedTemplate && (
          <div className="card">
            <div style={{ marginBottom: '12px' }}>
              <h3>Ekipman Uygunluk ve Planlama</h3>
              <p style={{ color: '#666', fontSize: '14px', marginTop: '6px' }}>
                <strong>Şablon:</strong> {availability.template_name || selectedTemplate.config_name} | <strong>Vinç:</strong> {selectedCrane?.name} ({selectedCrane?.model})
              </p>
            </div>
            <div className="tab-group compact">
              <button
                className={`tab-button ${availabilityTab === 'results' ? 'active' : ''}`}
                onClick={() => setAvailabilityTab('results')}
              >
                Uygunluk Özeti
              </button>
              <button
                className={`tab-button ${availabilityTab === 'planning' ? 'active' : ''}`}
                onClick={() => setAvailabilityTab('planning')}
                disabled={!availability.items?.length}
              >
                Planlama
              </button>
            </div>

            {availabilityTab === 'results' && (
              <>
                <div style={{ marginTop: '10px' }}>
                  {availability.items?.map((item: any, index: number) => (
                    <div key={index} style={{ 
                      marginBottom: '15px', 
                      padding: '10px', 
                      border: `1px solid ${item.is_available ? '#d4edda' : '#f8d7da'}`,
                      borderRadius: '4px',
                      backgroundColor: item.is_available ? '#f8fff9' : '#fff8f8'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong>{item.equipment_type_name}</strong>
                        {item.is_available ? (
                          <span className="badge badge-success">✓ Mevcut</span>
                        ) : (
                          <span className="badge badge-danger">✗ Eksik ({item.missing_quantity})</span>
                        )}
                      </div>
                      <div style={{ marginTop: '5px', fontSize: '14px', color: '#666' }}>
                        Gerekli: {item.quantity_required} | Mevcut: {item.quantity_available}
                      </div>
                      {item.available_items && item.available_items.length > 0 && (
                        <div style={{ marginTop: '10px', fontSize: '12px' }}>
                          <strong>Mevcut Ekipmanlar:</strong>
                          <ul style={{ marginTop: '5px', paddingLeft: '20px' }}>
                            {item.available_items.map((eq: any) => (
                              <li key={eq.id}>
                                {eq.serial_no || `ID: ${eq.id}`} - {eq.location_name || 'Konum belirtilmemiş'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: '20px', padding: '10px', backgroundColor: availability.all_available ? '#d4edda' : '#fff3cd', borderRadius: '4px' }}>
                  <strong>
                    {availability.all_available 
                      ? '✓ Tüm ekipmanlar mevcut!' 
                      : '⚠ Bazı ekipmanlar eksik!'}
                  </strong>
                </div>
              </>
            )}

            {availabilityTab === 'planning' && (
              <div style={{ marginTop: '10px' }}>
                <p style={{ color: '#666', fontSize: '14px' }}>
                  Uygun olan ekipmanları seçip planlamaya ekleyebilirsiniz.
                </p>
                {availability.items?.map((item: any, index: number) => {
                  const typeKey = String(item.equipment_type_id ?? item.equipment_type_name ?? index)
                  return (
                    <div key={typeKey} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <strong>{item.equipment_type_name}</strong>
                          <div style={{ fontSize: '12px', color: '#666' }}>
                            Gerekli: {item.quantity_required} | Mevcut: {item.quantity_available}
                          </div>
                        </div>
                        <span className={`badge ${item.is_available ? 'badge-success' : 'badge-warning'}`}>
                          {item.is_available ? 'Mevcut' : 'Kısmen Mevcut'}
                        </span>
                      </div>
                      {item.available_items && item.available_items.length > 0 ? (
                        <div className="planning-options">
                          {item.available_items.map((eq: any) => {
                            const isSelected = !!planningSelection[typeKey]?.some((sel) => sel.id === eq.id)
                            return (
                              <label
                                key={eq.id}
                                className={`planning-chip ${isSelected ? 'selected' : ''}`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => togglePlanningSelection(typeKey, eq, item.equipment_type_name)}
                                />
                                <span>{eq.serial_no || `ID: ${eq.id}`}</span>
                                <small style={{ color: '#666' }}>
                                  {eq.location_name || 'Konum belirtilmemiş'}
                                </small>
                              </label>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="empty-state" style={{ padding: '10px', marginTop: '10px' }}>
                          Bu ekipman tipi için uygun stok yok
                        </div>
                      )}
                    </div>
                  )
                })}

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                  <button
                    className="btn btn-primary"
                    disabled={!selectedPlanningCount}
                    onClick={addPlanningItems}
                  >
                    {selectedPlanningCount > 0
                      ? `${selectedPlanningCount} ekipmanı planlamaya ekle`
                      : 'Ekipman seçiniz'}
                  </button>
                  {selectedPlanningCount > 0 && (
                    <span style={{ color: '#666', fontSize: '13px' }}>
                      {selectedPlanningCount} ekipman seçildi
                    </span>
                  )}
                </div>

                <div>
                  <h4>Planlanan Ekipmanlar</h4>
                  {planningItems.length === 0 ? (
                    <div className="empty-state" style={{ padding: '20px' }}>
                      Planlamaya eklenen ekipman bulunmuyor
                    </div>
                  ) : (
                    <div className="table-wrapper" style={{ marginTop: '12px' }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Ekipman Tipi</th>
                            <th>Seri / ID</th>
                            <th>Konum</th>
                            <th>İşlem</th>
                          </tr>
                        </thead>
                        <tbody>
                          {planningItems.map((item) => (
                            <tr key={item.id}>
                              <td>{item.equipment_type_name || '-'}</td>
                              <td>{item.serial_no || `ID: ${item.id}`}</td>
                              <td>{item.location_name || 'Konum belirtilmemiş'}</td>
                              <td>
                                <button
                                  className="btn btn-link"
                                  onClick={() => removePlanningItem(item.id)}
                                >
                                  Kaldır
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {planningItems.length > 0 && (
                  <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={handleExportPlanningPdf}>
                      Planlamayı PDF Olarak İndir
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {(selectedType || selectedCrane || selectedTemplate) && (
        <div className="summary-panel" style={{ marginBottom: '20px' }}>
          <div className="summary-item">
            <span className="summary-label">Vinç Tipi</span>
            <span className="summary-value">{selectedTypeLabel}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Seçilen Vinç</span>
            <span className="summary-value">{selectedCrane ? `${selectedCrane.name} (${selectedCrane.model || '-'})` : 'Henüz seçilmedi'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Konfigürasyon</span>
            <span className="summary-value">{selectedTemplate ? selectedTemplate.config_name : 'Henüz seçilmedi'}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Uygunluk Durumu</span>
            <span className="summary-value">
              {availability
                ? availability.all_available
                  ? 'Tüm ekipmanlar mevcut'
                  : 'Eksik ekipman var'
                : 'Kontrol edilmedi'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Planlanan Ekipman</span>
            <span className="summary-value">{planningItems.length}</span>
          </div>
        </div>
      )}
    </div>
  )
}
