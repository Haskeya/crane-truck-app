import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type { TDocumentDefinitions } from 'pdfmake/interfaces'

const pdfFontsTyped = pdfFonts as any
;(pdfMake as any).vfs = pdfFontsTyped.pdfMake?.vfs || pdfFontsTyped.vfs

interface ProjectSummaryExportPayload {
  project: {
    name?: string
    customer_name?: string
    location_name?: string
    project_engineer_name?: string
    project_site_manager_name?: string
    start_date?: string
    end_date?: string
    actual_start_date?: string
    actual_end_date?: string
    status?: string
    notes?: string
  }
  assignments?: Array<{
    resource_type?: string
    resource_name?: string
    assigned_at?: string
    notes?: string
  }>
  assignmentHistory?: Array<{
    resource_name?: string
    resource_type?: string
    action?: string
    date?: string
    description?: string
    eventType?: 'ASSIGN' | 'UNASSIGN'
  }>
}

const formatValue = (value?: string | null) => (value && value.length ? value : '-')
const formatDate = (date?: string | null) => {
  if (!date) return '-'
  try {
    return new Date(date).toLocaleDateString('tr-TR')
  } catch {
    return date
  }
}

const getStatusLabel = (status?: string) => {
  const labels: Record<string, string> = {
    PLANNED: 'Planlı',
    ACTIVE: 'Aktif',
    COMPLETED: 'Tamamlandı',
    CANCELLED: 'İptal'
  }
  return labels[status || ''] || status || '-'
}

const getResourceTypeLabel = (type?: string) => {
  const labels: Record<string, string> = {
    CRANE: 'Vinç',
    TRUCK: 'Çekici/Dorse',
    EQUIPMENT: 'Ekipman',
    PERSON: 'Personel'
  }
  return labels[type || ''] || type || '-'
}

