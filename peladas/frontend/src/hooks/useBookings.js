import { useState, useCallback } from 'react';
import {
  createBooking as createBookingService,
  fetchMyBookings as fetchMyBookingsService,
  cancelBooking as cancelBookingService,
  getBookingById as getBookingByIdService
} from '../services/bookings.service.js';

/**
 * Hook for bookings management
 * @returns {{
 *   bookings: Array,
 *   booking: Object|null,
 *   loading: boolean,
 *   error: string|null,
 *   createBooking: Function,
 *   fetchMyBookings: Function,
 *   cancelBooking: Function,
 *   getBookingById: Function
 * }}
 */
export function useBookings() {
  const [bookings, setBookings] = useState([]);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createBooking = useCallback(async (courtId, date, timeSlot) => {
    setLoading(true);
    setError(null);
    try {
      const result = await createBookingService(courtId, date, timeSlot);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMyBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchMyBookingsService();
      setBookings(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      await cancelBookingService(bookingId);
      // Update local state
      setBookings(prev =>
        prev.map(b =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        )
      );
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getBookingById = useCallback(async (bookingId) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getBookingByIdService(bookingId);
      setBooking(result);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    bookings,
    booking,
    loading,
    error,
    createBooking,
    fetchMyBookings,
    cancelBooking,
    getBookingById
  };
}

export default useBookings;
