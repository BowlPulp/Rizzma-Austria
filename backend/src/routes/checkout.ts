import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { User, MenuItem, Order, IOrderItem } from '../models';
import stripe from '../config/stripe';
import { generateOrderNumber } from '../utils/generateOrderNumber';

const router = Router();

/** Delivery fee in euros */
const DELIVERY_FEE = 3.90;

interface CheckoutItemInput {
  slug: string;
  name: string;
  price: number;
  quantity: number;
}

/**
 * POST /api/checkout/create-session
 * Creates a Stripe Checkout Session and a pending order in MongoDB.
 * Validates that all items exist and prices match the database.
 */
router.post(
  '/create-session',
  authenticate,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const supabaseUserId = req.user!.sub;
      const { items, type, deliveryAddress, notes, locale } = req.body;

      // --- Validation ---
      if (!items || !Array.isArray(items) || items.length === 0) {
        res.status(400).json({ error: 'Items array is required and must not be empty' });
        return;
      }

      if (!type || !['delivery', 'pickup'].includes(type)) {
        res.status(400).json({ error: 'Type must be either "delivery" or "pickup"' });
        return;
      }

      if (type === 'delivery' && (!deliveryAddress || !deliveryAddress.address)) {
        res.status(400).json({ error: 'Delivery address is required for delivery orders' });
        return;
      }

      // Validate each item
      for (const item of items as CheckoutItemInput[]) {
        if (!item.slug || !item.name || item.price == null || !item.quantity) {
          res.status(400).json({
            error: 'Each item must have slug, name, price, and quantity',
          });
          return;
        }
        if (typeof item.quantity !== 'number' || item.quantity < 1 || !Number.isInteger(item.quantity)) {
          res.status(400).json({ error: `Invalid quantity for item "${item.slug}"` });
          return;
        }
      }

      // --- Verify items exist and prices match ---
      const slugs = (items as CheckoutItemInput[]).map((i) => i.slug);
      const menuItems = await MenuItem.find({
        slug: { $in: slugs },
        available: true,
      }).lean();

      if (menuItems.length !== slugs.length) {
        const foundSlugs = new Set(menuItems.map((m) => m.slug));
        const missingSlugs = slugs.filter((s) => !foundSlugs.has(s));
        res.status(400).json({
          error: 'Some items are unavailable or do not exist',
          missingSlugs,
        });
        return;
      }

      // Build a slug → menu item map
      const menuItemMap = new Map(menuItems.map((m) => [m.slug, m]));

      // Validate prices and build order items
      const orderItems: IOrderItem[] = [];
      for (const item of items as CheckoutItemInput[]) {
        const menuItem = menuItemMap.get(item.slug)!;

        // Price validation: compare to 2 decimal places
        if (Math.abs(menuItem.price - item.price) > 0.01) {
          res.status(400).json({
            error: `Price mismatch for "${item.slug}". Expected €${menuItem.price.toFixed(2)}, got €${item.price.toFixed(2)}`,
          });
          return;
        }

        orderItems.push({
          menuItemId: menuItem._id,
          slug: menuItem.slug,
          name: item.name,
          price: menuItem.price, // Use the database price (source of truth)
          quantity: item.quantity,
        } as IOrderItem);
      }

      // --- Calculate totals ---
      const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const deliveryFee = type === 'delivery' ? DELIVERY_FEE : 0;
      const total = subtotal + deliveryFee;

      // Round to 2 decimal places to avoid floating-point issues
      const roundedSubtotal = Math.round(subtotal * 100) / 100;
      const roundedTotal = Math.round(total * 100) / 100;

      // --- Get/verify MongoDB user ---
      const user = await User.findOne({ supabaseId: supabaseUserId });
      if (!user) {
        res.status(400).json({ error: 'User not found. Please sync your account first.' });
        return;
      }

      // --- Generate order number ---
      const orderNumber = await generateOrderNumber();

      // --- Create Stripe Checkout Session ---
      const lineItems = orderItems.map((item) => ({
        price_data: {
          currency: 'eur',
          product_data: {
            name: item.name,
          },
          unit_amount: Math.round(item.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      }));

      // Add delivery fee as a line item if applicable
      if (type === 'delivery') {
        lineItems.push({
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Delivery Fee',
            },
            unit_amount: Math.round(DELIVERY_FEE * 100),
          },
          quantity: 1,
        });
      }

      const resolvedLocale = locale || 'en';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        metadata: {
          orderId: '', // Will be set after order creation
          userId: user._id.toString(),
          orderNumber,
        },
        success_url: `${process.env.CLIENT_URL}/${resolvedLocale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_URL}/${resolvedLocale}/checkout/cancel`,
        customer_email: user.email,
      });

      // --- Create pending order ---
      const order = await Order.create({
        orderNumber,
        userId: user._id,
        supabaseUserId,
        items: orderItems,
        type,
        deliveryAddress: type === 'delivery' ? deliveryAddress : undefined,
        status: 'pending',
        statusHistory: [
          {
            status: 'pending',
            timestamp: new Date(),
            note: 'Order created, awaiting payment',
          },
        ],
        payment: {
          method: 'stripe',
          stripeSessionId: session.id,
          status: 'pending',
          amount: Math.round(roundedTotal * 100), // Store in cents
        },
        subtotal: roundedSubtotal,
        deliveryFee: Math.round(deliveryFee * 100) / 100,
        total: roundedTotal,
        notes: notes?.trim() || undefined,
      });

      // Update Stripe session metadata with the order ID
      await stripe.checkout.sessions.update(session.id, {
        metadata: {
          orderId: order._id.toString(),
          userId: user._id.toString(),
          orderNumber,
        },
      });

      res.status(201).json({
        url: session.url,
        orderId: order._id.toString(),
        orderNumber,
      });
    } catch (error) {
      console.error('Create checkout session error:', error);
      res.status(500).json({ error: 'Failed to create checkout session' });
    }
  }
);

export default router;
