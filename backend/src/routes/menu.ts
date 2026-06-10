import { Router, Request, Response } from 'express';
import { MenuItem } from '../models';

const router = Router();

/**
 * GET /api/menu
 * Lists all available menu items. Public endpoint.
 * Supports optional query params: ?category=pizza&available=true
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, available } = req.query;

    const filter: Record<string, unknown> = {};

    if (category && typeof category === 'string') {
      const validCategories = ['pizza', 'burgers', 'salads'];
      if (!validCategories.includes(category)) {
        res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
        return;
      }
      filter.category = category;
    }

    // By default, only show available items for public route
    if (available === 'false') {
      // Show all items (including unavailable) — useful for admin-like queries
      // but this route is public, so we still allow it
    } else {
      filter.available = true;
    }

    const items = await MenuItem.find(filter).sort({ category: 1, slug: 1 }).lean();

    res.status(200).json({
      count: items.length,
      items,
    });
  } catch (error) {
    console.error('List menu items error:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

/**
 * GET /api/menu/:slug
 * Get a single menu item by its slug. Public endpoint.
 */
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const item = await MenuItem.findOne({ slug }).lean();

    if (!item) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    res.status(200).json({ item });
  } catch (error) {
    console.error('Get menu item error:', error);
    res.status(500).json({ error: 'Failed to fetch menu item' });
  }
});

export default router;
