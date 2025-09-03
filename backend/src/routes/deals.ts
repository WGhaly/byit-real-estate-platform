import { Router, Request, Response } from 'express';
import { prisma } from '../server';

const router = Router();

// GET /api/deals
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const deals = await prisma.deal.findMany({
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
            developer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: deals,
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ error: 'Failed to fetch deals' });
  }
});

export default router;
