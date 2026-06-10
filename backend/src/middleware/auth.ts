import { Request, Response, NextFunction } from 'express';
import { jwtVerify, importSPKI, importX509, errors } from 'jose';

/**
 * Extended JWT payload with Supabase-specific claims.
 */
export interface SupabaseJWTPayload {
  sub: string;
  email?: string;
  role?: string;
  aud?: string;
  exp?: number;
  iat?: number;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
}

/**
 * Extends the Express Request type to include the decoded JWT user payload.
 */
declare global {
  namespace Express {
    interface Request {
      user?: SupabaseJWTPayload;
    }
  }
}

/**
 * Get the secret key for JWT verification.
 * Uses SUPABASE_JWT_SECRET (from Supabase Dashboard → Settings → API → JWT Secret).
 */
function getSecret(): Uint8Array {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) {
    throw new Error(
      'SUPABASE_JWT_SECRET is not defined. Get it from Supabase Dashboard → Settings → API → JWT Secret'
    );
  }
  return new TextEncoder().encode(secret);
}

/**
 * Authentication middleware that verifies Supabase JWT tokens.
 * Extracts the Bearer token from the Authorization header,
 * verifies it using the Supabase JWT secret, and attaches
 * the decoded payload to `req.user`.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header is required' });
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Invalid authorization format. Use: Bearer <token>' });
      return;
    }

    const token = authHeader.substring(7);

    if (!token) {
      res.status(401).json({ error: 'Token is required' });
      return;
    }

    const secret = getSecret();

    const { payload } = await jwtVerify(token, secret);

    if (!payload.sub) {
      res.status(401).json({ error: 'Invalid token: missing subject claim' });
      return;
    }

    req.user = payload as unknown as SupabaseJWTPayload;
    next();
  } catch (error: unknown) {
    if (error instanceof errors.JWTExpired) {
      res.status(401).json({ error: 'Token has expired' });
      return;
    }

    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
