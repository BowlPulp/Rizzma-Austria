import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { requireAdmin } from '../middleware/admin';
import { Order, MenuItem, OrderStatus } from '../models';

const router = Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireAdmin);

/**
 * Valid status transitions map.
 * Key = current status, Value = array of statuses it can transition to.
 */
const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['out_for_delivery', 'picked_up', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  picked_up: [],
  cancelled: [],
};

// ===========================
// Order Management
// ===========================

/**
 * GET /api/admin/orders
 * Lists all orders with optional filtering by status and search.
 * Supports pagination: ?status=preparing&page=1&limit=20&search=RZM-20260609
 */
router.get('/orders', async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;
    const { status, search } = req.query;

    const filter: Record<string, unknown> = {};

    if (status && typeof status === 'string') {
      const validStatuses: OrderStatus[] = [
        'pending', 'confirmed', 'preparing', 'ready',
        'out_for_delivery', 'delivered', 'picked_up', 'cancelled',
      ];
      if (!validStatuses.includes(status as OrderStatus)) {
        res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        return;
      }
      filter.status = status;
    }

    if (search && typeof search === 'string') {
      const searchTerm = search.trim();
      if (searchTerm.length > 0) {
        filter.$or = [
          { orderNumber: { $regex: searchTerm, $options: 'i' } },
          { 'items.name': { $regex: searchTerm, $options: 'i' } },
        ];
      }
    }

    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email phone')
        .lean(),
      Order.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Admin list orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/admin/orders/:id
 * Get a single order detail with populated user info.
 */
router.get('/orders/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate('userId', 'name email phone addresses')
      .lean();

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.status(200).json({ order });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid order ID format' });
      return;
    }
    console.error('Admin get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * PATCH /api/admin/orders/:id/status
 * Update an order's status with validation of allowed transitions.
 * Body: { status: 'preparing', note?: 'Starting preparation' }
 */
router.patch('/orders/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status) {
      res.status(400).json({ error: 'Status is required' });
      return;
    }

    const validStatuses: OrderStatus[] = [
      'pending', 'confirmed', 'preparing', 'ready',
      'out_for_delivery', 'delivered', 'picked_up', 'cancelled',
    ];

    if (!validStatuses.includes(status as OrderStatus)) {
      res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Validate status transition
    const allowedTransitions = VALID_STATUS_TRANSITIONS[order.status];
    if (!allowedTransitions.includes(status as OrderStatus)) {
      res.status(400).json({
        error: `Cannot transition from "${order.status}" to "${status}". Allowed transitions: ${allowedTransitions.length > 0 ? allowedTransitions.join(', ') : 'none (terminal state)'}`,
      });
      return;
    }

    order.status = status as OrderStatus;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note?.trim() || undefined,
    });

    await order.save();

    res.status(200).json({
      message: `Order status updated to "${status}"`,
      order,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid order ID format' });
      return;
    }
    console.error('Admin update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// ===========================
// Dashboard Stats
// ===========================

/**
 * GET /api/admin/stats
 * Dashboard statistics: today's orders/revenue, pending orders, total orders.
 */
router.get('/stats', async (_req: Request, res: Response): Promise<void> => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayOrders, todayRevenueResult, pendingOrders, totalOrders] = await Promise.all([
      Order.countDocuments({
        createdAt: { $gte: todayStart, $lte: todayEnd },
        status: { $ne: 'cancelled' },
      }),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: todayStart, $lte: todayEnd },
            'payment.status': 'paid',
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$payment.amount' },
          },
        },
      ]),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments(),
    ]);

    const todayRevenue = todayRevenueResult.length > 0 ? todayRevenueResult[0].total : 0;

    res.status(200).json({
      stats: {
        todayOrders,
        todayRevenue, // In cents
        pendingOrders,
        totalOrders,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ===========================
// Menu Management
// ===========================

/**
 * POST /api/admin/menu
 * Create a new menu item.
 */
router.post('/menu', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug, category, price, image, popular, spicy, vegetarian, available } = req.body;

    // Validation
    if (!slug || !category || price == null || !image) {
      res.status(400).json({ error: 'slug, category, price, and image are required' });
      return;
    }

    const validCategories = ['pizza', 'burgers', 'salads'];
    if (!validCategories.includes(category)) {
      res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
      return;
    }

    if (typeof price !== 'number' || price < 0) {
      res.status(400).json({ error: 'Price must be a non-negative number' });
      return;
    }

    // Check for duplicate slug
    const existing = await MenuItem.findOne({ slug: slug.toLowerCase().trim() });
    if (existing) {
      res.status(409).json({ error: `Menu item with slug "${slug}" already exists` });
      return;
    }

    const menuItem = await MenuItem.create({
      slug: slug.toLowerCase().trim(),
      category,
      price,
      image,
      popular: popular ?? false,
      spicy: spicy ?? false,
      vegetarian: vegetarian ?? false,
      available: available ?? true,
    });

    res.status(201).json({
      message: 'Menu item created successfully',
      item: menuItem,
    });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: 'Failed to create menu item' });
  }
});

/**
 * PATCH /api/admin/menu/:slug
 * Update an existing menu item by slug.
 */
router.patch('/menu/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const { category, price, image, popular, spicy, vegetarian, available } = req.body;

    const updateFields: Record<string, unknown> = {};

    if (category !== undefined) {
      const validCategories = ['pizza', 'burgers', 'salads'];
      if (!validCategories.includes(category)) {
        res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
        return;
      }
      updateFields.category = category;
    }

    if (price !== undefined) {
      if (typeof price !== 'number' || price < 0) {
        res.status(400).json({ error: 'Price must be a non-negative number' });
        return;
      }
      updateFields.price = price;
    }

    if (image !== undefined) {
      if (typeof image !== 'string' || image.trim().length === 0) {
        res.status(400).json({ error: 'Image must be a non-empty string' });
        return;
      }
      updateFields.image = image.trim();
    }

    if (popular !== undefined) updateFields.popular = Boolean(popular);
    if (spicy !== undefined) updateFields.spicy = Boolean(spicy);
    if (vegetarian !== undefined) updateFields.vegetarian = Boolean(vegetarian);
    if (available !== undefined) updateFields.available = Boolean(available);

    if (Object.keys(updateFields).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    const menuItem = await MenuItem.findOneAndUpdate(
      { slug },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!menuItem) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    res.status(200).json({
      message: 'Menu item updated successfully',
      item: menuItem,
    });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Failed to update menu item' });
  }
});

/**
 * DELETE /api/admin/menu/:slug
 * Delete a menu item by slug.
 */
router.delete('/menu/:slug', async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;

    const menuItem = await MenuItem.findOneAndDelete({ slug });

    if (!menuItem) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    res.status(200).json({
      message: 'Menu item deleted successfully',
      item: menuItem,
    });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Failed to delete menu item' });
  }
});

export default router;
