import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { Order } from '../models';

const router = Router();

/**
 * GET /api/orders
 * Lists the current user's orders, sorted by date descending.
 * Supports pagination via ?page=1&limit=10
 */
router.get('/', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabaseUserId = req.user!.sub;
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 10));
    const skip = (page - 1) * limit;

    const [orders, totalCount] = await Promise.all([
      Order.find({ supabaseUserId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Order.countDocuments({ supabaseUserId }),
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
    console.error('List orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

/**
 * GET /api/orders/:id
 * Get a single order detail. Verifies the order belongs to the current user.
 */
router.get('/:id', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabaseUserId = req.user!.sub;
    const { id } = req.params;

    const order = await Order.findById(id).lean();

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Verify ownership
    if (order.supabaseUserId !== supabaseUserId) {
      res.status(403).json({ error: 'You do not have access to this order' });
      return;
    }

    res.status(200).json({ order });
  } catch (error: unknown) {
    // Handle invalid ObjectId format
    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid order ID format' });
      return;
    }
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

/**
 * PATCH /api/orders/:id/cancel
 * Cancel an order. Only allowed if status is 'pending' or 'confirmed'.
 */
router.patch('/:id/cancel', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabaseUserId = req.user!.sub;
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    // Verify ownership
    if (order.supabaseUserId !== supabaseUserId) {
      res.status(403).json({ error: 'You do not have access to this order' });
      return;
    }

    // Check if cancellation is allowed
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(order.status)) {
      res.status(400).json({
        error: `Cannot cancel order with status "${order.status}". Only pending or confirmed orders can be cancelled.`,
      });
      return;
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: 'Cancelled by customer',
    });

    await order.save();

    res.status(200).json({
      message: 'Order cancelled successfully',
      order,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'CastError') {
      res.status(400).json({ error: 'Invalid order ID format' });
      return;
    }
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Failed to cancel order' });
  }
});

export default router;
