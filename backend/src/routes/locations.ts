import express, { Request, Response } from 'express';
import pool from '../config/database';

const router = express.Router();

// GET /api/v1/locations - Konum listesi
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM locations WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (type) {
      query += ` AND type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/locations/:id - Konum detayı
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM locations WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/locations - Yeni konum
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, type, address, city, notes } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const result = await pool.query(
      'INSERT INTO locations (name, type, address, city, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, type, address || null, city || null, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating location:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/locations/:id - Konum güncelle
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, type, address, city, notes } = req.body;

    const result = await pool.query(
      'UPDATE locations SET name = $1, type = $2, address = $3, city = $4, notes = $5 WHERE id = $6 RETURNING *',
      [name, type, address || null, city || null, notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating location:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/locations/:id - Konum sil
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM locations WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Location not found' });
    }

    res.json({ message: 'Location deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting location:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/locations/:id/resources - Konumdaki kaynaklar
router.get('/:id/resources', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const cranes = await pool.query('SELECT * FROM cranes WHERE current_location_id = $1', [id]);
    const trucks = await pool.query('SELECT * FROM trucks WHERE current_location_id = $1', [id]);
    const equipment = await pool.query('SELECT * FROM equipment_items WHERE current_location_id = $1', [id]);

    res.json({
      cranes: cranes.rows,
      trucks: trucks.rows,
      equipment: equipment.rows
    });
  } catch (error: any) {
    console.error('Error fetching location resources:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