export function exportProjectSummaryPdf({
  project,
  assignments = [],
  assignmentHistory = []
}: ProjectSummaryExportPayload) {
  const generatedAt = new Date()

  // Atamaları türlerine göre grupla
  const groupedAssignments = {
    CRANE: assignments.filter((a) => a.resource_type === 'CRANE'),
    TRUCK: assignments.filter((a) => a.resource_type === 'TRUCK'),
    EQUIPMENT: assignments.filter((a) => a.resource_type === 'EQUIPMENT'),
    PERSON: assignments.filter((a) => a.resource_type === 'PERSON')
  }

  // Atama tablosu oluştur
  const assignmentRows: any[] = []
  Object.entries(groupedAssignments).forEach(([type, items]) => {
    if (items.length > 0) {
      items.forEach((item) => {
        assignmentRows.push([
          getResourceTypeLabel(type),
          formatValue(item.resource_name),
          formatDate(item.assigned_at),
          formatValue(item.notes)
        ])
      })
    }
  })

  // Hareket geçmişi tablosu oluştur
  const historyRows: any[] = []
  assignmentHistory.forEach((event) => {
    historyRows.push([
      formatValue(event.resource_name),
      getResourceTypeLabel(event.resource_type),
      formatValue(event.action),
      formatDate(event.date),
      formatValue(event.description)
    ])
  })

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 40],
    content: [
      {
        text: 'Proje Özet Raporu',
        style: 'header',
        alignment: 'center'
      },
      {
        text: project.name || 'Proje Adı Belirtilmemiş',
        style: 'projectTitle',
        alignment: 'center',
        margin: [0, 5, 0, 20]
      },
      {
        columns: [
          [
            {
              text: 'Genel Bilgiler',
              style: 'subheader',
              margin: [0, 0, 0, 8]
            },
            {
              table: {
                widths: ['40%', '60%'],
                body: [
                  ['Proje Adı', formatValue(project.name)],
                  ['Müşteri', formatValue(project.customer_name)],
                  ['Konum', formatValue(project.location_name)],
                  ['Proje Mühendisi', formatValue(project.project_engineer_name)],
                  ['Proje Saha Sorumlusu', formatValue(project.project_site_manager_name)],
                  ['Durum', getStatusLabel(project.status)]
                ]
              },
              layout: 'lightHorizontalLines',
              margin: [0, 0, 0, 15]
            }
          ],
          [
            {
              text: 'Tarih Bilgileri',
              style: 'subheader',
              margin: [0, 0, 0, 8]
            },
            {
              table: {
                widths: ['40%', '60%'],
                body: [
                  ['Planlanan Başlangıç', formatDate(project.start_date)],
                  ['Planlanan Bitiş', formatDate(project.end_date)],
                  ['Gerçek Başlangıç', formatDate(project.actual_start_date)],
                  ['Gerçek Bitiş', formatDate(project.actual_end_date)],
                  ['Rapor Tarihi', generatedAt.toLocaleDateString('tr-TR')]
                ]
              },
              layout: 'lightHorizontalLines',
              margin: [0, 0, 0, 15]
            }
          ]
        ],
        columnGap: 20,
        margin: [0, 0, 0, 20]
      },
      {
        text: 'Proje Atamaları',
        style: 'subheader',
        margin: [0, 10, 0, 8]
      },
      assignmentRows.length > 0
        ? {
            table: {
              widths: ['20%', '30%', '20%', '30%'],
              headerRows: 1,
              body: [
                [
                  { text: 'Tür', style: 'tableHeader' },
                  { text: 'Kaynak', style: 'tableHeader' },
                  { text: 'Atama Tarihi', style: 'tableHeader' },
                  { text: 'Notlar', style: 'tableHeader' }
                ],
                ...assignmentRows
              ]
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 20]
          }
        : {
            text: 'Bu projeye henüz kaynak atanmamış.',
            italics: true,
            color: '#666',
            margin: [0, 0, 0, 20]
          },
      {
        text: 'Proje Hareketleri',
        style: 'subheader',
        margin: [0, 10, 0, 8]
      },
      historyRows.length > 0
        ? {
            table: {
              widths: ['20%', '15%', '15%', '20%', '30%'],
              headerRows: 1,
              body: [
                [
                  { text: 'Kaynak', style: 'tableHeader' },
                  { text: 'Tür', style: 'tableHeader' },
                  { text: 'İşlem', style: 'tableHeader' },
                  { text: 'Tarih', style: 'tableHeader' },
                  { text: 'Açıklama', style: 'tableHeader' }
                ],
                ...historyRows
              ]
            },
            layout: 'lightHorizontalLines',
            margin: [0, 0, 0, 20]
          }
        : {
            text: 'Henüz hareket kaydı bulunmuyor.',
            italics: true,
            color: '#666',
            margin: [0, 0, 0, 20]
          },
      project.notes
        ? [
            {
              text: 'Notlar',
              style: 'subheader',
              margin: [0, 10, 0, 8]
            },
            {
              text: formatValue(project.notes),
              style: 'notes',
              margin: [0, 0, 0, 20]
            }
          ]
        : []
    ],
    styles: {
      header: {
        fontSize: 22,
        bold: true,
        color: '#1c57e0',
        margin: [0, 0, 0, 5]
      },
      projectTitle: {
        fontSize: 18,
        bold: true,
        color: '#3d4353'
      },
      subheader: {
        fontSize: 14,
        bold: true,
        color: '#1f2330',
        margin: [0, 5, 0, 5]
      },
      tableHeader: {
        bold: true,
        fontSize: 11,
        color: '#ffffff',
        fillColor: '#5f8cff'
      },
      notes: {
        fontSize: 11,
        color: '#3d4353',
        lineHeight: 1.5
      }
    },
    defaultStyle: {
      fontSize: 10,
      color: '#1f2330'
    }
  }

  const fileName = `proje-ozet-${project.name?.replace(/[^a-zA-Z0-9]/g, '-') || 'rapor'}-${Date.now()}.pdf`
  pdfMake.createPdf(docDefinition).download(fileName)
}

