import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { broadcast } from '../server';
import { requireManagerOrAbove } from '../middleware/auth';

const router = Router();

// Validation schemas
const createDeveloperSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  establishedYear: z.number().min(1900).max(new Date().getFullYear()).optional(),
  licenseNumber: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  email: z.string().email('Invalid email format'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  headquarters: z.string().optional(),
  operatingCities: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  awards: z.array(z.string()).default([]),
  
  // Commission Settings
  defaultCommissionRate: z.number().min(0).max(100).optional(),
  bonusCommissionRate: z.number().min(0).max(100).optional(),
  actualCommissionRate: z.number().min(0).max(100).optional(),
  brokerCommissionRate: z.number().min(0).max(100).optional(),
  platformMarginRate: z.number().min(0).max(100).optional(),
  
  // Contact Information
  salesContactName: z.string().optional(),
  salesContactPhone: z.string().optional(),
  salesContactEmail: z.string().email().optional().or(z.literal('')),
  backupContactPhone: z.string().optional(),
  contactNotes: z.string().optional(),
});

const updateDeveloperSchema = createDeveloperSchema.partial();

// GET /api/developers - Get all developers with projects hierarchy
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
      isActive,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeProjects = 'false',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { headquarters: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    // Include projects if requested
    const include: any = {
      _count: {
        select: {
          projects: true,
        },
      },
    };

    if (includeProjects === 'true') {
      include.projects = {
        include: {
          categories: {
            include: {
              category: true,
              unitTypes: {
                include: {
                  unitType: true,
                },
              },
            },
          },
          _count: {
            select: {
              units: true,
              deals: true,
            },
          },
        },
      };
    }

    const [developers, totalCount] = await Promise.all([
      prisma.developer.findMany({
        where,
        include,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
      }),
      prisma.developer.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: developers,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get developers error:', error);
    res.status(500).json({ error: 'Failed to fetch developers' });
  }
});

// GET /api/developers/:id - Get single developer with full hierarchy
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { includeHierarchy = 'true' } = req.query;

    const include: any = {
      _count: {
        select: {
          projects: true,
        },
      },
    };

    if (includeHierarchy === 'true') {
      include.projects = {
        include: {
          categories: {
            include: {
              category: true,
              unitTypes: {
                include: {
                  unitType: true,
                },
              },
            },
          },
          units: {
            include: {
              category: true,
              unitType: true,
            },
          },
          _count: {
            select: {
              units: true,
              deals: true,
            },
          },
        },
      };
    }

    const developer = await prisma.developer.findUnique({
      where: { id },
      include,
    });

    if (!developer) {
      res.status(404).json({ error: 'Developer not found' });
      return;
    }

    res.json({
      success: true,
      data: developer,
    });
  } catch (error) {
    console.error('Get developer error:', error);
    res.status(500).json({ error: 'Failed to fetch developer' });
  }
});

// POST /api/developers - Create new developer
router.post('/', requireManagerOrAbove, async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createDeveloperSchema.parse(req.body);

    const developer = await prisma.developer.create({
      data: {
        ...data,
        createdBy: req.user?.id,
      },
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    // Broadcast real-time update
    broadcast('developer_created', {
      developer,
      createdBy: req.user,
    });

    res.status(201).json({
      success: true,
      data: developer,
      message: 'Developer created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Create developer error:', error);
    res.status(500).json({ error: 'Failed to create developer' });
  }
});

// PUT /api/developers/:id - Update developer
router.put('/:id', requireManagerOrAbove, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateDeveloperSchema.parse(req.body);

    const existingDeveloper = await prisma.developer.findUnique({
      where: { id },
    });

    if (!existingDeveloper) {
      res.status(404).json({ error: 'Developer not found' });
      return;
    }

    const developer = await prisma.developer.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    // Broadcast real-time update
    broadcast('developer_updated', {
      developer,
      updatedBy: req.user,
      changes: data,
    });

    res.json({
      success: true,
      data: developer,
      message: 'Developer updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Update developer error:', error);
    res.status(500).json({ error: 'Failed to update developer' });
  }
});

