import express, { Request, Response } from 'express';
import pool from '../config/database';

const router = express.Router();

// GET /api/v1/crane-configs/templates - Şablon listesi
router.get('/templates', async (req: Request, res: Response) => {
  try {
    const { crane_model } = req.query;
    let query = 'SELECT * FROM crane_config_templates WHERE 1=1';
    const params: any[] = [];
    let paramCount = 1;

    if (crane_model) {
      query += ` AND crane_model = $${paramCount}`;
      params.push(crane_model);
      paramCount++;
    }

    query += ' ORDER BY crane_model, config_name';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/crane-configs/templates/:id - Şablon detayı
router.get('/templates/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const templateResult = await pool.query(
      'SELECT * FROM crane_config_templates WHERE id = $1',
      [id]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateResult.rows[0];

    // Şablon ekipman listesini getir
    const itemsResult = await pool.query(
      `SELECT ccti.*, et.name as equipment_type_name, et.category
       FROM crane_config_template_items ccti
       JOIN equipment_types et ON ccti.equipment_type_id = et.id
       WHERE ccti.template_id = $1
       ORDER BY ccti.order_index`,
      [id]
    );

    template.items = itemsResult.rows;
    res.json(template);
  } catch (error: any) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/crane-configs/templates/:id/check-availability - Ekipman uygunluk kontrolü
router.get('/templates/:id/check-availability', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Şablonu ve ekipman listesini getir
    const templateResult = await pool.query(
      `SELECT cct.*, 
              ccti.equipment_type_id,
              ccti.quantity_required,
              et.name as equipment_type_name
       FROM crane_config_templates cct
       JOIN crane_config_template_items ccti ON cct.id = ccti.template_id
       JOIN equipment_types et ON ccti.equipment_type_id = et.id
       WHERE cct.id = $1
       ORDER BY ccti.order_index`,
      [id]
    );

    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateResult.rows[0];
    const items: any[] = [];

    // Her ekipman tipi için uygunluk kontrolü
    for (const row of templateResult.rows) {
      const availableItemsResult = await pool.query(
        `SELECT ei.*, l.name as location_name
         FROM equipment_items ei
         LEFT JOIN locations l ON ei.current_location_id = l.id
         WHERE ei.equipment_type_id = $1 AND ei.status = 'AVAILABLE'
         ORDER BY ei.serial_no`,
        [row.equipment_type_id]
      );

      const quantityAvailable = availableItemsResult.rows.length;
      const isAvailable = quantityAvailable >= row.quantity_required;

      items.push({
        equipment_type_id: row.equipment_type_id,
        equipment_type_name: row.equipment_type_name,
        quantity_required: row.quantity_required,
        quantity_available: quantityAvailable,
        is_available: isAvailable,
        missing_quantity: isAvailable ? 0 : row.quantity_required - quantityAvailable,
        available_items: availableItemsResult.rows
      });
    }

    res.json({
      template_id: id,
      template_name: template.config_name,
      items,
      all_available: items.every((item: any) => item.is_available)
    });
  } catch (error: any) {
    console.error('Error checking availability:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/crane-configs/templates - Yeni şablon
router.post('/templates', async (req: Request, res: Response) => {
  try {
    const { crane_model, config_name, description, diagram_file_path, items } = req.body;

    if (!crane_model || !config_name) {
      return res.status(400).json({ error: 'crane_model and config_name are required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Şablonu oluştur
      const templateResult = await client.query(
        `INSERT INTO crane_config_templates (crane_model, config_name, description, diagram_file_path)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [crane_model, config_name, description || null, diagram_file_path || null]
      );

      const template = templateResult.rows[0];

      // Ekipman listesini ekle
      if (items && Array.isArray(items)) {
        for (const item of items) {
          await client.query(
            `INSERT INTO crane_config_template_items (template_id, equipment_type_id, quantity_required, order_index)
             VALUES ($1, $2, $3, $4)`,
            [template.id, item.equipment_type_id, item.quantity_required, item.order_index || 0]
          );
        }
      }

      await client.query('COMMIT');
      res.status(201).json(template);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error: any) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Template with this name already exists for this crane model' });
    }
    console.error('Error creating template:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/crane-configs/project/:projectId - Proje konfigürasyonları
router.get('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const result = await pool.query(
      `SELECT pcc.*, 
              c.name as crane_name,
              cct.config_name as template_name,
              p.name as configured_by_name
       FROM project_crane_configs pcc
       JOIN cranes c ON pcc.crane_id = c.id
       JOIN crane_config_templates cct ON pcc.template_id = cct.id
       LEFT JOIN persons p ON pcc.configured_by = p.id
       WHERE pcc.project_id = $1
       ORDER BY pcc.configured_at DESC`,
      [projectId]
    );
    res.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching project configs:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/v1/crane-configs/project/:projectId - Projeye konfigürasyon ata
router.post('/project/:projectId', async (req: Request, res: Response) => {
  try {
    const { projectId } = req.params;
    const { crane_id, template_id, configured_by, notes } = req.body;

    if (!crane_id || !template_id) {
      return res.status(400).json({ error: 'crane_id and template_id are required' });
    }

    const result = await pool.query(
      `INSERT INTO project_crane_configs (project_id, crane_id, template_id, configured_by, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [projectId, crane_id, template_id, configured_by || null, notes || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error assigning config:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;





