import { Router, Request, Response } from 'express';
import { prisma } from '../server';

const router = Router();

// GET /api/analytics/dashboard
router.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const [
      totalDevelopers,
      totalProjects,
      totalBrokers,
      totalDeals,
      totalCommissions,
    ] = await Promise.all([
      prisma.developer.count({ where: { isActive: true } }),
      prisma.project.count(),
      prisma.brokerUser.count({ where: { isActive: true } }),
      prisma.deal.count(),
      prisma.commission.aggregate({
        _sum: {
          grossCommission: true,
          netCommission: true,
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalDevelopers,
        totalProjects,
        totalBrokers,
        totalDeals,
        totalGrossCommission: totalCommissions._sum.grossCommission || 0,
        totalNetCommission: totalCommissions._sum.netCommission || 0,
      },
    });
  } catch (error) {
    console.error('Get dashboard analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard analytics' });
  }
});

// GET /api/analytics/dashboard-stats
router.get('/dashboard-stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    const startDate = from ? new Date(from as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = to ? new Date(to as string) : new Date();

    // Get total deals and revenue
    const deals = await prisma.deal.findMany({
      where: {
        approvedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        commissions: true,
      },
    });

    const monthlyRevenue = deals.reduce((sum: number, deal: any) => sum + deal.dealValue, 0);
    const totalDeals = deals.length;

    // Get commissions
    const commissions = await prisma.commission.findMany({
      where: {
        deal: {
          approvedAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
    });

    const totalCommissions = commissions.reduce((sum: number, comm: any) => sum + comm.amount, 0);
    const pendingCommissions = commissions.filter((c: any) => c.status === 'PENDING').length;

    // Get brokers
    const totalBrokers = await prisma.brokerUser.count();
    const activeBrokers = await prisma.brokerUser.count({
      where: {
        isActive: true,
      },
    });

    // Get projects and developers
    const activeProjects = await prisma.project.count({
      where: {
        status: 'READY',
      },
    });

    const totalDevelopers = await prisma.developer.count();

    res.json({
      success: true,
      data: {
        monthlyRevenue,
        totalDeals,
        totalCommissions,
        pendingCommissions,
        totalBrokers,
        activeBrokers,
        activeProjects,
        totalDevelopers,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load dashboard statistics',
    });
  }
});

// GET /api/analytics/revenue-chart
router.get('/revenue-chart', async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    const endDate = to ? new Date(to as string) : new Date();
    const startDate = from ? new Date(from as string) : new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1);

    const deals = await prisma.deal.findMany({
      where: {
        approvedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        commissions: true,
      },
    });

    // Group by month - simple grouping for now
    const monthlyData = new Map();
    
    deals.forEach((deal: any) => {
      if (deal.approvedAt) {
        const monthKey = deal.approvedAt.toISOString().substring(0, 7); // YYYY-MM
        const monthName = new Date(deal.approvedAt).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            month: monthName,
            revenue: 0,
            commissions: 0,
            deals: 0,
          });
        }
        
        const monthData = monthlyData.get(monthKey);
        monthData.revenue += deal.salePrice;
        monthData.commissions += deal.commissions.reduce((sum: number, c: any) => sum + c.amount, 0);
        monthData.deals += 1;
      }
    });

    const chartData = Array.from(monthlyData.values());

    res.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error('Get revenue chart error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load chart data',
    });
  }
});

// GET /api/analytics/top-performers
router.get('/top-performers', async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    const startDate = from ? new Date(from as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = to ? new Date(to as string) : new Date();

    const brokers = await prisma.brokerUser.findMany({
      include: {
        deals: {
          where: {
            approvedAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          include: {
            commissions: true,
          },
        },
      },
    });

    const performers = brokers
      .map((broker: any) => {
        const revenue = broker.deals.reduce((sum: number, deal: any) => sum + deal.salePrice, 0);
        const commissions = broker.deals.reduce((sum: number, deal: any) => 
          sum + deal.commissions.reduce((commSum: number, comm: any) => commSum + comm.amount, 0), 0
        );
        
        return {
          id: broker.id,
          name: broker.fullName,
          revenue,
          commissions,
          deals: broker.deals.length,
        };
      })
      .filter((p: any) => p.deals > 0)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    res.json({
      success: true,
      data: performers,
    });
  } catch (error) {
    console.error('Get top performers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load top brokers data',
    });
  }
});

// GET /api/analytics/export-report
router.get('/export-report', async (req: Request, res: Response): Promise<void> => {
  try {
    const { from, to } = req.query;
    const startDate = from ? new Date(from as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = to ? new Date(to as string) : new Date();

    // Get all data
    const deals = await prisma.deal.findMany({
      where: {
        approvedAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        broker: true,
        project: {
          include: {
            developer: true,
          },
        },
        commissions: true,
      },
    });

    // Simple CSV export for now
    const csvData = deals.map((deal: any) => ({
      'Deal ID': deal.id,
      'Client': deal.clientName,
      'Phone': deal.clientPhone,
      'Email': deal.clientEmail || '',
      'Broker': deal.broker.fullName,
      'Developer': deal.developer.name,
      'Project': deal.project.name,
      'Category': deal.category?.name || '',
      'Unit Type': deal.unitType?.name || '',
      'Unit Number': deal.unitNumber || '',
      'Unit Area': deal.unitArea || '',
      'Sale Price': deal.dealValue,
      'Commission Amount': deal.commissionAmount,
      'Status': deal.status,
      'Sale Date': deal.approvedAt?.toISOString().split('T')[0] || '',
      'Created Date': deal.createdAt.toISOString().split('T')[0],
    }));

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=report-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.csv`);

    // Convert to CSV
    const csvHeader = Object.keys(csvData[0] || {}).join(',');
    const csvRows = csvData.map((row: any) => Object.values(row).join(','));
    const csvContent = [csvHeader, ...csvRows].join('\n');

    res.send(csvContent);
  } catch (error) {
    console.error('Export report error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
    });
  }
});

export default router;
