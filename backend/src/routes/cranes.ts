import express, { Request, Response } from 'express';
import pool from '../config/database';

const router = express.Router();

// GET /api/v1/cranes - Vinç listesi
const CRANE_TYPES = ['MOBILE', 'PALETLI', 'SEPET', 'HIUP'];

router.get('/', async (req: Request, res: Response) => {
  try {
    const { model, status, location_id, search, type } = req.query;
    let query = `
      SELECT c.*, l.name as location_name
      FROM cranes c
      LEFT JOIN locations l ON c.current_location_id = l.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (model) {
      query += ` AND c.model = $${paramCount}`;
      params.push(model);
      paramCount++;
    }

    if (status) {
      query += ` AND c.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (type) {
      query += ` AND c.type = $${paramCount}`;
      params.push((type as string).toUpperCase());
      paramCount++;
    }

    if (location_id) {
      query += ` AND c.current_location_id = $${paramCount}`;
      params.push(location_id);
      paramCount++;
    }

    if (search) {
      query += ` AND (
        c.name ILIKE $${paramCount}
        OR c.model ILIKE $${paramCount}
        OR c.serial_no ILIKE $${paramCount}
        OR c.plate_no ILIKE $${paramCount}
      )`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY c.name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching cranes:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/cranes/:id - Vinç detayı
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const craneResult = await pool.query(
      `SELECT c.*, l.name as location_name, l.type as location_type
       FROM cranes c
       LEFT JOIN locations l ON c.current_location_id = l.id
       WHERE c.id = $1`,
      [id]
    );

    if (craneResult.rows.length === 0) {
      return res.status(404).json({ error: 'Crane not found' });
    }

    const crane = craneResult.rows[0];

    // Hareket geçmişi
    const movementsResult = await pool.query(
      `SELECT ml.*, 
              fl.name as from_location_name,
              tl.name as to_location_name,
              p.name as moved_by_name
       FROM movement_logs ml
       LEFT JOIN locations fl ON ml.from_location_id = fl.id
       LEFT JOIN locations tl ON ml.to_location_id = tl.id
       LEFT JOIN persons p ON ml.moved_by = p.id
       WHERE ml.resource_type = 'CRANE' AND ml.resource_id = $1
       ORDER BY ml.moved_at DESC
       LIMIT 20`,
      [id]
    );

    crane.movements = movementsResult.rows;

    const inventoryResult = await pool.query(
      `SELECT ei.id,
              ei.serial_no,
              ei.status,
              ei.notes,
              et.name AS equipment_type_name,
              et.category AS equipment_type_category,
              et.unit AS equipment_unit,
              l.name AS location_name,
              t.plate_no AS truck_plate_no
       FROM equipment_items ei
       JOIN equipment_types et ON ei.equipment_type_id = et.id
       LEFT JOIN locations l ON ei.current_location_id = l.id
       LEFT JOIN trucks t ON ei.on_truck_id = t.id
       WHERE ei.owner_crane_id = $1
       ORDER BY et.category, et.name, ei.serial_no`,
      [id]
    );

    crane.inventory = inventoryResult.rows;

    res.json(crane);
  } catch (error: any) {
    console.error('Error fetching crane:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/cranes - Yeni vinç
router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      name,
      model,
      type,
      serial_no,
      status,
      current_location_id,
      notes,
      plate_no,
      tonnage,
      machine_category,
      brand_model,
      model_year,
      km_reading,
      engine_hours,
      current_location_text,
    } = req.body;

    if (!name || !model || !type) {
      return res.status(400).json({ error: 'Name, model and type are required' });
    }

    const normalizedType = (type as string).toUpperCase();
    if (!CRANE_TYPES.includes(normalizedType)) {
      return res.status(400).json({ error: 'Invalid crane type' });
    }

    const result = await pool.query(
      `INSERT INTO cranes (
        name, model, type, serial_no, status, current_location_id, notes,
        plate_no, tonnage, machine_category, brand_model, model_year,
        km_reading, engine_hours, current_location_text
       ) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING *`,
      [
        name,
        model,
        normalizedType,
        serial_no || null,
        status || 'ACTIVE',
        current_location_id || null,
        notes || null,
        plate_no || null,
        tonnage || null,
        machine_category || null,
        brand_model || null,
        model_year || null,
        km_reading || null,
        engine_hours || null,
        current_location_text || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Crane with this name or plate already exists' });
    }
    console.error('Error creating crane:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/cranes/:id - Vinç güncelle
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      model,
      type,
      serial_no,
      status,
      current_location_id,
      notes,
      plate_no,
      tonnage,
      machine_category,
      brand_model,
      model_year,
      km_reading,
      engine_hours,
      current_location_text,
    } = req.body;

    if (!CRANE_TYPES.includes((type as string).toUpperCase())) {
      return res.status(400).json({ error: 'Invalid crane type' });
    }

    const result = await pool.query(
      `UPDATE cranes 
       SET name = $1,
           model = $2,
           type = $3,
           serial_no = $4,
           status = $5,
           current_location_id = $6,
           notes = $7,
           plate_no = $8,
           tonnage = $9,
           machine_category = $10,
           brand_model = $11,
           model_year = $12,
           km_reading = $13,
           engine_hours = $14,
           current_location_text = $15
       WHERE id = $16 RETURNING *`,
      [
        name,
        model,
        (type as string).toUpperCase(),
        serial_no || null,
        status,
        current_location_id || null,
        notes || null,
        plate_no || null,
        tonnage || null,
        machine_category || null,
        brand_model || null,
        model_year || null,
        km_reading || null,
        engine_hours || null,
        current_location_text || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crane not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating crane:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/cranes/:id - Vinç sil
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM cranes WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Crane not found' });
    }

    res.json({ message: 'Crane deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting crane:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/cranes/:id/move - Vinç konum değiştir
router.post('/:id/move', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { to_location_id, moved_by, notes } = req.body;

    if (!to_location_id) {
      return res.status(400).json({ error: 'to_location_id is required' });
    }

    // Mevcut konumu al
    const craneResult = await pool.query('SELECT current_location_id FROM cranes WHERE id = $1', [id]);
    if (craneResult.rows.length === 0) {
      return res.status(404).json({ error: 'Crane not found' });
    }

    const from_location_id = craneResult.rows[0].current_location_id;

    // Transaction başlat
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Hareket kaydı oluştur
      await client.query(
        `INSERT INTO movement_logs (resource_type, resource_id, from_location_id, to_location_id, moved_by, notes)
         VALUES ('CRANE', $1, $2, $3, $4, $5)`,
        [id, from_location_id, to_location_id, moved_by || null, notes || null]
      );

      // Vinç konumunu güncelle
      await client.query(
        'UPDATE cranes SET current_location_id = $1 WHERE id = $2',
        [to_location_id, id]
      );

      await client.query('COMMIT');

      const updatedCrane = await pool.query('SELECT * FROM cranes WHERE id = $1', [id]);
      res.json(updatedCrane.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error moving crane:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

