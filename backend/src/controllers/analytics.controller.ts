import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AnalyticsController {
  async getDashboardStats(req: Request, res: Response): Promise<void> {
    try {
      const { from, to } = req.query;
      const startDate = from ? new Date(from as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endDate = to ? new Date(to as string) : new Date();

      // Get basic statistics
      const [totalDeals, totalCommissions, totalBrokers, activeBrokers, activeProjects, totalDevelopers] = await Promise.all([
        prisma.deal.count({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        }),
        prisma.commission.aggregate({
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
          _sum: {
            grossCommission: true,
            netCommission: true,
          },
          _count: {
            id: true,
          },
        }),
        prisma.brokerUser.count(),
        prisma.brokerUser.count({
          where: {
            isActive: true,
          },
        }),
        prisma.project.count({
          where: {
            status: {
              in: ['UNDER_CONSTRUCTION', 'READY'],
            },
          },
        }),
        prisma.developer.count(),
      ]);

      const deals = await prisma.deal.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          dealValue: true,
          commissionAmount: true,
        },
      });

      const monthlyRevenue = deals.reduce((sum, deal) => sum + Number(deal.dealValue || 0), 0);

      const pendingCommissions = await prisma.commission.count({
        where: {
          status: 'CALCULATED',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      res.json({
        success: true,
        data: {
          monthlyRevenue,
          totalDeals,
          totalCommissions: Number(totalCommissions._sum.grossCommission || 0),
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
  }

  async getRevenueChart(req: Request, res: Response): Promise<void> {
    try {
      const { from, to } = req.query;
      const endDate = to ? new Date(to as string) : new Date();
      const startDate = from ? new Date(from as string) : new Date(endDate.getFullYear(), endDate.getMonth() - 6, 1);

      const deals = await prisma.deal.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        include: {
          commissions: true,
        },
      });

      // Group by month - simple grouping
      const monthlyData = new Map<string, { month: string; revenue: number; commissions: number; deals: number }>();
      
      deals.forEach((deal) => {
        const monthKey = deal.createdAt.toISOString().substring(0, 7); // YYYY-MM
        const monthName = new Date(deal.createdAt).toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' });
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            month: monthName,
            revenue: 0,
            commissions: 0,
            deals: 0,
          });
        }
        
        const monthData = monthlyData.get(monthKey)!;
        monthData.revenue += Number(deal.dealValue || 0);
        monthData.commissions += deal.commissions.reduce((sum, c) => sum + Number(c.grossCommission || 0), 0);
        monthData.deals += 1;
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
  }

  async getTopPerformers(req: Request, res: Response): Promise<void> {
    try {
      const { from, to } = req.query;
      const startDate = from ? new Date(from as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endDate = to ? new Date(to as string) : new Date();

      const brokers = await prisma.brokerUser.findMany({
        include: {
          deals: {
            where: {
              createdAt: {
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
        .map((broker) => {
          const revenue = broker.deals.reduce((sum, deal) => sum + Number(deal.dealValue || 0), 0);
          const commissions = broker.deals.reduce((sum, deal) => 
            sum + deal.commissions.reduce((commSum, comm) => commSum + Number(comm.grossCommission || 0), 0), 0
          );
          
          return {
            id: broker.id,
            name: `${broker.firstName} ${broker.lastName}`,
            revenue,
            commissions,
            deals: broker.deals.length,
          };
        })
        .filter((p) => p.deals > 0)
        .sort((a, b) => b.revenue - a.revenue)
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
  }

  async exportReport(req: Request, res: Response): Promise<void> {
    try {
      const { from, to } = req.query;
      const startDate = from ? new Date(from as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endDate = to ? new Date(to as string) : new Date();

      // Get all data
      const deals = await prisma.deal.findMany({
        where: {
          createdAt: {
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

      // Simple CSV export
      const csvData = deals.map((deal) => ({
        'Deal ID': deal.id,
        'Deal Number': deal.dealNumber || deal.id,
        'Client': deal.clientName,
        'Phone': deal.clientPhone,
        'Email': deal.clientEmail || '',
        'Broker': `${deal.broker.firstName} ${deal.broker.lastName}`,
        'Developer': deal.project.developer.name,
        'Project': deal.project.name,
        'Deal Value': Number(deal.dealValue || 0),
        'Commission Amount': Number(deal.commissionAmount || 0),
        'Status': deal.status,
        'Created Date': deal.createdAt.toISOString().split('T')[0],
      }));

      // Set headers for CSV download
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=report-${startDate.toISOString().split('T')[0]}-${endDate.toISOString().split('T')[0]}.csv`);

      // Convert to CSV
      if (csvData.length === 0) {
        res.send('No data available for the selected period');
        return;
      }

      const csvHeader = Object.keys(csvData[0]).join(',');
      const csvRows = csvData.map((row) => Object.values(row).join(','));
      const csvContent = [csvHeader, ...csvRows].join('\n');

      res.send(csvContent);
    } catch (error) {
      console.error('Export report error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to export report',
      });
    }
  }
}
