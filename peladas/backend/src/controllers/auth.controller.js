import { supabase } from '../services/supabase.js';

/**
 * Get current user
 */
export async function getCurrentUser(req, res, next) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    res.json({
      user: {
        ...user,
        profile
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, phone, avatar_url } = req.body;

    const { data, error } = await supabase
      .from('profiles')
      .update({ name, phone, avatar_url })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
}
