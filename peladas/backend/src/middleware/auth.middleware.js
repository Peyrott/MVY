import { supabase } from '../services/supabase.js';

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
export async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    req.user = {
      ...user,
      profile: profile || null
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * Require owner role middleware
 */
export function requireOwner(req, res, next) {
  if (!req.user?.profile?.is_owner) {
    return res.status(403).json({ message: 'Forbidden - Owner access required' });
  }
  next();
}
