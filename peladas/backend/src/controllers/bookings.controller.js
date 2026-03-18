import { supabase } from '../services/supabase.js';
import { calculatePricing } from '../utils/pricing.js';

/**
 * Create new booking
 */
export async function createBooking(req, res, next) {
  try {
    const { court_id, date, time_slot } = req.body;
    const userId = req.user.id;

    // Get court details
    const { data: court, error: courtError } = await supabase
      .from('courts')
      .select('price_per_hour')
      .eq('id', court_id)
      .single();

    if (courtError || !court) {
      return res.status(404).json({ message: 'Court not found' });
    }

    // Check if slot is available
    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('court_id', court_id)
      .eq('booking_date', date)
      .eq('time_slot', time_slot)
      .in('status', ['pending', 'confirmed'])
      .single();

    if (existing) {
      return res.status(409).json({ message: 'Time slot already booked' });
    }

    // Calculate pricing
    const pricing = calculatePricing(court.price_per_hour);

    // Create booking
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({
        user_id: userId,
        court_id,
        booking_date: date,
        time_slot,
        status: 'pending',
        total: pricing.total,
        platform_fee: pricing.platformFee,
        owner_receives: pricing.ownerReceives
      })
      .select('*, court:courts(*)')
      .single();

    if (error) throw error;

    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user's bookings
 */
export async function getMyBookings(req, res, next) {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, court:courts(name, address, city)')
      .eq('user_id', req.user.id)
      .order('booking_date', { ascending: false });

    if (error) throw error;

    res.json(data || []);
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel booking
 */
export async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify ownership
    const { data: booking } = await supabase
      .from('bookings')
      .select('user_id, status')
      .eq('id', id)
      .single();

    if (!booking || booking.user_id !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (!['pending', 'confirmed'].includes(booking.status)) {
      return res.status(400).json({ message: 'Booking cannot be cancelled' });
    }

    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    next(error);
  }
}

/**
 * Get booking by ID
 */
export async function getBookingById(req, res, next) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('bookings')
      .select('*, court:courts(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Verify access
    if (data.user_id !== req.user.id && data.court.owner_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
}
