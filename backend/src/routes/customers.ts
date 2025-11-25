import express, { Request, Response } from 'express';
import pool from '../config/database';

const router = express.Router();

// GET /api/v1/customers - Müşteri listesi
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, city } = req.query;
    let query = 'SELECT * FROM customers WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (search) {
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (city) {
      query += ` AND city = $${paramCount}`;
      params.push(city);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/customers/:id - Müşteri detayı
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM customers WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/customers - Yeni müşteri
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, city, notes } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await pool.query(
      'INSERT INTO customers (name, city, notes) VALUES ($1, $2, $3) RETURNING *',
      [name, city || null, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/customers/:id - Müşteri güncelle
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, city, notes } = req.body;

    const result = await pool.query(
      'UPDATE customers SET name = $1, city = $2, notes = $3 WHERE id = $4 RETURNING *',
      [name, city || null, notes || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/customers/:id - Müşteri sil
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM customers WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/customers/:id/projects - Müşteri projeleri
router.get('/:id/projects', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM projects WHERE customer_id = $1 ORDER BY created_at DESC',
      [id]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching customer projects:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

