import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { broadcast } from '../server';
import { requireManagerOrAbove } from '../middleware/auth';
import { ProjectType, ProjectStatus } from '@prisma/client';

const router = Router();

// Validation schemas
const createProjectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  address: z.string().optional(),
  coordinates: z.string().optional(),
  projectType: z.nativeEnum(ProjectType),
  
  // Unit Information
  totalUnits: z.number().min(0).optional(),
  availableUnits: z.number().min(0).optional(),
  soldUnits: z.number().min(0).optional(),
  priceRange: z.string().optional(),
  paymentPlans: z.array(z.string()).default([]),
  
  // Project Status & Timeline
  status: z.nativeEnum(ProjectStatus),
  launchDate: z.string().datetime().optional(),
  completionDate: z.string().datetime().optional(),
  handoverDate: z.string().datetime().optional(),
  
  // Marketing Materials
  images: z.array(z.string()).default([]),
  brochureUrl: z.string().url().optional().or(z.literal('')),
  virtualTourUrl: z.string().url().optional().or(z.literal('')),
  amenities: z.array(z.string()).default([]),
  
  // Commission Structure  
  actualCommissionRate: z.number().min(0).max(100).optional(),
  brokerCommissionRate: z.number().min(0).max(100).optional(),
  communicatedCommission: z.number().min(0).max(100).optional(),
  
  // Sales Contact
  salesContactName: z.string().optional(),
  salesContactPhone: z.string().optional(),
  salesContactEmail: z.string().email().optional().or(z.literal('')),
  
  developerId: z.string().uuid('Invalid developer ID'),
});

const updateProjectSchema = createProjectSchema.partial().omit({ developerId: true });

const createProjectCategorySchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  isEnabled: z.boolean().default(true),
  actualCommissionRate: z.number().min(0).max(100).optional(),
  brokerCommissionRate: z.number().min(0).max(100).optional(),
  communicatedCommission: z.number().min(0).max(100).optional(),
});

const createUnitTypeSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  unitTypeId: z.string().uuid('Invalid unit type ID'),
  isEnabled: z.boolean().default(true),
  actualCommissionRate: z.number().min(0).max(100).optional(),
  brokerCommissionRate: z.number().min(0).max(100).optional(),
  communicatedCommission: z.number().min(0).max(100).optional(),
  price: z.number().min(0).optional(),
});

// GET /api/projects - Get all projects
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '10',
      search = '',
      developerId,
      status,
      projectType,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeHierarchy = 'false',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    if (developerId) {
      where.developerId = developerId;
    }

    if (status) {
      where.status = status;
    }

    if (projectType) {
      where.projectType = projectType;
    }

    // Include related data
    const include: any = {
      developer: {
        select: {
          id: true,
          name: true,
          logo: true,
        },
      },
      _count: {
        select: {
          units: true,
          deals: true,
          categories: true,
        },
      },
    };

    if (includeHierarchy === 'true') {
      include.categories = {
        include: {
          category: true,
          unitTypes: {
            include: {
              unitType: true,
            },
          },
        },
      };
    }

    const [projects, totalCount] = await Promise.all([
      prisma.project.findMany({
        where,
        include,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
      }),
      prisma.project.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: projects,
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
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id - Get single project with full hierarchy
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            logo: true,
            actualCommissionRate: true,
            brokerCommissionRate: true,
            communicatedCommission: true,
          },
        },
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
        deals: {
          include: {
            broker: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            units: true,
            deals: true,
            categories: true,
          },
        },
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// POST /api/projects - Create new project
router.post('/', requireManagerOrAbove, async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createProjectSchema.parse(req.body);

    // Verify developer exists
    const developer = await prisma.developer.findUnique({
      where: { id: data.developerId },
    });

    if (!developer) {
      res.status(404).json({ error: 'Developer not found' });
      return;
    }

    const project = await prisma.project.create({
      data: {
        ...data,
        launchDate: data.launchDate ? new Date(data.launchDate) : null,
        completionDate: data.completionDate ? new Date(data.completionDate) : null,
        handoverDate: data.handoverDate ? new Date(data.handoverDate) : null,
        createdBy: req.user?.id,
      },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        _count: {
          select: {
            units: true,
            deals: true,
            categories: true,
          },
        },
      },
    });

    // Broadcast real-time update
    broadcast('project_created', {
      project,
      createdBy: req.user,
    });

    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// PUT /api/projects/:id - Update project
