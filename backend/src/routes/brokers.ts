import { Router, Request, Response } from 'express';
import { prisma } from '../server';

const router = Router();

// Placeholder route files - these will be expanded based on requirements
// GET /api/brokers
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const brokers = await prisma.brokerUser.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        kycStatus: true,
        isActive: true,
        totalDeals: true,
        totalCommissions: true,
        createdAt: true,
      },
    });

    // Add computed fullName field
    const brokersWithFullName = brokers.map(broker => ({
      ...broker,
      fullName: `${broker.firstName} ${broker.lastName}`,
    }));

    res.json({
      success: true,
      data: brokersWithFullName,
    });
  } catch (error) {
    console.error('Get brokers error:', error);
    res.status(500).json({ error: 'Failed to fetch brokers' });
  }
});

export default router;