// PATCH /api/developers/:id/status - Toggle developer active status
router.patch('/:id/status', requireManagerOrAbove, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const developer = await prisma.developer.update({
      where: { id },
      data: { isActive },
    });

    // Broadcast real-time update
    broadcast('developer_status_changed', {
      developerId: id,
      isActive,
      updatedBy: req.user,
    });

    res.json({
      success: true,
      data: developer,
      message: `Developer ${isActive ? 'activated' : 'deactivated'} successfully`,
    });
  } catch (error) {
    console.error('Toggle developer status error:', error);
    res.status(500).json({ error: 'Failed to update developer status' });
  }
});

// DELETE /api/developers/:id - Delete developer (only if no active projects)
router.delete('/:id', requireManagerOrAbove, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if developer has active projects
    const projectCount = await prisma.project.count({
      where: { developerId: id },
    });

    if (projectCount > 0) {
      res.status(400).json({ 
        error: 'Cannot delete developer with existing projects',
        projectCount,
      });
      return;
    }

    await prisma.developer.delete({
      where: { id },
    });

    // Broadcast real-time update
    broadcast('developer_deleted', {
      developerId: id,
      deletedBy: req.user,
    });

    res.json({
      success: true,
      message: 'Developer deleted successfully',
    });
  } catch (error) {
    console.error('Delete developer error:', error);
    res.status(500).json({ error: 'Failed to delete developer' });
  }
});

// POST /api/developers/:id/commission-bulk-update - Bulk update commission rates
router.post('/:id/commission-bulk-update', requireManagerOrAbove, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { 
      commissionRates,
      applyToProjects = false,
      applyToCategories = false,
      applyToUnitTypes = false,
    } = req.body;

    // Update developer commission rates
    const developer = await prisma.developer.update({
      where: { id },
      data: commissionRates,
    });

    let updatedCount = 1;

    // Apply to projects if requested
    if (applyToProjects) {
      const projectUpdateResult = await prisma.project.updateMany({
        where: { developerId: id },
        data: commissionRates,
      });
      updatedCount += projectUpdateResult.count;
    }

    // Apply to categories if requested
    if (applyToCategories) {
      const categoryUpdateResult = await prisma.projectCategory.updateMany({
        where: { project: { developerId: id } },
        data: commissionRates,
      });
      updatedCount += categoryUpdateResult.count;
    }

    // Apply to unit types if requested
    if (applyToUnitTypes) {
      const unitTypeUpdateResult = await prisma.projectCategoryUnitType.updateMany({
        where: { project: { developerId: id } },
        data: commissionRates,
      });
      updatedCount += unitTypeUpdateResult.count;
    }

    // Broadcast real-time update
    broadcast('commission_bulk_update', {
      developerId: id,
      commissionRates,
      updatedCount,
      updatedBy: req.user,
    });

    res.json({
      success: true,
      data: developer,
      updatedCount,
      message: `Commission rates updated for ${updatedCount} records`,
    });
  } catch (error) {
    console.error('Bulk commission update error:', error);
    res.status(500).json({ error: 'Failed to update commission rates' });
  }
});

// GET /api/developers/:id/analytics - Get developer analytics
router.get('/:id/analytics', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { timeframe = '30d' } = req.query;

    // Calculate date range based on timeframe
    const now = new Date();
    let startDate: Date;
    
    switch (timeframe) {
      case '7d':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90d':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case '1y':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    const [
      totalProjects,
      totalDeals,
      totalCommissions,
      recentDeals,
    ] = await Promise.all([
      prisma.project.count({
        where: { developerId: id },
      }),
      prisma.deal.count({
        where: {
          project: { developerId: id },
          createdAt: { gte: startDate },
        },
      }),
      prisma.commission.aggregate({
        where: {
          deal: {
            project: { developerId: id },
            createdAt: { gte: startDate },
          },
        },
        _sum: {
          grossCommission: true,
          netCommission: true,
        },
      }),
      prisma.deal.findMany({
        where: {
          project: { developerId: id },
          createdAt: { gte: startDate },
        },
        include: {
          broker: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          project: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalProjects,
          totalDeals,
          totalGrossCommission: totalCommissions._sum.grossCommission || 0,
          totalNetCommission: totalCommissions._sum.netCommission || 0,
        },
        recentDeals,
        timeframe,
      },
    });
  } catch (error) {
    console.error('Get developer analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch developer analytics' });
  }
});

export default router;