router.put('/:id', requireManagerOrAbove, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = updateProjectSchema.parse(req.body);

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...data,
        launchDate: data.launchDate ? new Date(data.launchDate) : undefined,
        completionDate: data.completionDate ? new Date(data.completionDate) : undefined,
        handoverDate: data.handoverDate ? new Date(data.handoverDate) : undefined,
      },
      include: {
        developer: {
          select: {
            id: true,
            name: true,
            logo: true,
          },
        },
        _count: {
          select: {
            units: true,
            deals: true,
            categories: true,
          },
        },
      },
    });

    // Broadcast real-time update
    broadcast('project_updated', {
      project,
      updatedBy: req.user,
      changes: data,
    });

    res.json({
      success: true,
      data: project,
      message: 'Project updated successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// POST /api/projects/:id/categories - Add category to project
router.post('/:id/categories', requireManagerOrAbove, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    const data = createProjectCategorySchema.parse(req.body);

    // Check if project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Check if category already exists for this project
    const existingCategory = await prisma.projectCategory.findUnique({
      where: {
        projectId_categoryId: {
          projectId,
          categoryId: data.categoryId,
        },
      },
    });

    if (existingCategory) {
      res.status(409).json({ error: 'Category already exists for this project' });
      return;
    }

    const projectCategory = await prisma.projectCategory.create({
      data: {
        ...data,
        projectId,
        createdBy: req.user?.id,
      },
      include: {
        category: true,
      },
    });

    // Broadcast real-time update
    broadcast('project_category_added', {
      projectId,
      category: projectCategory,
      addedBy: req.user,
    });

    res.status(201).json({
      success: true,
      data: projectCategory,
      message: 'Category added to project successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Add project category error:', error);
    res.status(500).json({ error: 'Failed to add category to project' });
  }
});

// PUT /api/projects/:id/categories/:categoryId - Update project category
router.put('/:id/categories/:categoryId', requireManagerOrAbove, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: projectId, categoryId } = req.params;
    const data = createProjectCategorySchema.partial().parse(req.body);

    const projectCategory = await prisma.projectCategory.update({
      where: {
        projectId_categoryId: {
          projectId,
          categoryId,
        },
      },
      data,
      include: {
        category: true,
      },
    });

    // If category is disabled, disable all its unit types
    if (data.isEnabled === false) {
      await prisma.projectCategoryUnitType.updateMany({
        where: {
          projectId,
          categoryId,
        },
        data: { isEnabled: false },
      });
    }

    // Broadcast real-time update
    broadcast('project_category_updated', {
      projectId,
      categoryId,
      category: projectCategory,
      updatedBy: req.user,
    });

    res.json({
      success: true,
      data: projectCategory,
      message: 'Project category updated successfully',
    });
  } catch (error) {
    console.error('Update project category error:', error);
    res.status(500).json({ error: 'Failed to update project category' });
  }
});

// POST /api/projects/:id/unit-types - Add unit type to project category
router.post('/:id/unit-types', requireManagerOrAbove, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;
    const data = createUnitTypeSchema.parse(req.body);

    // Check if unit type already exists for this project category
    const existingUnitType = await prisma.projectCategoryUnitType.findUnique({
      where: {
        projectId_categoryId_unitTypeId: {
          projectId,
          categoryId: data.categoryId,
          unitTypeId: data.unitTypeId,
        },
      },
    });

    if (existingUnitType) {
      res.status(409).json({ error: 'Unit type already exists for this project category' });
      return;
    }

    const projectUnitType = await prisma.projectCategoryUnitType.create({
      data: {
        ...data,
        projectId,
        createdBy: req.user?.id,
      },
      include: {
        unitType: true,
        category: {
          include: {
            category: true,
          },
        },
      },
    });

    // Broadcast real-time update
    broadcast('project_unit_type_added', {
      projectId,
      unitType: projectUnitType,
      addedBy: req.user,
    });

    res.status(201).json({
      success: true,
      data: projectUnitType,
      message: 'Unit type added to project successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Add project unit type error:', error);
    res.status(500).json({ error: 'Failed to add unit type to project' });
  }
});

// PUT /api/projects/:id/unit-types/:categoryId/:unitTypeId - Update project unit type
router.put('/:id/unit-types/:categoryId/:unitTypeId', requireManagerOrAbove, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: projectId, categoryId, unitTypeId } = req.params;
    const data = createUnitTypeSchema.partial().omit({ categoryId: true, unitTypeId: true }).parse(req.body);

    const projectUnitType = await prisma.projectCategoryUnitType.update({
      where: {
        projectId_categoryId_unitTypeId: {
          projectId,
          categoryId,
          unitTypeId,
        },
      },
      data,
      include: {
        unitType: true,
        category: {
          include: {
            category: true,
          },
        },
      },
    });

    // Broadcast real-time update
    broadcast('project_unit_type_updated', {
      projectId,
      categoryId,
      unitTypeId,
      unitType: projectUnitType,
      updatedBy: req.user,
    });

    res.json({
      success: true,
      data: projectUnitType,
      message: 'Project unit type updated successfully',
    });
  } catch (error) {
    console.error('Update project unit type error:', error);
    res.status(500).json({ error: 'Failed to update project unit type' });
  }
});

