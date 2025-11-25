import express, { Request, Response } from 'express';
import pool from '../config/database';

const router = express.Router();

// GET /api/v1/movements - Hareket kayıtları listesi
router.get('/', async (req: Request, res: Response) => {
  try {
    const { resource_type, date_from, date_to } = req.query;
    let query = `
      SELECT ml.*, 
             fl.name as from_location_name,
             tl.name as to_location_name,
             p.name as moved_by_name
      FROM movement_logs ml
      LEFT JOIN locations fl ON ml.from_location_id = fl.id
      LEFT JOIN locations tl ON ml.to_location_id = tl.id
      LEFT JOIN persons p ON ml.moved_by = p.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (resource_type) {
      query += ` AND ml.resource_type = $${paramCount}`;
      params.push(resource_type);
      paramCount++;
    }

    if (date_from) {
      query += ` AND DATE(ml.moved_at) >= $${paramCount}`;
      params.push(date_from);
      paramCount++;
    }

    if (date_to) {
      query += ` AND DATE(ml.moved_at) <= $${paramCount}`;
      params.push(date_to);
      paramCount++;
    }

    query += ' ORDER BY ml.moved_at DESC LIMIT 100';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching movements:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/movements/:id - Hareket detayı
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT ml.*, 
              fl.name as from_location_name,
              tl.name as to_location_name,
              p.name as moved_by_name
       FROM movement_logs ml
       LEFT JOIN locations fl ON ml.from_location_id = fl.id
       LEFT JOIN locations tl ON ml.to_location_id = tl.id
       LEFT JOIN persons p ON ml.moved_by = p.id
       WHERE ml.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Movement not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching movement:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/movements - Yeni hareket kaydı
router.post('/', async (req: Request, res: Response) => {
  try {
    const { resource_type, resource_id, from_location_id, to_location_id, moved_at, moved_by, notes } = req.body;

    if (!resource_type || !resource_id || !to_location_id) {
      return res.status(400).json({ error: 'resource_type, resource_id, and to_location_id are required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Hareket kaydı oluştur
      const movementResult = await client.query(
        `INSERT INTO movement_logs (resource_type, resource_id, from_location_id, to_location_id, moved_at, moved_by, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [resource_type, resource_id, from_location_id || null, to_location_id, moved_at || new Date(), moved_by || null, notes || null]
      );

      // Kaynağın konumunu güncelle
      if (resource_type === 'CRANE') {
        await client.query(
          'UPDATE cranes SET current_location_id = $1 WHERE id = $2',
          [to_location_id, resource_id]
        );
      } else if (resource_type === 'TRUCK') {
        await client.query(
          'UPDATE trucks SET current_location_id = $1 WHERE id = $2',
          [to_location_id, resource_id]
        );
      } else if (resource_type === 'EQUIPMENT') {
        await client.query(
          'UPDATE equipment_items SET current_location_id = $1, on_truck_id = NULL WHERE id = $2',
          [to_location_id, resource_id]
        );
      }

      await client.query('COMMIT');
      res.status(201).json(movementResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    console.error('Error creating movement:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/movements/resource/:type/:id - Kaynak hareket geçmişi
router.get('/resource/:type/:id', async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    const result = await pool.query(
      `SELECT ml.*, 
              fl.name as from_location_name,
              tl.name as to_location_name,
              p.name as moved_by_name
       FROM movement_logs ml
       LEFT JOIN locations fl ON ml.from_location_id = fl.id
       LEFT JOIN locations tl ON ml.to_location_id = tl.id
       LEFT JOIN persons p ON ml.moved_by = p.id
       WHERE ml.resource_type = $1 AND ml.resource_id = $2
       ORDER BY ml.moved_at DESC`,
      [type, id]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching resource movements:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;





