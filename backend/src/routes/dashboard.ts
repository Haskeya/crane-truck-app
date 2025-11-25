import express, { Request, Response } from 'express';
import pool from '../config/database';

const router = express.Router();

// GET /api/v1/dashboard/overview - Genel özet
router.get('/overview', async (req: Request, res: Response) => {
  try {
    // Aktif proje sayısı
    const activeProjects = await pool.query(
      "SELECT COUNT(*) as count FROM projects WHERE status = 'ACTIVE'"
    );

    // Toplam vinç sayısı
    const totalCranes = await pool.query('SELECT COUNT(*) as count FROM cranes');
    const activeCranes = await pool.query(
      "SELECT COUNT(*) as count FROM cranes WHERE status = 'ACTIVE'"
    );
    const maintenanceCranes = await pool.query(
      "SELECT COUNT(*) as count FROM cranes WHERE status = 'MAINTENANCE'"
    );

    // Toplam kamyon sayısı
    const totalTrucks = await pool.query('SELECT COUNT(*) as count FROM trucks');
    const activeTrucks = await pool.query(
      "SELECT COUNT(*) as count FROM trucks WHERE status = 'ACTIVE'"
    );

    // Bugün yapılan hareketler
    const todayMovements = await pool.query(
      "SELECT COUNT(*) as count FROM movement_logs WHERE DATE(moved_at) = CURRENT_DATE"
    );

    // Son 5 hareket
    const recentMovements = await pool.query(
      `SELECT ml.*, 
              fl.name as from_location_name,
              tl.name as to_location_name
       FROM movement_logs ml
       LEFT JOIN locations fl ON ml.from_location_id = fl.id
       LEFT JOIN locations tl ON ml.to_location_id = tl.id
       ORDER BY ml.moved_at DESC
       LIMIT 5`
    );

    // Aktif projeler
    const activeProjectsList = await pool.query(
      `SELECT p.*, c.name as customer_name
       FROM projects p
       LEFT JOIN customers c ON p.customer_id = c.id
       WHERE p.status = 'ACTIVE'
       ORDER BY p.created_at DESC
       LIMIT 5`
    );

    res.json({
      stats: {
        activeProjects: parseInt(activeProjects.rows[0].count),
        totalCranes: parseInt(totalCranes.rows[0].count),
        activeCranes: parseInt(activeCranes.rows[0].count),
        maintenanceCranes: parseInt(maintenanceCranes.rows[0].count),
        totalTrucks: parseInt(totalTrucks.rows[0].count),
        activeTrucks: parseInt(activeTrucks.rows[0].count),
        todayMovements: parseInt(todayMovements.rows[0].count)
      },
      recentMovements: recentMovements.rows,
      activeProjects: activeProjectsList.rows
    });
  } catch (error: any) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/v1/dashboard/charts - Grafik verileri
router.get('/charts', async (req: Request, res: Response) => {
  try {
    // Son 7 günlük hareket sayıları
    const movementsByDay = await pool.query(`
      SELECT DATE(moved_at) as date, COUNT(*) as count
      FROM movement_logs
      WHERE moved_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(moved_at)
      ORDER BY date ASC
    `);

    // Proje durumlarına göre dağılım
    const projectsByStatus = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM projects
      GROUP BY status
    `);

    // Vinç durumlarına göre dağılım
    const cranesByStatus = await pool.query(`
      SELECT status, COUNT(*) as count
      FROM cranes
      GROUP BY status
    `);

    // Aylık proje sayıları (son 6 ay)
    const projectsByMonth = await pool.query(`
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM projects
      WHERE created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month ASC
    `);

    // En çok kullanılan ekipman tipleri
    const topEquipmentTypes = await pool.query(`
      SELECT et.name, COUNT(ei.id) as usage_count
      FROM equipment_types et
      LEFT JOIN equipment_items ei ON et.id = ei.equipment_type_id
      LEFT JOIN project_assignments pa ON ei.id = pa.resource_id AND pa.resource_type = 'EQUIPMENT'
      GROUP BY et.id, et.name
      ORDER BY usage_count DESC
      LIMIT 5
    `);

    res.json({
      movementsByDay: movementsByDay.rows,
      projectsByStatus: projectsByStatus.rows,
      cranesByStatus: cranesByStatus.rows,
      projectsByMonth: projectsByMonth.rows,
      topEquipmentTypes: topEquipmentTypes.rows
    });
  } catch (error: any) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

