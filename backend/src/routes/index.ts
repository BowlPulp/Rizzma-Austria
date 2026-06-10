import { Router } from 'express';
import authRoutes from './auth';
import menuRoutes from './menu';
import checkoutRoutes from './checkout';
import orderRoutes from './orders';
import adminRoutes from './admin';

const router = Router();

router.use('/auth', authRoutes);
router.use('/menu', menuRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/orders', orderRoutes);
router.use('/admin', adminRoutes);

export default router;
