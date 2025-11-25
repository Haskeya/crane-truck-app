import express, { Request, Response } from 'express';
import pool from '../config/database';

const router = express.Router();

// GET /api/v1/projects - Proje listesi
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, customer_id, search } = req.query;
    let query = `
      SELECT p.*, 
             c.name as customer_name,
             l.name as location_name,
             pe.name as project_engineer_name,
             psm.name as project_site_manager_name
      FROM projects p
      LEFT JOIN customers c ON p.customer_id = c.id
      LEFT JOIN locations l ON p.location_id = l.id
      LEFT JOIN persons pe ON p.project_engineer_id = pe.id
      LEFT JOIN persons psm ON p.project_site_manager_id = psm.id
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramCount = 1;

    if (status) {
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (customer_id) {
      query += ` AND p.customer_id = $${paramCount}`;
      params.push(customer_id);
      paramCount++;
    }

    if (search) {
      query += ` AND p.name ILIKE $${paramCount}`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/projects/:id - Proje detayı
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectResult = await pool.query(
      `SELECT p.*, 
              c.name as customer_name, c.city as customer_city,
              l.name as location_name, l.type as location_type,
              pe.name as project_engineer_name,
              psm.name as project_site_manager_name
       FROM projects p
       LEFT JOIN customers c ON p.customer_id = c.id
       LEFT JOIN locations l ON p.location_id = l.id
       LEFT JOIN persons pe ON p.project_engineer_id = pe.id
       LEFT JOIN persons psm ON p.project_site_manager_id = psm.id
       WHERE p.id = $1`,
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];

    // Atamaları getir
    const assignmentsResult = await pool.query(
      `SELECT * FROM project_assignments 
       WHERE project_id = $1 AND unassigned_at IS NULL`,
      [id]
    );

    project.assignments = assignmentsResult.rows;

    res.json(project);
  } catch (error: any) {
    console.error('Error fetching project:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/projects - Yeni proje
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, customer_id, location_id, start_date, end_date, status, notes, project_engineer_id, project_site_manager_id } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const result = await pool.query(
      `INSERT INTO projects (name, customer_id, location_id, start_date, end_date, status, notes, project_engineer_id, project_site_manager_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [name, customer_id || null, location_id || null, start_date || null, end_date || null, status || 'PLANNED', notes || null, project_engineer_id || null, project_site_manager_id || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/v1/projects/:id - Proje güncelle
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, customer_id, location_id, start_date, end_date, actual_start_date, actual_end_date, status, notes, project_engineer_id, project_site_manager_id } = req.body;

    const result = await pool.query(
      `UPDATE projects 
       SET name = $1, customer_id = $2, location_id = $3, start_date = $4, end_date = $5,
           actual_start_date = $6, actual_end_date = $7, status = $8, notes = $9,
           project_engineer_id = $10, project_site_manager_id = $11
       WHERE id = $12 RETURNING *`,
      [name, customer_id || null, location_id || null, start_date || null, end_date || null,
       actual_start_date || null, actual_end_date || null, status, notes || null,
       project_engineer_id || null, project_site_manager_id || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/projects/:id - Proje sil
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/projects/:id/assignments - Proje atamaları
router.get('/:id/assignments', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT pa.*,
              CASE 
                WHEN pa.resource_type = 'CRANE' THEN c.name
                WHEN pa.resource_type = 'TRUCK' THEN t.plate_no
                WHEN pa.resource_type = 'EQUIPMENT' THEN et.name || ' - ' || ei.serial_no
                WHEN pa.resource_type = 'PERSON' THEN p.name
              END as resource_name
       FROM project_assignments pa
       LEFT JOIN cranes c ON pa.resource_type = 'CRANE' AND pa.resource_id = c.id
       LEFT JOIN trucks t ON pa.resource_type = 'TRUCK' AND pa.resource_id = t.id
       LEFT JOIN equipment_items ei ON pa.resource_type = 'EQUIPMENT' AND pa.resource_id = ei.id
       LEFT JOIN equipment_types et ON ei.equipment_type_id = et.id
       LEFT JOIN persons p ON pa.resource_type = 'PERSON' AND pa.resource_id = p.id
       WHERE pa.project_id = $1 AND pa.unassigned_at IS NULL
       ORDER BY pa.assigned_at DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/projects/:id/assignment-history - Proje atama geçmişi
router.get('/:id/assignment-history', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT pa.*,
              CASE 
                WHEN pa.resource_type = 'CRANE' THEN c.name
                WHEN pa.resource_type = 'TRUCK' THEN t.plate_no
                WHEN pa.resource_type = 'EQUIPMENT' THEN et.name || ' - ' || ei.serial_no
                WHEN pa.resource_type = 'PERSON' THEN p.name
              END as resource_name
       FROM project_assignments pa
       LEFT JOIN cranes c ON pa.resource_type = 'CRANE' AND pa.resource_id = c.id
       LEFT JOIN trucks t ON pa.resource_type = 'TRUCK' AND pa.resource_id = t.id
       LEFT JOIN equipment_items ei ON pa.resource_type = 'EQUIPMENT' AND pa.resource_id = ei.id
       LEFT JOIN equipment_types et ON ei.equipment_type_id = et.id
       LEFT JOIN persons p ON pa.resource_type = 'PERSON' AND pa.resource_id = p.id
       WHERE pa.project_id = $1
       ORDER BY COALESCE(pa.unassigned_at, pa.assigned_at) DESC`,
      [id]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching assignment history:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/projects/:id/assign - Kaynak ata
router.post('/:id/assign', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { resource_type, resource_id, notes } = req.body;

    if (!resource_type || !resource_id) {
      return res.status(400).json({ error: 'resource_type and resource_id are required' });
    }

    // Aynı kaynağın başka bir aktif projede olup olmadığını kontrol et
    if (resource_type === 'CRANE' || resource_type === 'TRUCK') {
      const existingAssignment = await pool.query(
        `SELECT pa.*, p.name as project_name 
         FROM project_assignments pa
         JOIN projects p ON pa.project_id = p.id
         WHERE pa.resource_type = $1 AND pa.resource_id = $2 
         AND pa.unassigned_at IS NULL AND p.status = 'ACTIVE' AND p.id != $3`,
        [resource_type, resource_id, id]
      );

      if (existingAssignment.rows.length > 0) {
        return res.status(400).json({ 
          error: `Bu kaynak zaten "${existingAssignment.rows[0].project_name}" projesinde aktif!` 
        });
      }
    }

    const result = await pool.query(
      `INSERT INTO project_assignments (project_id, resource_type, resource_id, notes)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, resource_type, resource_id, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error assigning resource:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/v1/projects/:id/assignments/:assignId - Atamadan çıkar
router.delete('/:id/assignments/:assignId', async (req: Request, res: Response) => {
  try {
    const { id, assignId } = req.params;
    const { reason } = req.body || {};
    const result = await pool.query(
      `UPDATE project_assignments 
       SET unassigned_at = CURRENT_TIMESTAMP,
           unassignment_reason = $1
       WHERE id = $2 AND project_id = $3 RETURNING *`,
      [reason || null, assignId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Resource unassigned successfully' });
  } catch (error: any) {
    console.error('Error unassigning resource:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/projects/:id/assignments/:assignId/unassign - Atamadan çıkar (nedenli)
router.post('/:id/assignments/:assignId/unassign', async (req: Request, res: Response) => {
  try {
    const { id, assignId } = req.params;
    const { reason } = req.body || {};
    const result = await pool.query(
      `UPDATE project_assignments 
       SET unassigned_at = CURRENT_TIMESTAMP,
           unassignment_reason = $1
       WHERE id = $2 AND project_id = $3 RETURNING *`,
      [reason || null, assignId, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error unassigning resource with reason:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

