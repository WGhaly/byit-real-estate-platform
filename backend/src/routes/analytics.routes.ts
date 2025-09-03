import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { AnalyticsController } from '../controllers/analytics.controller';
import { AdminRole } from '@prisma/client';

const router = Router();
const analyticsController = new AnalyticsController();

// Apply authentication to all routes
router.use(authenticateToken);

// Dashboard statistics
router.get('/dashboard-stats', 
  requireRole([AdminRole.SUPER_ADMIN, AdminRole.OPERATIONS_MANAGER]),
  analyticsController.getDashboardStats
);

// Revenue chart data
router.get('/revenue-chart',
  requireRole([AdminRole.SUPER_ADMIN, AdminRole.OPERATIONS_MANAGER]),
  analyticsController.getRevenueChart
);

// Top performers
router.get('/top-performers',
  requireRole([AdminRole.SUPER_ADMIN, AdminRole.OPERATIONS_MANAGER]),
  analyticsController.getTopPerformers
);

// Export report
router.get('/export-report',
  requireRole([AdminRole.SUPER_ADMIN, AdminRole.OPERATIONS_MANAGER]),
  analyticsController.exportReport
);

export { router as analyticsRoutes };
