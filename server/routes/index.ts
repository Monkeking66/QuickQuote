import { Express } from 'express';
import openaiRoutes from './openai';

export async function registerRoutes(app: Express) {
  app.use('/api/openai', openaiRoutes);
  return app;
} 