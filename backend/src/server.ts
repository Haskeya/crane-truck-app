import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import customersRoutes from './routes/customers';
import projectsRoutes from './routes/projects';
import cranesRoutes from './routes/cranes';
import trucksRoutes from './routes/trucks';
import locationsRoutes from './routes/locations';
import dashboardRoutes from './routes/dashboard';
import movementsRoutes from './routes/movements';
import equipmentRoutes from './routes/equipment';
import personsRoutes from './routes/persons';
import craneConfigsRoutes from './routes/crane-configs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', message: 'Crane & Truck API is running' });
});

// Routes
app.use('/api/v1/customers', customersRoutes);
app.use('/api/v1/projects', projectsRoutes);
app.use('/api/v1/cranes', cranesRoutes);
app.use('/api/v1/trucks', trucksRoutes);
app.use('/api/v1/locations', locationsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/movements', movementsRoutes);
app.use('/api/v1/equipment', equipmentRoutes);
app.use('/api/v1/persons', personsRoutes);
app.use('/api/v1/crane-configs', craneConfigsRoutes);

// Error handling
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api/v1`);
});

