import { Router, Request, Response } from 'express';
import stripe from '../config/stripe';
import { Order } from '../models';
import Stripe from 'stripe';

const router = Router();

/**
 * POST /api/webhooks/stripe
 * Handles Stripe webhook events. This route uses express.raw() body parser
 * and MUST be registered before express.json() middleware.
 *
 * Handles:
 * - checkout.session.completed → Marks order as paid and confirmed
 * - checkout.session.expired → Marks order as cancelled and payment failed
 */
router.post(
  '/stripe',
  async (req: Request, res: Response): Promise<void> => {
    const sig = req.headers['stripe-signature'];

    if (!sig) {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET is not configured');
      res.status(500).json({ error: 'Webhook secret not configured' });
      return;
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Webhook signature verification failed: ${message}`);
      res.status(400).json({ error: `Webhook Error: ${message}` });
      return;
    }

    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;

          const orderId = session.metadata?.orderId;
          if (!orderId) {
            console.error('No orderId in session metadata');
            break;
          }

          const order = await Order.findById(orderId);
          if (!order) {
            console.error(`Order not found for ID: ${orderId}`);
            break;
          }

          // Update payment status
          order.payment.status = 'paid';
          order.payment.stripePaymentIntentId =
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id;
          order.payment.paidAt = new Date();

          // Update order status to confirmed
          order.status = 'confirmed';
          order.statusHistory.push({
            status: 'confirmed',
            timestamp: new Date(),
            note: 'Payment received via Stripe',
          });

          await order.save();
          console.log(`✅ Order ${order.orderNumber} payment confirmed`);
          break;
        }

        case 'checkout.session.expired': {
          const session = event.data.object as Stripe.Checkout.Session;

          const orderId = session.metadata?.orderId;
          if (!orderId) {
            console.error('No orderId in session metadata for expired session');
            break;
          }

          const order = await Order.findById(orderId);
          if (!order) {
            console.error(`Order not found for expired session, ID: ${orderId}`);
            break;
          }

          // Only update if still pending
          if (order.status === 'pending') {
            order.payment.status = 'failed';
            order.status = 'cancelled';
            order.statusHistory.push({
              status: 'cancelled',
              timestamp: new Date(),
              note: 'Checkout session expired',
            });

            await order.save();
            console.log(`⚠️ Order ${order.orderNumber} cancelled due to expired session`);
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook handler error:', error);
      res.status(500).json({ error: 'Webhook handler failed' });
    }
  }
);

export default router;
