import express, { Request, Response } from 'express';
import pool from '../config/database';

const router = express.Router();

// GET /api/v1/persons - Personel listesi
router.get('/', async (req: Request, res: Response) => {
  try {
    const { role, status } = req.query;
    let query = 'SELECT * FROM persons WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (role) {
      query += ` AND role = $${paramCount}`;
      params.push(role);
      paramCount++;
    }

    if (status) {
      query += ` AND status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching persons:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/persons/:id - Personel detayı
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM persons WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching person:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/persons - Yeni personel
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, phone, email, role, status, notes } = req.body;

    if (!name || !role) {
      return res.status(400).json({ error: 'Name and role are required' });
    }

    const result = await pool.query(
      `INSERT INTO persons (name, phone, email, role, status, notes) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, phone || null, email || null, role, status || 'ACTIVE', notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating person:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/persons/:id - Personel güncelle
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone, email, role, status, notes } = req.body;

    const result = await pool.query(
      `UPDATE persons 
       SET name = $1, phone = $2, email = $3, role = $4, status = $5, notes = $6
       WHERE id = $7 RETURNING *`,
      [name, phone || null, email || null, role, status, notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating person:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/persons/:id - Personel sil
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM persons WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }

    res.json({ message: 'Person deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting person:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

