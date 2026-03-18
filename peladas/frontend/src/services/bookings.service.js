import { api } from './api.js';

/**
 * @typedef {Object} Booking
 * @property {string} id
 * @property {string} user_id
 * @property {string} court_id
 * @property {string} booking_date
 * @property {string} time_slot
 * @property {'pending' | 'confirmed' | 'cancelled' | 'completed'} status
 * @property {number} total
 * @property {number} platform_fee
 * @property {number} owner_receives
 * @property {string|null} payment_id
 * @property {string|null} paid_at
 * @property {string} created_at
 * @property {Object} court
 */

/**
 * Create a new booking
 * @param {string} courtId
 * @param {string} date - ISO date (YYYY-MM-DD)
 * @param {string} timeSlot - HH:MM format
 * @returns {Promise<{booking: Booking, preferenceId: string}>}
 */
export async function createBooking(courtId, date, timeSlot) {
  const response = await api.post('/bookings', {
    court_id: courtId,
    date,
    time_slot: timeSlot
  });
  return response;
}

/**
 * Fetch user's bookings
 * @returns {Promise<Booking[]>}
 */
export async function fetchMyBookings() {
  return await api.get('/bookings/my');
}

/**
 * Cancel a booking
 * @param {string} bookingId
 * @returns {Promise<void>}
 */
export async function cancelBooking(bookingId) {
  return await api.patch(`/bookings/${bookingId}/cancel`);
}

/**
 * Get booking by ID
 * @param {string} bookingId
 * @returns {Promise<Booking>}
 */
export async function getBookingById(bookingId) {
  return await api.get(`/bookings/${bookingId}`);
}

/**
 * Check if user can review a booking
 * @param {string} bookingId
 * @returns {Promise<{canReview: boolean}>}
 */
export async function canReviewBooking(bookingId) {
  try {
    await api.get(`/reviews/check/${bookingId}`);
    return { canReview: true };
  } catch (error) {
    return { canReview: false, reason: error.message };
  }
}
