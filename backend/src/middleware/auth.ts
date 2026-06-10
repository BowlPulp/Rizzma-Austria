import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

export interface SupabaseJWTPayload {
  sub: string;
  email?: string;
  role?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: SupabaseJWTPayload;
    }
  }
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({
        error: 'Missing Authorization header',
      });
      return;
    }

    const token = authHeader.replace('Bearer ', '');

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error('Supabase auth error:', error);

      res.status(401).json({
        error: 'Invalid or expired token',
      });
      return;
    }

    req.user = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);

    res.status(401).json({
      error: 'Authentication failed',
    });
  }
}