// DELETE /api/projects/:id/categories/:categoryId - Remove category from project
router.delete('/:id/categories/:categoryId', requireManagerOrAbove, async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: projectId, categoryId } = req.params;

    // Delete all unit types for this category first
    await prisma.projectCategoryUnitType.deleteMany({
      where: {
        projectId,
        categoryId,
      },
    });

    // Delete the category
    await prisma.projectCategory.delete({
      where: {
        projectId_categoryId: {
          projectId,
          categoryId,
        },
      },
    });

    // Broadcast real-time update
    broadcast('project_category_removed', {
      projectId,
      categoryId,
      removedBy: req.user,
    });

    res.json({
      success: true,
      message: 'Category removed from project successfully',
    });
  } catch (error) {
    console.error('Remove project category error:', error);
    res.status(500).json({ error: 'Failed to remove category from project' });
  }
});

// GET /api/projects/:id/commission-hierarchy - Get commission inheritance hierarchy
router.get('/:id/commission-hierarchy', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id: projectId } = req.params;

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        developer: {
          select: {
            actualCommissionRate: true,
            brokerCommissionRate: true,
            communicatedCommission: true,
          },
        },
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
      },
    });

    if (!project) {
      res.status(404).json({ error: 'Project not found' });
      return;
    }

    // Build commission hierarchy with inheritance
    const hierarchy = {
      developer: {
        level: 'DEVELOPER',
        commissions: {
          actualCommissionRate: project.developer.actualCommissionRate,
          brokerCommissionRate: project.developer.brokerCommissionRate,
          communicatedCommission: project.developer.communicatedCommission,
        },
      },
      project: {
        level: 'PROJECT',
        commissions: {
          actualCommissionRate: project.actualCommissionRate || project.developer.actualCommissionRate,
          brokerCommissionRate: project.brokerCommissionRate || project.developer.brokerCommissionRate,
          communicatedCommission: project.communicatedCommission || project.developer.communicatedCommission,
        },
        inherited: {
          actualCommissionRate: !project.actualCommissionRate,
          brokerCommissionRate: !project.brokerCommissionRate,
          communicatedCommission: !project.communicatedCommission,
        },
      },
      categories: project.categories.map(category => ({
        id: category.id,
        name: category.category.name,
        level: 'CATEGORY',
        commissions: {
          actualCommissionRate: category.actualCommissionRate || project.actualCommissionRate || project.developer.actualCommissionRate,
          brokerCommissionRate: category.brokerCommissionRate || project.brokerCommissionRate || project.developer.brokerCommissionRate,
          communicatedCommission: category.communicatedCommission || project.communicatedCommission || project.developer.communicatedCommission,
        },
        inherited: {
          actualCommissionRate: !category.actualCommissionRate,
          brokerCommissionRate: !category.brokerCommissionRate,
          communicatedCommission: !category.communicatedCommission,
        },
        unitTypes: category.unitTypes.map(unitType => ({
          id: unitType.id,
          name: unitType.unitType.name,
          level: 'UNIT_TYPE',
          commissions: {
            actualCommissionRate: unitType.actualCommissionRate || category.actualCommissionRate || project.actualCommissionRate || project.developer.actualCommissionRate,
            brokerCommissionRate: unitType.brokerCommissionRate || category.brokerCommissionRate || project.brokerCommissionRate || project.developer.brokerCommissionRate,
            communicatedCommission: unitType.communicatedCommission || category.communicatedCommission || project.communicatedCommission || project.developer.communicatedCommission,
          },
          inherited: {
            actualCommissionRate: !unitType.actualCommissionRate,
            brokerCommissionRate: !unitType.brokerCommissionRate,
            communicatedCommission: !unitType.communicatedCommission,
          },
        })),
      })),
    };

    res.json({
      success: true,
      data: hierarchy,
    });
  } catch (error) {
    console.error('Get commission hierarchy error:', error);
    res.status(500).json({ error: 'Failed to fetch commission hierarchy' });
  }
});

export default router;
