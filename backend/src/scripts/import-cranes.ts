import fs from 'fs'
import path from 'path'
import readline from 'readline'
import pool from '../config/database'

interface CsvCraneRow {
  plate: string
  tonnage?: number
  machineCategory?: string
  brandModel?: string
  serialNo?: string
  modelYear?: number
  location?: string
  km?: string
  engineHours?: string
}

function normalizeType(value: string) {
  const upper = value.toUpperCase()
  if (upper.includes('KAFES') || upper.includes('PALET')) return 'PALETLI'
  if (upper.includes('SEPET')) return 'SEPET'
  return 'MOBILE'
}

function toNumber(value?: string) {
  if (!value) return undefined
  const cleaned = value.replace(/\./g, '').replace(',', '.')
  const parsed = parseFloat(cleaned)
  return Number.isFinite(parsed) ? parsed : undefined
}

function deriveStatus(location?: string) {
  if (!location) return 'ACTIVE'
  const upper = location.toUpperCase()
  if (upper.includes('SATILDI')) return 'RETIRED'
  if (upper.includes('ARIZALI') || upper.includes('HASAR')) return 'MAINTENANCE'
  return 'ACTIVE'
}

async function importCsv(csvPath: string) {
  const absolutePath = path.resolve(csvPath)
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`CSV file not found at ${absolutePath}`)
  }

  const rl = readline.createInterface({
    input: fs.createReadStream(absolutePath, { encoding: 'utf8' }),
    crlfDelay: Infinity,
  })

  const rows: CsvCraneRow[] = []
  let lineIndex = 0
  for await (const line of rl) {
    lineIndex++
    if (lineIndex <= 2) continue
    if (!line || line.startsWith(';')) continue
    const columns = line.split(';')
    if (!columns[0]?.trim()) continue

    rows.push({
      plate: columns[0].trim(),
      tonnage: toNumber(columns[1]),
      machineCategory: columns[2]?.trim() || undefined,
      brandModel: columns[3]?.trim() || undefined,
      serialNo: columns[4]?.trim() || undefined,
      modelYear: columns[5] ? parseInt(columns[5], 10) : undefined,
      location: columns[6]?.trim() || undefined,
      km: columns[7]?.trim() || undefined,
      engineHours: columns[8]?.trim() || undefined,
    })
  }

  console.log(`Parsed ${rows.length} crane rows. Importing...`)

  for (const [index, row] of rows.entries()) {
    const plate = row.plate && row.plate !== '-' ? row.plate : `PLATELESS-${row.serialNo || index}`
    const brandModel = row.brandModel?.trim() || ''
    const displayName = brandModel
      ? row.serialNo
        ? `${brandModel} [${row.serialNo}]`
        : brandModel
      : plate
    const modelValue = brandModel || row.machineCategory || 'Bilinmiyor'
    const type = normalizeType(row.machineCategory || '')
    const status = deriveStatus(row.location)

    await pool.query(
      `INSERT INTO cranes (
        name, model, type, serial_no, status,
        plate_no, tonnage, machine_category, brand_model, model_year,
        km_reading, engine_hours, current_location_text, notes
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13, $14
      )
      ON CONFLICT (plate_no) DO UPDATE SET
        model = EXCLUDED.model,
        type = EXCLUDED.type,
        serial_no = EXCLUDED.serial_no,
        status = EXCLUDED.status,
        tonnage = EXCLUDED.tonnage,
        machine_category = EXCLUDED.machine_category,
        brand_model = EXCLUDED.brand_model,
        model_year = EXCLUDED.model_year,
        km_reading = EXCLUDED.km_reading,
        engine_hours = EXCLUDED.engine_hours,
        current_location_text = EXCLUDED.current_location_text,
        notes = EXCLUDED.notes`,
      [
        displayName,
        modelValue,
        type,
        row.serialNo || null,
        status,
        plate,
        row.tonnage || null,
        row.machineCategory || null,
        brandModel || null,
        row.modelYear || null,
        row.km || null,
        row.engineHours || null,
        row.location || null,
        null,
      ]
    )
  }

  console.log('Import completed.')
  await pool.end()
}

const csvArgument =
  process.argv[2] ||
  path.resolve(process.cwd(), 'Vinç Envanteri.csv')
importCsv(csvArgument).catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})

