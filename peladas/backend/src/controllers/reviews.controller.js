import { supabase } from '../services/supabase.js';

/**
 * Get reviews for a court
 */
export async function getReviewsByCourt(req, res, next) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('reviews')
      .select('*, user:profiles!user_id(name)')
      .eq('court_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    next(error);
  }
}

/**
 * Create new review
 */
export async function createReview(req, res, next) {
  try {
    const { court_id, booking_id, rating, comment } = req.body;
    const userId = req.user.id;

    // Verify user has a completed booking for this court
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('court_id', court_id)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .single();

    if (bookingError || !booking) {
      return res.status(403).json({ message: 'Must have a completed booking to review' });
    }

    // Check if already reviewed
    const { data: existing } = await supabase
      .from('reviews')
      .select('id')
      .eq('booking_id', booking_id)
      .single();

    if (existing) {
      return res.status(409).json({ message: 'Already reviewed this booking' });
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        court_id,
        user_id: userId,
        booking_id,
        rating,
        comment
      })
      .select('*, user:profiles!user_id(name)')
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
}
