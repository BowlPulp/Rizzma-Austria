import { Router, Request, Response } from 'express';
import { Category } from '../models';

const router = Router();

/**
 * GET /api/categories
 * Lists all menu categories ordered for display. Public endpoint.
 */
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 }).lean();
    res.status(200).json({
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error('List categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

export default router;
