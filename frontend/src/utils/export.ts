// Excel export utility

export function exportToExcel(data: any[], filename: string, headers: string[]) {
  // CSV formatında export (basit Excel uyumlu)
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header.toLowerCase().replace(/\s+/g, '_')] || row[header] || ''
        // CSV için özel karakterleri escape et
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }).join(',')
    )
  ].join('\n')

  // BOM ekle (UTF-8 için)
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', `${filename}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportProjectsToExcel(projects: any[]) {
  const headers = ['ID', 'Proje Adı', 'Müşteri', 'Konum', 'Başlangıç Tarihi', 'Bitiş Tarihi', 'Durum']
  const data = projects.map(p => ({
    id: p.id,
    proje_adi: p.name,
    musteri: p.customer_name || '',
    konum: p.location_name || '',
    baslangic_tarihi: p.start_date || '',
    bitis_tarihi: p.end_date || '',
    durum: p.status
  }))
  exportToExcel(data, 'projeler', headers)
}

export function exportMovementsToExcel(movements: any[]) {
  const headers = ['ID', 'Tarih', 'Kaynak Tipi', 'Kaynak ID', 'Nereden', 'Nereye', 'Yapan Kişi', 'Notlar']
  const data = movements.map(m => ({
    id: m.id,
    tarih: new Date(m.moved_at).toLocaleString('tr-TR'),
    kaynak_tipi: m.resource_type,
    kaynak_id: m.resource_id,
    nereden: m.from_location_name || '',
    nereye: m.to_location_name,
    yapan_kisi: m.moved_by_name || '',
    notlar: m.notes || ''
  }))
  exportToExcel(data, 'hareketler', headers)
}

export function exportCranesToExcel(cranes: any[]) {
  const headers = ['ID', 'Vinç Adı', 'Model', 'Vinç Tipi', 'Seri No', 'Durum', 'Mevcut Konum']
  const data = cranes.map(c => ({
    id: c.id,
    vinc_adi: c.name,
    model: c.model,
    vinc_tipi: c.type || '',
    seri_no: c.serial_no || '',
    durum: c.status,
    mevcut_konum: c.location_name || ''
  }))
  exportToExcel(data, 'vincler', headers)
}


