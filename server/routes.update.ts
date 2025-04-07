import express, { Request, Response, NextFunction } from 'express';
import { registerAdvancedDocumentAnalysisRoutes } from './routes/advancedDocumentAnalysis';
import { registerDocumentNotificationRoutes } from './routes/documentNotifications';

// Add this to your existing routes.ts file
export function registerRoutes(app: express.Express) {
  // ... other route registrations

  // Advanced document analysis routes
  registerAdvancedDocumentAnalysisRoutes(app);
  
  // Document notification routes
  registerDocumentNotificationRoutes(app);

  // ... rest of your existing routes
}