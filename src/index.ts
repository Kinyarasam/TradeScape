import express, { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';
import db from './db/db'; // Import the Knex database instance
import tradeRoutes from './routes/tradeRoutes'; // Import trade routes

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());

// Health check route to ensure the database connection is working
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Simple query to test DB connection
    await db.raw('SELECT 1');
    res.json({ status: 'ok', message: 'Database connection is healthy!' });
  } catch (error: any) {
    console.error('DB Health Check Error:', error.message);
    res.status(500).json({ status: 'error', message: 'Database connection failed!' });
  }
});

// Use trade-related routes
app.use('/api/trades', tradeRoutes);

// Simple route for testing
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to TradeScape! Let’s take over the industry!' });
});

// Handle errors
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
