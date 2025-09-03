import { Router, Request, Response } from 'express';
import { prisma } from '../server';

const router = Router();

// GET /api/commissions
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const commissions = await prisma.commission.findMany({
      include: {
        deal: {
          include: {
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
        },
        broker: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: commissions,
    });
  } catch (error) {
    console.error('Get commissions error:', error);
    res.status(500).json({ error: 'Failed to fetch commissions' });
  }
});

export default router;
