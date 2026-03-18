import { supabase } from './supabase.js';

/**
 * @typedef {Object} Review
 * @property {string} id
 * @property {string} court_id
 * @property {string} user_id
 * @property {string} booking_id
 * @property {number} rating
 * @property {string} comment
 * @property {string} created_at
 * @property {Object} user
 */

/**
 * Fetch reviews for a court
 * @param {string} courtId
 * @param {number} limit
 * @returns {Promise<{reviews: Review[], average: number}>}
 */
export async function fetchReviewsByCourt(courtId, limit = 10) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, user:profiles!user_id(name)')
    .eq('court_id', courtId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  // Calculate average rating
  const { data: avgData, error: avgError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('court_id', courtId);

  const average = avgData?.length
    ? Number((avgData.reduce((a, b) => a + b.rating, 0) / avgData.length).toFixed(1))
    : 0;

  return {
    reviews: data || [],
    average
  };
}

/**
 * Create a new review
 * @param {Object} review
 * @param {string} review.court_id
 * @param {string} review.booking_id
 * @param {number} review.rating
 * @param {string} review.comment
 * @returns {Promise<Review>}
 */
export async function createReview({ court_id, booking_id, rating, comment }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      court_id,
      booking_id,
      user_id: user.id,
      rating,
      comment
    })
    .select('*, user:profiles!user_id(name)')
    .single();

  if (error) throw new Error(error.message);
  return data;
}

/**
 * Check if user has already reviewed a booking
 * @param {string} bookingId
 * @returns {Promise<boolean>}
 */
export async function hasReviewedBooking(bookingId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data } = await supabase
    .from('reviews')
    .select('id')
    .eq('booking_id', bookingId)
    .single();

  return !!data;
}
