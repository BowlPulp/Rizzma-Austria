import { Router, Request, Response } from 'express';
import { User } from '../models';
import { authenticate } from '../middleware/auth';

const router = Router();

/**
 * POST /api/auth/sync
 * Syncs a Supabase user to MongoDB after signup/login.
 * Creates a new user record if one doesn't exist, or updates the existing one.
 */
router.post('/sync', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabaseId = req.user!.sub;
    const { name, email } = req.body;

    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required' });
      return;
    }

    if (typeof name !== 'string' || typeof email !== 'string') {
      res.status(400).json({ error: 'Name and email must be strings' });
      return;
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedName.length === 0) {
      res.status(400).json({ error: 'Name cannot be empty' });
      return;
    }

    // Upsert: find by supabaseId, create if not found
    const user = await User.findOneAndUpdate(
      { supabaseId },
      {
        $setOnInsert: {
          supabaseId,
          role: 'customer',
          addresses: [],
        },
        $set: {
          name: trimmedName,
          email: trimmedEmail,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      message: 'User synced successfully',
      user: {
        id: user._id,
        supabaseId: user.supabaseId,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
      },
    });
  } catch (error: unknown) {
    console.error('Auth sync error:', error);

    // Handle duplicate key errors (email already exists for another user)
    if (error instanceof Error && 'code' in error && (error as { code: number }).code === 11000) {
      res.status(409).json({ error: 'A user with this email already exists' });
      return;
    }

    res.status(500).json({ error: 'Failed to sync user' });
  }
});

/**
 * GET /api/auth/profile
 * Returns the current authenticated user's profile from MongoDB.
 */
router.get('/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabaseId = req.user!.sub;
    const user = await User.findOne({ supabaseId });

    if (!user) {
      res.status(404).json({ error: 'User profile not found. Please sync your account first.' });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        supabaseId: user.supabaseId,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

/**
 * PATCH /api/auth/profile
 * Updates the current user's profile fields (name, phone, addresses).
 */
router.patch('/profile', authenticate, async (req: Request, res: Response): Promise<void> => {
  try {
    const supabaseId = req.user!.sub;
    const { name, phone, addresses } = req.body;

    const updateFields: Record<string, unknown> = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        res.status(400).json({ error: 'Name must be a non-empty string' });
        return;
      }
      updateFields.name = name.trim();
    }

    if (phone !== undefined) {
      if (phone !== null && typeof phone !== 'string') {
        res.status(400).json({ error: 'Phone must be a string or null' });
        return;
      }
      updateFields.phone = phone === null ? undefined : phone.trim();
    }

    if (addresses !== undefined) {
      if (!Array.isArray(addresses)) {
        res.status(400).json({ error: 'Addresses must be an array' });
        return;
      }

      // Validate each address
      for (const addr of addresses) {
        if (!addr.label || !addr.address) {
          res.status(400).json({ error: 'Each address must have a label and address' });
          return;
        }
      }

      // Ensure at most one default address
      const defaults = addresses.filter((a: { isDefault?: boolean }) => a.isDefault);
      if (defaults.length > 1) {
        res.status(400).json({ error: 'Only one address can be set as default' });
        return;
      }

      updateFields.addresses = addresses;
    }

    if (Object.keys(updateFields).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    const user = await User.findOneAndUpdate(
      { supabaseId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found. Please sync your account first.' });
      return;
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        supabaseId: user.supabaseId,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        addresses: user.addresses,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
