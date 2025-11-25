import express, { Request, Response } from 'express';
import pool from '../config/database';

const router = express.Router();

// GET /api/v1/equipment/types - Ekipman tipleri
router.get('/types', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM equipment_types ORDER BY category, name');
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching equipment types:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/equipment/items - Ekipman parçaları
router.get('/items', async (req: Request, res: Response) => {
  try {
    const { status, owner_crane_id } = req.query;
    let query = `
      SELECT ei.*, 
             et.name as equipment_type_name,
             et.category as equipment_type_category,
             l.name as location_name,
             t.plate_no as truck_plate_no,
             c.name as owner_crane_name
      FROM equipment_items ei
      JOIN equipment_types et ON ei.equipment_type_id = et.id
      LEFT JOIN locations l ON ei.current_location_id = l.id
      LEFT JOIN trucks t ON ei.on_truck_id = t.id
      LEFT JOIN cranes c ON ei.owner_crane_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      query += ` AND ei.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (owner_crane_id) {
      query += ` AND ei.owner_crane_id = $${paramCount}`;
      params.push(owner_crane_id);
      paramCount++;
    }

    query += ' ORDER BY et.category, et.name, ei.serial_no';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching equipment items:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/equipment/items - Yeni ekipman
router.post('/items', async (req: Request, res: Response) => {
  try {
    const { equipment_type_id, serial_no, status, current_location_id, on_truck_id, owner_crane_id, notes } = req.body;

    if (!equipment_type_id) {
      return res.status(400).json({ error: 'equipment_type_id is required' });
    }

    const assignmentFlags = [
      current_location_id ? 1 : 0,
      on_truck_id ? 1 : 0
    ].reduce((acc, val) => acc + val, 0);

    if (assignmentFlags > 1) {
      return res.status(400).json({ error: 'Only one of current_location_id or on_truck_id should be provided' });
    }

    const result = await pool.query(
      `INSERT INTO equipment_items (equipment_type_id, serial_no, status, current_location_id, on_truck_id, owner_crane_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        equipment_type_id,
        serial_no || null,
        status || 'AVAILABLE',
        current_location_id || null,
        on_truck_id || null,
        owner_crane_id || null,
        notes || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating equipment item:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/equipment/items/:id/location - Ekipman konumu güncelle
router.put('/items/:id/location', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { current_location_id, on_truck_id } = req.body;

    const assignmentFlags = [
      current_location_id ? 1 : 0,
      on_truck_id ? 1 : 0
    ].reduce((acc, val) => acc + val, 0);

    if (assignmentFlags > 1) {
      return res.status(400).json({ error: 'Only one of current_location_id or on_truck_id should be provided' });
    }

    const result = await pool.query(
      `UPDATE equipment_items
       SET current_location_id = $1,
           on_truck_id = $2
       WHERE id = $3
       RETURNING *`,
      [
        current_location_id || null,
        on_truck_id || null,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment item not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating equipment location:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;


