import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../server';
import { CategoryType } from '@prisma/client';

const router = Router();

// Validation schemas
const createCategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  categoryType: z.nativeEnum(CategoryType),
});

const createUnitTypeSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

// GET /api/categories - Get all categories
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryType, search = '' } = req.query;

    const where: any = {};
    
    if (categoryType) {
      where.categoryType = categoryType;
    }

    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' };
    }

    const categories = await prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// POST /api/categories - Create new category
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createCategorySchema.parse(req.body);

    const category = await prisma.category.create({
      data,
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

// GET /api/categories/unit-types - Get all unit types
router.get('/unit-types', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search = '' } = req.query;

    const where: any = {};
    
    if (search) {
      where.name = { contains: search as string, mode: 'insensitive' };
    }

    const unitTypes = await prisma.unitType.findMany({
      where,
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: unitTypes,
    });
  } catch (error) {
    console.error('Get unit types error:', error);
    res.status(500).json({ error: 'Failed to fetch unit types' });
  }
});

// POST /api/categories/unit-types - Create new unit type
router.post('/unit-types', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = createUnitTypeSchema.parse(req.body);

    const unitType = await prisma.unitType.create({
      data,
    });

    res.status(201).json({
      success: true,
      data: unitType,
      message: 'Unit type created successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Validation failed', details: error.errors });
      return;
    }
    console.error('Create unit type error:', error);
    res.status(500).json({ error: 'Failed to create unit type' });
  }
});

export default router;
