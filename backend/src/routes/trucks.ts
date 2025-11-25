import express, { Request, Response } from 'express';
import pool from '../config/database';

const router = express.Router();

// GET /api/v1/trucks - Kamyon listesi
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, status, location_id, search } = req.query;
    let query = `
      SELECT t.*, l.name as location_name
      FROM trucks t
      LEFT JOIN locations l ON t.current_location_id = l.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (type) {
      query += ` AND t.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (status) {
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (location_id) {
      query += ` AND t.current_location_id = $${paramCount}`;
      params.push(location_id);
      paramCount++;
    }

    if (search) {
      query += ` AND (t.plate_no ILIKE $${paramCount} OR t.model ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY t.plate_no';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching trucks:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/trucks/:id - Kamyon detayı
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const truckResult = await pool.query(
      `SELECT t.*, l.name as location_name, l.type as location_type
       FROM trucks t
       LEFT JOIN locations l ON t.current_location_id = l.id
       WHERE t.id = $1`,
      [id]
    );

    if (truckResult.rows.length === 0) {
      return res.status(404).json({ error: 'Truck not found' });
    }

    const truck = truckResult.rows[0];

    // Kamyondaki ekipmanlar
    const equipmentResult = await pool.query(
      `SELECT ei.*, et.name as equipment_type_name, et.category
       FROM equipment_items ei
       JOIN equipment_types et ON ei.equipment_type_id = et.id
       WHERE ei.on_truck_id = $1`,
      [id]
    );

    truck.equipment = equipmentResult.rows;

    res.json(truck);
  } catch (error: any) {
    console.error('Error fetching truck:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/trucks - Yeni kamyon
router.post('/', async (req: Request, res: Response) => {
  try {
    const { plate_no, type, model, status, current_location_id, notes } = req.body;

    if (!plate_no || !type) {
      return res.status(400).json({ error: 'Plate number and type are required' });
    }

    const result = await pool.query(
      `INSERT INTO trucks (plate_no, type, model, status, current_location_id, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [plate_no, type, model || null, status || 'ACTIVE', current_location_id || null, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Truck with this plate number already exists' });
    }
    console.error('Error creating truck:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/trucks/:id - Kamyon güncelle
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { plate_no, type, model, status, current_location_id, notes } = req.body;

    const result = await pool.query(
      `UPDATE trucks 
       SET plate_no = $1, type = $2, model = $3, status = $4, current_location_id = $5, notes = $6
       WHERE id = $7 RETURNING *`,
      [plate_no, type, model || null, status, current_location_id || null, notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Truck not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating truck:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/trucks/:id - Kamyon sil
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM trucks WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Truck not found' });
    }

    res.json({ message: 'Truck deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting truck:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

