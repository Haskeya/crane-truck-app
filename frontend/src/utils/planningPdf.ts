import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type { TDocumentDefinitions } from 'pdfmake/interfaces'

const pdfFontsTyped = pdfFonts as any
;(pdfMake as any).vfs = pdfFontsTyped.pdfMake?.vfs || pdfFontsTyped.vfs

interface PlanningItem {
  id: number
  equipment_type_name?: string
  serial_no?: string | null
  location_name?: string | null
}

interface PlanningExportPayload {
  crane?: {
    name?: string
    model?: string
    plate_no?: string
    type?: string
  } | null
  template?: {
    config_name?: string
    description?: string
  } | null
  craneTypeLabel?: string
  planningItems: PlanningItem[]
}

const formatValue = (value?: string | null) => (value && value.length ? value : '-')

export function exportPlanningPdf({
  crane,
  template,
  planningItems,
  craneTypeLabel
}: PlanningExportPayload) {
  if (!planningItems.length) {
    return
  }

  const generatedAt = new Date()
  const planningBody = [
    [
      { text: 'Ekipman Tipi', style: 'tableHeader' },
      { text: 'Seri / ID', style: 'tableHeader' },
      { text: 'Mevcut Konum', style: 'tableHeader' }
    ],
    ...planningItems.map((item) => ([
      formatValue(item.equipment_type_name),
      formatValue(item.serial_no) || `ID: ${item.id}`,
      formatValue(item.location_name)
    ]))
  ]

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [40, 60, 40, 40],
    content: [
      {
        text: 'Makine Konfigürasyon Planı',
        style: 'header',
        alignment: 'center'
      },
      {
        columns: [
          [
            { text: 'Vinç Bilgileri', style: 'subheader' },
            {
              table: {
                widths: ['30%', '70%'],
                body: [
                  ['Vinç Adı', formatValue(crane?.name)],
                  ['Vinç Tipi', formatValue(craneTypeLabel || crane?.type)],
                  ['Model', formatValue(crane?.model)],
                  ['Plaka', formatValue(crane?.plate_no)]
                ]
              },
              layout: 'lightHorizontalLines',
              margin: [0, 8, 0, 0]
            }
          ],
          [
            { text: 'Konfigürasyon', style: 'subheader' },
            {
              table: {
                widths: ['35%', '65%'],
                body: [
                  ['Adı', formatValue(template?.config_name)],
                  ['Açıklama', formatValue(template?.description)],
                  ['Planlanan Ekipman', planningItems.length.toString()],
                  ['Oluşturma Tarihi', generatedAt.toLocaleString('tr-TR')]
                ]
              },
              layout: 'lightHorizontalLines',
              margin: [0, 8, 0, 0]
            }
          ]
        ],
        columnGap: 20,
        margin: [0, 20, 0, 10]
      },
      {
        text: 'Planlanan Ekipman Listesi',
        style: 'subheader',
        margin: [0, 10, 0, 6]
      },
      {
        table: {
          widths: ['35%', '30%', '35%'],
          body: planningBody
        },
        layout: 'lightHorizontalLines'
      }
    ],
    styles: {
      header: {
        fontSize: 20,
        bold: true,
        color: '#e79c00',
        margin: [0, 0, 0, 10]
      },
      subheader: {
        fontSize: 14,
        bold: true,
        color: '#111827'
      },
      tableHeader: {
        bold: true,
        fontSize: 12,
        color: '#ffffff',
        fillColor: '#b77100'
      }
    }
  }

  const fileName = `konfigurasyon-plani-${Date.now()}.pdf`
  pdfMake.createPdf(docDefinition).download(fileName)
}


