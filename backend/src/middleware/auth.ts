import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../server';
import { AdminRole } from '@prisma/client';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: AdminRole;
        type: 'admin' | 'broker';
      };
    }
  }
}

export interface JWTPayload {
  id: string;
  email: string;
  role: AdminRole;
  type: 'admin' | 'broker';
  iat?: number;
  exp?: number;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback-secret'
    ) as JWTPayload;

    // Verify user still exists and is active
    if (decoded.type === 'admin') {
      const user = await prisma.adminUser.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          sessionTokens: true
        }
      });

      if (!user || !user.isActive) {
        res.status(401).json({ error: 'User not found or inactive' });
        return;
      }

      if (!user.sessionTokens.includes(token)) {
        res.status(401).json({ error: 'Token revoked' });
        return;
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        type: 'admin'
      };
    } else {
      // Handle broker authentication if needed
      res.status(401).json({ error: 'Invalid user type' });
      return;
    }

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const requireRole = (roles: AdminRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
      return;
    }

    next();
  };
};

export const requireSuperAdmin = requireRole([AdminRole.SUPER_ADMIN]);
export const requireManagerOrAbove = requireRole([
  AdminRole.SUPER_ADMIN,
  AdminRole.OPERATIONS_MANAGER
]);
export const requireFinanceAccess = requireRole([
  AdminRole.SUPER_ADMIN,
  AdminRole.FINANCE_MANAGER
]);
