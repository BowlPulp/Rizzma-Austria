import { Request, Response, NextFunction } from 'express';
import { User } from '../models';

/**
 * Admin authorization middleware. Must be used AFTER the `authenticate` middleware.
 * Looks up the user in MongoDB by their Supabase ID and verifies they have the 'admin' role.
 */
export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.sub) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    const user = await User.findOne({ supabaseId: req.user.sub });

    if (!user) {
      res.status(403).json({ error: 'User not found. Please sync your account first.' });
      return;
    }

    if (user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required' });
      return;
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
