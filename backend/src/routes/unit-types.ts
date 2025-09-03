import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all unit types
router.get('/', async (req, res) => {
  try {
    const unitTypes = await prisma.unitType.findMany({
      orderBy: {
        name: 'asc'
      }
    });

    res.json({
      success: true,
      data: unitTypes
    });
  } catch (error) {
    console.error('Error fetching unit types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unit types'
    });
  }
});

// Get single unit type
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const unitType = await prisma.unitType.findUnique({
      where: { id }
    });

    if (!unitType) {
      return res.status(404).json({
        success: false,
        error: 'Unit type not found'
      });
    }

    res.json({
      success: true,
      data: unitType
    });
  } catch (error) {
    console.error('Error fetching unit type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch unit type'
    });
  }
});

// Create unit type
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Unit type name is required'
      });
    }

    // Check if unit type with same name already exists
    const existingUnitType = await prisma.unitType.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existingUnitType) {
      return res.status(400).json({
        success: false,
        error: 'Unit type with this name already exists'
      });
    }

    const unitType = await prisma.unitType.create({
      data: {
        name: name.trim()
      }
    });

    res.status(201).json({
      success: true,
      data: unitType
    });
  } catch (error) {
    console.error('Error creating unit type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create unit type'
    });
  }
});

// Update unit type
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: 'Unit type name is required'
      });
    }

    // Check if unit type exists
    const existingUnitType = await prisma.unitType.findUnique({
      where: { id }
    });

    if (!existingUnitType) {
      return res.status(404).json({
        success: false,
        error: 'Unit type not found'
      });
    }

    // Check if another unit type with same name exists
    const duplicateUnitType = await prisma.unitType.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        },
        id: {
          not: id
        }
      }
    });

    if (duplicateUnitType) {
      return res.status(400).json({
        success: false,
        error: 'Unit type with this name already exists'
      });
    }

    const updatedUnitType = await prisma.unitType.update({
      where: { id },
      data: {
        name: name.trim()
      }
    });

    res.json({
      success: true,
      data: updatedUnitType
    });
  } catch (error) {
    console.error('Error updating unit type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update unit type'
    });
  }
});

// Delete unit type
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if unit type exists
    const existingUnitType = await prisma.unitType.findUnique({
      where: { id }
    });

    if (!existingUnitType) {
      return res.status(404).json({
        success: false,
        error: 'Unit type not found'
      });
    }

    // Check if unit type is being used in any projects
    const projectUnitTypes = await prisma.projectCategoryUnitType.findMany({
      where: { unitTypeId: id }
    });

    if (projectUnitTypes.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete unit type that is being used in projects'
      });
    }

    await prisma.unitType.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Unit type deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting unit type:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete unit type'
    });
  }
});

export default router;
